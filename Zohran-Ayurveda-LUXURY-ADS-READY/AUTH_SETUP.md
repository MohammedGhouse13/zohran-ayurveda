# Zohran Ayurveda — Customer Login

The storefront now shows a required, premium login popup to unauthenticated customers. Existing sessions are remembered, so customers do not need to log in on every page load.

## Included
- Continue with Google
- Continue with Microsoft
- Email + password sign-in
- Email account creation
- Mobile number + SMS OTP
- OAuth callback at `/auth/callback`
- Admin routes remain separate and are not blocked by the customer popup

## One-time Supabase configuration
1. In Supabase Authentication → Providers, enable **Google** and **Azure (Microsoft)** and enter the provider credentials.
2. In Supabase Authentication → Providers, enable **Phone** and configure an SMS provider.
3. In Supabase Authentication → URL Configuration, add your site URL and callback URL:
   - `http://localhost:3000/auth/callback` for local testing
   - `https://YOUR-DOMAIN/auth/callback` for production

The application reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the browser. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## Run
```powershell
npm install
npm run dev
```
Then open `http://localhost:3000`.

> SMS OTP cannot work in a real production environment until a supported SMS provider is configured in Supabase. Google/Microsoft also require their OAuth apps to be configured once.
