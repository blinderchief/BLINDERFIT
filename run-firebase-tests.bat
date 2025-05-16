@echo off
echo ========================================
echo BlinderFit Firebase Functions Test Suite
echo ========================================
echo.

cd %~dp0

echo Testing options:
echo.
echo 1. Test with deployed functions (production)
echo 2. Test with emulator (local development)
echo 3. Comprehensive tests (multiple methods)
echo 4. Fix and deploy functions
echo 5. Exit
echo.

set /p choice=Enter your choice (1-5): 

if "%choice%"=="1" goto TestProduction
if "%choice%"=="2" goto TestEmulator
if "%choice%"=="3" goto ComprehensiveTests
if "%choice%"=="4" goto FixAndDeploy
if "%choice%"=="5" goto End

:TestProduction
echo.
echo Testing with deployed functions...
echo.
cd functions
node verify-functions.js
cd ..
goto End

:TestEmulator
echo.
echo Starting Functions emulator...
echo.
start "Firebase Emulator" cmd /c "firebase emulators:start --only functions"

echo.
echo Waiting for emulator to start...
timeout /t 10 /nobreak

echo.
echo Testing with emulator...
echo.
cd functions
node verify-functions.js --emulator
cd ..
goto End

:ComprehensiveTests
echo.
echo Running comprehensive tests...
echo.

echo Test 1: Verifying Firebase config...
cd functions
node verify-functions.js
cd ..

echo.
echo Test 2: Opening browser test page...
start "" http://localhost:3000/testfitmentor.html

echo.
echo Test 3: Checking for AppCheck issues...
if exist "src\integrations\firebase\client.ts" (
  findstr /C:"appCheck" "src\integrations\firebase\client.ts"
)

echo.
echo Test 4: Checking functions deployment status...
firebase functions:list

goto End

:FixAndDeploy
echo.
echo Running fix-functions-complete.bat...
call fix-functions-complete.bat
goto End

:End
echo.
echo Tests completed.
echo.
pause
