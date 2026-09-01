# Zohran Ayurveda — Fast Deployment Steps

## GitHub
git init
git add .
git commit -m "Initial Zohran Ayurveda launch"
git branch -M main
git remote add origin YOUR_GITHUB_REPO
git push -u origin main

## Local env
cp .env.example .env.local
# fill the Supabase + Razorpay values

npm install
npm run build
npm run dev

## Vercel
1. Import the GitHub repo.
2. Framework: Next.js.
3. Add `.env.example` variables in Vercel Project Settings.
4. Deploy.

## Environment variables
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_BUSINESS_EMAIL

Never commit `.env.local`.
