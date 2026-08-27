# Zohran Ayurveda — Final Launch Checklist

## Local
- [ ] Run `START-WINDOWS.bat` or `npm run launch:setup`
- [ ] Confirm homepage
- [ ] Confirm product images
- [ ] Confirm cart drawer and persistent cart
- [ ] Confirm checkout validation
- [ ] Configure Razorpay test keys
- [ ] Complete a test payment
- [ ] Confirm order appears in Admin → Orders
- [ ] Confirm stock decreases after captured payment
- [ ] Confirm webhook endpoint

## Admin
- [ ] Add/edit/delete product
- [ ] Upload product image
- [ ] Set price
- [ ] Set stock
- [ ] Publish/unpublish
- [ ] Check low-stock alert
- [ ] Update order status

## Production
- [ ] Add Vercel environment variables
- [ ] Set live `NEXT_PUBLIC_SITE_URL`
- [ ] Configure Razorpay live keys
- [ ] Configure Razorpay webhook secret
- [ ] Configure custom domain
- [ ] Replace legal placeholders
- [ ] Verify product claims and packaging details
- [ ] Verify shipping/returns/refunds
- [ ] Run a small real order after go-live
