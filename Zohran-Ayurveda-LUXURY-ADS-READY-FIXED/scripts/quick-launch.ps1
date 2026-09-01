$ErrorActionPreference = "Stop"
$projectRef = "sxmenvxxdpdybxcrzafb"
$projectUrl = "https://$projectRef.supabase.co"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host " ZOHRAN AYURVEDA - QUICK LAUNCH" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host "This launcher REUSES the existing Zohran Ayurveda Supabase project." -ForegroundColor Gray
Write-Host "It does not create another project or ask for a database password." -ForegroundColor Gray

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is required. Install Node.js LTS and run this again." }

Write-Host "`n[1/3] Installing website dependencies..." -ForegroundColor Cyan
npm install --no-audit --no-fund

Write-Host "`n[2/3] Connecting to existing Supabase project..." -ForegroundColor Cyan
try {
  $keysRaw = npx supabase projects api-keys --project-ref $projectRef --output json 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { throw $keysRaw }
  $keys = $keysRaw | ConvertFrom-Json
} catch {
  Write-Host "Supabase login is required (only if this PC is not already logged in)." -ForegroundColor Yellow
  npx supabase login
  $keysRaw = npx supabase projects api-keys --project-ref $projectRef --output json | Out-String
  $keys = $keysRaw | ConvertFrom-Json
}

$items = @()
if ($keys -is [System.Array]) { $items = @($keys) }
elseif ($keys.PSObject.Properties.Name -contains 'data') { $items = @($keys.data) }
else { $items = @($keys) }
$anon = $items | Where-Object { $_.name -in @('publishable','anon') -or $_.type -in @('publishable','anon') } | Select-Object -First 1
$service = $items | Where-Object { $_.name -eq 'service_role' -or $_.type -eq 'service_role' } | Select-Object -First 1
if (-not $anon -or -not $service) {
  throw "Could not retrieve Supabase API keys. Open the Supabase project and confirm your CLI login, then rerun START-WINDOWS.bat."
}
$anonKey = if ($anon.api_key) { $anon.api_key } elseif ($anon.key) { $anon.key } else { $anon.value }
$serviceKey = if ($service.api_key) { $service.api_key } elseif ($service.key) { $service.key } else { $service.value }

@"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=$projectUrl
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey
NEXT_PUBLIC_WHATSAPP_NUMBER=919845035769
NEXT_PUBLIC_BUSINESS_EMAIL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
"@ | Set-Content -Path ".env.local" -Encoding UTF8

Write-Host "Supabase connected: $projectUrl" -ForegroundColor Green
Write-Host "Existing database, products and admin account are being reused." -ForegroundColor Green

Write-Host "`n[3/3] Starting Zohran Ayurveda..." -ForegroundColor Cyan
npm run dev
