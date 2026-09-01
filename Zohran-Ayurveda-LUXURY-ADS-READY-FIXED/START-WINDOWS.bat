@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo.
echo =============================================
echo   ZOHRAN AYURVEDA - LUXURY LAUNCH
 echo =============================================
echo.
if not exist .env.local (
  echo .env.local is missing.
  echo Copy .env.example to .env.local and add your Supabase credentials.
  echo.
  pause
  exit /b 1
)
if not exist node_modules (
  echo [1/3] Installing dependencies...
  call npm install
  if errorlevel 1 goto :fail
) else echo [1/3] Dependencies ready.
if not exist supabase\.temp\project-ref (
  echo [2/3] Linking Supabase from your project URL...
  for /f "tokens=1,* delims==" %%A in ('findstr /B "NEXT_PUBLIC_SUPABASE_URL=" .env.local') do set "SUPAURL=%%B"
  for /f "tokens=3 delims=/" %%A in ("%SUPAURL%") do set "SUPAREF=%%A"
  if defined SUPAREF call npx supabase link --project-ref %SUPAREF%
  if defined SUPAREF call npx supabase db push --include-seed
  if errorlevel 1 goto :fail
) else echo [2/3] Supabase link already present.
echo [3/3] Starting website...
start "Zohran Ayurveda" cmd /c "npm run dev"
timeout /t 4 /nobreak >nul
start "" http://localhost:3000
echo.
echo Store: http://localhost:3000
echo Admin login: http://localhost:3000/login
echo.
pause
exit /b 0
:fail
echo.
echo Launch stopped. Read the message above.
pause
exit /b 1
