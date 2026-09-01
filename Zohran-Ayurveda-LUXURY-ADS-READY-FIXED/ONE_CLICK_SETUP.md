# One-click launch

1. Extract this folder.
2. Keep your `.env.local` with Supabase URL + publishable key and server secrets. If you already have one from the previous Zohran build, copy it here.
3. Double-click `START-WINDOWS.bat`.

The launcher intentionally does not create or discover Supabase projects. It never calls the removed API-key endpoint. Your existing Supabase project is reused.

For real payments, Razorpay still requires merchant keys. For Google/Microsoft/mobile OTP, configure those providers once in Supabase Auth; these credentials cannot safely be bundled in a portable ZIP.
