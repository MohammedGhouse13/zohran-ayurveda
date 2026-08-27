create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null default 'Wellness',
  description text,
  long_description text,
  image_url text,
  price_paise integer not null default 0 check (price_paise >= 0),
  compare_at_price_paise integer check (compare_at_price_paise is null or compare_at_price_paise >= 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products(is_active);
create index if not exists products_category_idx on public.products(category);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('ZA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  status text not null default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled','payment_failed','payment_review')),
  payment_status text not null default 'created' check (payment_status in ('created','authorized','captured','failed','refunded')),
  total_paise integer not null check (total_paise >= 0),
  shipping_paise integer not null default 0 check (shipping_paise >= 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders(created_at desc);
create unique index if not exists orders_razorpay_order_idx on public.orders(razorpay_order_id) where razorpay_order_id is not null;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  unit_price_paise integer not null,
  quantity integer not null check (quantity > 0),
  line_total_paise integer not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
for each row execute function public.touch_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products for select
using (is_active = true);

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products for all
to authenticated
using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders for select
to authenticated
using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
on public.order_items for select
to authenticated
using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create or replace function public.create_pending_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address_line1 text,
  p_address_line2 text,
  p_city text,
  p_state text,
  p_postal_code text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_total integer := 0;
  v_qty integer;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(1, (v_item->>'quantity')::integer);
    select * into v_product
      from public.products
     where id = (v_item->>'product_id')::uuid and is_active = true;

    if not found then
      raise exception 'Product unavailable';
    end if;

    if v_product.price_paise <= 0 then
      raise exception 'Product price not configured';
    end if;

    v_total := v_total + (v_product.price_paise * v_qty);
  end loop;

  insert into public.orders(
    total_paise, customer_name, customer_email, customer_phone,
    address_line1, address_line2, city, state, postal_code
  ) values (
    v_total, p_customer_name, p_customer_email, p_customer_phone,
    p_address_line1, p_address_line2, p_city, p_state, p_postal_code
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(1, (v_item->>'quantity')::integer);
    select * into v_product from public.products where id=(v_item->>'product_id')::uuid;
    insert into public.order_items(order_id,product_id,product_name,unit_price_paise,quantity,line_total_paise)
    values(v_order.id,v_product.id,v_product.name,v_product.price_paise,v_qty,v_product.price_paise*v_qty);
  end loop;

  return v_order;
end; $$;

create or replace function public.mark_order_paid(
  p_order_id uuid,
  p_payment_id text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item record;
  v_product public.products;
begin
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if v_order.status = 'paid' then
    return v_order;
  end if;

  for v_item in select * from public.order_items where order_id=p_order_id
  loop
    select * into v_product from public.products where id=v_item.product_id for update;
    if not found then
      raise exception 'Product missing';
    end if;
    if v_product.stock_qty < v_item.quantity then
      update public.orders
      set status='payment_review', payment_status='authorized', razorpay_payment_id=p_payment_id
      where id=p_order_id returning * into v_order;
      return v_order;
    end if;
  end loop;

  for v_item in select * from public.order_items where order_id=p_order_id
  loop
    update public.products
       set stock_qty = stock_qty - v_item.quantity
     where id=v_item.product_id;
  end loop;

  update public.orders
     set status='paid', payment_status='captured', razorpay_payment_id=p_payment_id
   where id=p_order_id
  returning * into v_order;

  return v_order;
end; $$;

revoke all on function public.create_pending_order(text,text,text,text,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.create_pending_order(text,text,text,text,text,text,text,text,jsonb) to service_role;

revoke all on function public.mark_order_paid(uuid,text) from public, anon, authenticated;
grant execute on function public.mark_order_paid(uuid,text) to service_role;

-- Storage bucket for product images. Create it in Storage if the insert below is not permitted
-- by your project configuration.
insert into storage.buckets (id, name, public)
values ('product-images','product-images',true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
using (bucket_id='product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id='product-images' and (auth.jwt()->'app_metadata'->>'role')='admin');
