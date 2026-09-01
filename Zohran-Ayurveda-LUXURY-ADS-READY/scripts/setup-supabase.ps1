$ErrorActionPreference = "Stop"

function Write-Section($text) { Write-Host "`n$text" -ForegroundColor Cyan }
function Read-Optional($label) { $v = Read-Host $label; if ([string]::IsNullOrWhiteSpace($v)) { return "" }; return $v.Trim() }

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host " ZOHRAN AYURVEDA - ONE CLICK LAUNCH SETUP" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "This wizard creates the hosted Supabase project, schema, storage, seed data, admin account, and local environment file." -ForegroundColor Gray
Write-Host "Razorpay keys are optional during setup and can be added later before accepting live payments." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 20+ is required." }

Write-Section "[1/7] Installing project dependencies"
npm install

Write-Section "[2/7] Supabase authentication"
npx supabase login

Write-Section "[3/7] Choosing your Supabase organization"
# Different Supabase CLI versions format `orgs list --output json` differently.
# We deliberately extract the organization IDs defensively and keep the menu
# selection numeric, so entering 0/1 always works.
$orgJson = (npx supabase orgs list --output json | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($orgJson)) { throw "Supabase returned an empty organization list." }

# First try structured JSON. If the CLI returns an unusual object shape,
# fall back to extracting 20-character Supabase reference IDs from the raw JSON.
$orgCandidates = @()
try {
  $parsed = $orgJson | ConvertFrom-Json
  $nodes = @($parsed)
  if ($parsed.PSObject.Properties.Name -contains 'organizations') { $nodes += @($parsed.organizations) }
  if ($parsed.PSObject.Properties.Name -contains 'data') { $nodes += @($parsed.data) }
  if ($parsed.PSObject.Properties.Name -contains 'results') { $nodes += @($parsed.results) }
  foreach ($node in $nodes) {
    foreach ($item in @($node)) {
      if ($null -eq $item) { continue }
      $id = $null; $orgName = $null
      if ($item.PSObject.Properties.Name -contains 'id') { $id = [string]$item.id }
      if ($item.PSObject.Properties.Name -contains 'name') { $orgName = [string]$item.name }
      if ($id -match '^[a-z0-9]{20}$') {
        $orgCandidates += [pscustomobject]@{ id=$id; name=($(if($orgName){$orgName}else{$id})) }
      }
    }
  }
} catch { }

# Fallback: find every 20-character reference in the JSON and use the first
# one as the organization. This also handles CLIs that return column arrays.
if ($orgCandidates.Count -eq 0) {
  $ids = [regex]::Matches($orgJson, '(?<![A-Za-z0-9])[a-z0-9]{20}(?![A-Za-z0-9])') | ForEach-Object { $_.Value } | Select-Object -Unique
  foreach ($id in $ids) { $orgCandidates += [pscustomobject]@{ id=$id; name=$id } }
}

if ($orgCandidates.Count -eq 0) {
  throw "No Supabase organization ID was found. Run 'npx supabase orgs list' to verify your login."
}

for ($i=0; $i -lt $orgCandidates.Count; $i++) {
  Write-Host "[$i] $($orgCandidates[$i].name)  ($($orgCandidates[$i].id))"
}
$orgChoice = Read-Optional "Choose organization [0]"
if ($orgChoice -eq "") { $orgChoice = "0" }

$org = $null
if ($orgChoice -match '^\d+$') {
  $idx = [int]$orgChoice
  if ($idx -ge 0 -and $idx -lt $orgCandidates.Count) { $org = $orgCandidates[$idx] }
} else {
  $org = $orgCandidates | Where-Object {
    $_.id -eq $orgChoice -or $_.name -eq $orgChoice -or $_.name -like "*$orgChoice*"
  } | Select-Object -First 1
}

if (-not $org) {
  throw "Invalid organization selection '$orgChoice'. Enter the menu number (for example 0), the organization name, or its ID."
}
Write-Host "Selected organization: $($org.name) ($($org.id))" -ForegroundColor Green

$name = Read-Optional "Project name [Zohran Ayurveda]"; if ($name -eq "") { $name = "Zohran Ayurveda" }
$region = Read-Optional "Region [ap-south-1]"; if ($region -eq "") { $region = "ap-south-1" }
$dbSecure = Read-Host "New Supabase database password" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbSecure)
$dbPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
if ($dbPassword.Length -lt 8) { throw "Database password must be at least 8 characters." }

Write-Section "[4/7] Creating and configuring the hosted database"
$createdRaw = npx supabase projects create $name --org-id $org.id --db-password $dbPassword --region $region --output json
$created = $createdRaw | ConvertFrom-Json
$ref = $created.id
if ([string]::IsNullOrWhiteSpace($ref)) { throw "Project creation did not return a project reference." }
Write-Host "Created project: $ref" -ForegroundColor Green
npx supabase link --project-ref $ref --password $dbPassword
npx supabase db push --include-seed

Write-Section "[5/7] Fetching API keys"
$keysRaw = npx supabase projects api-keys --project-ref $ref --output json
$keys = @($keysRaw | ConvertFrom-Json)
$anonObj = $keys | Where-Object { $_.name -eq "anon" -or $_.name -eq "publishable" } | Select-Object -First 1
$serviceObj = $keys | Where-Object { $_.name -eq "service_role" } | Select-Object -First 1
if (-not $anonObj -or -not $serviceObj) { throw "Could not retrieve Supabase API keys." }
$url = "https://$ref.supabase.co"

Write-Section "[6/7] Creating the first admin account"
@"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=$url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$($anonObj.api_key)
SUPABASE_SERVICE_ROLE_KEY=$($serviceObj.api_key)
NEXT_PUBLIC_WHATSAPP_NUMBER=919845035769
NEXT_PUBLIC_BUSINESS_EMAIL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
"@ | Set-Content -Path ".env.local" -Encoding UTF8

$adminEmail = Read-Optional "Admin email [admin@zohranayurveda.com]"; if ($adminEmail -eq "") { $adminEmail = "admin@zohranayurveda.com" }
$adminSecure = Read-Host "Admin password (minimum 8 characters)" -AsSecureString
$aptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminSecure)
$adminPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($aptr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($aptr)
if ($adminPassword.Length -lt 8) { throw "Admin password must be at least 8 characters." }
node ./scripts/create-admin.mjs $adminEmail $adminPassword

Write-Section "[7/7] Optional Razorpay configuration"
$rzId = Read-Optional "Razorpay Key ID (leave blank to configure later)"
$rzSecret = Read-Optional "Razorpay Key Secret (leave blank to configure later)"
$rzWebhook = Read-Optional "Razorpay Webhook Secret (leave blank to configure later)"
$site = Read-Optional "Live site URL (leave blank for http://localhost:3000)"; if ($site -eq "") { $site = "http://localhost:3000" }

$env = @"
NEXT_PUBLIC_SITE_URL=$site
NEXT_PUBLIC_SUPABASE_URL=$url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$($anonObj.api_key)
SUPABASE_SERVICE_ROLE_KEY=$($serviceObj.api_key)
NEXT_PUBLIC_WHATSAPP_NUMBER=919845035769
NEXT_PUBLIC_BUSINESS_EMAIL=
RAZORPAY_KEY_ID=$rzId
RAZORPAY_KEY_SECRET=$rzSecret
RAZORPAY_WEBHOOK_SECRET=$rzWebhook
NEXT_PUBLIC_RAZORPAY_KEY_ID=$rzId
"@
$env | Set-Content -Path ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host " ZOHRAN AYURVEDA SETUP COMPLETE" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "Supabase: $url"
Write-Host "Admin:    $adminEmail"
Write-Host ""
Write-Host "Run: npm run dev" -ForegroundColor Yellow
Write-Host "Store: http://localhost:3000"
Write-Host "Admin: http://localhost:3000/admin"
Write-Host ""
if ([string]::IsNullOrWhiteSpace($rzId) -or [string]::IsNullOrWhiteSpace($rzSecret)) {
  Write-Host "Razorpay is not configured yet. Payments will remain disabled until keys are added to .env.local." -ForegroundColor Yellow
}
