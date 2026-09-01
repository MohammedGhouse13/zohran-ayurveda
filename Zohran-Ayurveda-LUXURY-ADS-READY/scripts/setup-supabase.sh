#!/usr/bin/env bash
set -euo pipefail

echo "================================================="
echo " ZOHRAN AYURVEDA - ONE CLICK LAUNCH SETUP"
echo "================================================="
echo "This wizard creates the hosted Supabase project, schema, storage, seed data and local environment file."

command -v node >/dev/null || { echo "Node.js 20+ is required."; exit 1; }
npm install
npx supabase login

mapfile -t ORGS < <(npx supabase orgs list --output json | node -e 'let d="";process.stdin.on("data",x=>d+=x).on("end",()=>{for(const x of JSON.parse(d)) console.log(`${x.id}\t${x.name}`)})')
[ "${#ORGS[@]}" -gt 0 ] || { echo "No Supabase organization found."; exit 1; }
for i in "${!ORGS[@]}"; do echo "[$i] ${ORGS[$i]}"; done
read -rp "Choose organization [0]: " IDX; IDX=${IDX:-0}
ORG_ID="${ORGS[$IDX]%%$'\t'*}"
read -rp "Project name [Zohran Ayurveda]: " PROJECT; PROJECT=${PROJECT:-Zohran Ayurveda}
read -rp "Region [ap-south-1]: " REGION; REGION=${REGION:-ap-south-1}
read -rsp "New Supabase database password: " DBPASS; echo

CREATED=$(npx supabase projects create "$PROJECT" --org-id "$ORG_ID" --db-password "$DBPASS" --region "$REGION" --output json)
REF=$(node -e 'console.log(JSON.parse(process.argv[1]).id)' "$CREATED")
npx supabase link --project-ref "$REF" --password "$DBPASS"
npx supabase db push --include-seed
KEYS=$(npx supabase projects api-keys --project-ref "$REF" --output json)
URL="https://${REF}.supabase.co"
ANON=$(node -e 'const d=JSON.parse(process.argv[1]); const x=d.find(a=>a.name==="anon"||a.name==="publishable"); console.log(x.api_key)' "$KEYS")
SERVICE=$(node -e 'const d=JSON.parse(process.argv[1]); const x=d.find(a=>a.name==="service_role"); console.log(x.api_key)' "$KEYS")

read -rp "Admin email [admin@zohranayurveda.com]: " ADMIN_EMAIL; ADMIN_EMAIL=${ADMIN_EMAIL:-admin@zohranayurveda.com}
read -rsp "Admin password: " ADMIN_PASS; echo
cat > .env.local <<EOFENV
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=$URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$ANON
SUPABASE_SERVICE_ROLE_KEY=$SERVICE
NEXT_PUBLIC_WHATSAPP_NUMBER=919845035769
NEXT_PUBLIC_BUSINESS_EMAIL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
EOFENV
node ./scripts/create-admin.mjs "$ADMIN_EMAIL" "$ADMIN_PASS"
read -rp "Razorpay Key ID (optional): " RZID
read -rp "Razorpay Key Secret (optional): " RZSECRET
read -rp "Razorpay Webhook Secret (optional): " RZWEBHOOK
read -rp "Live site URL (optional): " SITE
SITE=${SITE:-http://localhost:3000}
python3 - "$SITE" "$RZID" "$RZSECRET" "$RZWEBHOOK" <<'PY'
from pathlib import Path
import sys
p=Path('.env.local')
s=p.read_text()
s=s.replace('NEXT_PUBLIC_SITE_URL=http://localhost:3000',f'NEXT_PUBLIC_SITE_URL={sys.argv[1]}')
s=s.replace('RAZORPAY_KEY_ID=',f'RAZORPAY_KEY_ID={sys.argv[2]}')
s=s.replace('RAZORPAY_KEY_SECRET=',f'RAZORPAY_KEY_SECRET={sys.argv[3]}')
s=s.replace('RAZORPAY_WEBHOOK_SECRET=',f'RAZORPAY_WEBHOOK_SECRET={sys.argv[4]}')
s=s.replace('NEXT_PUBLIC_RAZORPAY_KEY_ID=',f'NEXT_PUBLIC_RAZORPAY_KEY_ID={sys.argv[2]}')
p.write_text(s)
PY

echo "Setup complete. Run: npm run dev"
