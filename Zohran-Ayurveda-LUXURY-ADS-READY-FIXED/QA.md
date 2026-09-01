# QA

## Public store
- Home page loads
- Logo and founder image load
- Product cards load
- Filters work
- Product detail modal works
- Cart count updates
- Checkout blocks zero-priced products server-side
- Customer validation works

## Admin
- Unauthenticated admin route redirects to login
- Supabase admin user can access dashboard
- Non-admin authenticated user must not be allowed by RLS
- Product insert works
- Order list is visible to admin

## Payment
- Razorpay order is created server-side
- `razorpay_order_id` saved in database
- Signature is verified server-side
- `mark_order_paid` updates status and decrements inventory
- Webhook signature is verified
- Repeated webhook does not double-decrement because already-paid orders return early

## Before live
- Replace all 0 prices
- Replace all 0 stock quantities
- Add final business policies
- Test live webhook
- Perform a real low-value transaction
