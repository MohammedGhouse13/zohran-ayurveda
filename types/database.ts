export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  price_paise: number;
  compare_at_price_paise: number | null;
  stock_qty: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_paise: number;
  shipping_paise: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  user_id?: string | null;
  subtotal_paise?: number;
  discount_paise?: number;
  coupon_code?: string | null;
  created_at: string;
};
