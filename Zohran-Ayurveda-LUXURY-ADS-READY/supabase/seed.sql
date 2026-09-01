insert into public.products (slug,name,category,description,image_url,price_paise,compare_at_price_paise,stock_qty,is_active)
values
('z-vericos-veins','Z-Vericos Veins Syrup','Wellness','Ayurvedic syrup product creative supplied by the brand.','/products/z-vericos-veins.png',149900,179900,25,true),
('z-joint-ortho-oil','Z-Joint Ortho Oil','Joint & Pain','Herbal pain oil product creative supplied by the brand.','/products/z-joint-ortho-oil.png',79900,99900,25,true),
('z-joint-care','Z-Joint Care Syrup','Joint & Pain','Ayurvedic joint-care syrup product creative supplied by the brand.','/products/z-joint-care.png',129900,149900,25,true),
('z-vical','Z-Vical Capsules','Joint & Pain','Ayurvedic cervical-care capsule product creative supplied by the brand.','/products/z-vical.png',99900,119900,25,true),
('z-lysis','Z-Lysis Capsules','Wellness','Ayurvedic wellness capsule product creative supplied by the brand.','/products/z-lysis.png',89900,109900,25,true),
('z-fair-beauty','Z-Fair & Beauty','Beauty','Skin-care cream product creative supplied by the brand.','/products/z-fair-beauty.png',69900,84900,25,true),
('z-uric-care','Z-Uric Care Capsules','Wellness','Ayurvedic capsule product creative supplied by the brand.','/products/z-uric-care.png',109900,129900,25,true)
on conflict (slug) do update set name=excluded.name,category=excluded.category,description=excluded.description,image_url=excluded.image_url,price_paise=excluded.price_paise,compare_at_price_paise=excluded.compare_at_price_paise,stock_qty=excluded.stock_qty,is_active=true;

insert into public.coupons(code,description,discount_type,discount_value,min_order_paise,max_discount_paise,premium_only,active)
values ('WELCOME10','10% welcome saving','percent',10,0,100000,false,true),('PREMIUM15','Premium member 15% saving','percent',15,500000,200000,true,true)
on conflict (code) do update set description=excluded.description,discount_type=excluded.discount_type,discount_value=excluded.discount_value,min_order_paise=excluded.min_order_paise,max_discount_paise=excluded.max_discount_paise,premium_only=excluded.premium_only,active=true;
