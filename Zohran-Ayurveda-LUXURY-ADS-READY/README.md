# Zohran Ayurveda — Luxury Commerce Edition

Premium storefront + separate admin operations for products, inventory, coupons, loyalty, orders and brand journal.

## Launch in 3 steps
1. Extract the ZIP.
2. Copy `.env.example` to `.env.local` and add your Supabase URL/publishable key + server secret. Add Razorpay keys only when you are ready for live payments.
3. Run `npm install` once, then `npm run dev`.

The app includes a customer login gate, Google/Microsoft/mobile OTP/email auth UI, persistent cart, quick view with zoom, MRP/sale pricing, coupon discounts, premium membership based on ₹10,000 monthly spend, customer account/recent purchases, journal/blog CMS, product image uploads, inventory, orders and separate admin navigation.

OAuth providers and SMS OTP still require the provider credentials in your own Supabase project; this is a provider security requirement and cannot be bundled into a portable ZIP.
