@echo off
echo ======================================
echo BlinderFit Firebase Functions Fix Tool
echo ======================================
echo.

cd %~dp0

echo Checking Firebase CLI installation...
firebase --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Firebase CLI is not installed. Installing...
  call npm install -g firebase-tools
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Firebase CLI. Please run: npm install -g firebase-tools
    exit /b 1
  )
)

echo.
echo Step 1: Verifying the functions directory...
if not exist functions (
  echo Functions directory not found!
  exit /b 1
)

echo.
echo Step 2: Checking for environment files...
if not exist functions\.env (
  echo Creating .env file in functions directory...
  echo GOOGLE_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE> functions\.env
  echo GENKIT_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE>> functions\.env
  echo FIREBASE_PROJECT_ID=blinderfit>> functions\.env
)

echo.
echo Step 3: Adding test functions to ensure API works correctly...
cd functions
node add-test-functions.js
cd ..

echo.
echo Step 4: Installing dependencies...
cd functions
call npm install
cd ..

echo.
echo Step 5: Fixing AppCheck configuration...
echo // Force enable AppCheck debug tokens for local development> src\fix-appcheck.js
echo if (typeof window !== 'undefined' ^&^& (window.location.hostname === 'localhost' ^|^| window.location.hostname === '127.0.0.1')) {>> src\fix-appcheck.js
echo   console.log('Using AppCheck debug token for local development');>> src\fix-appcheck.js
echo   // @ts-ignore>> src\fix-appcheck.js
echo   self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;>> src\fix-appcheck.js
echo }>> src\fix-appcheck.js

echo.
echo Step 6: Deploying functions...
call firebase deploy --only functions

if %ERRORLEVEL% NEQ 0 (
  echo Function deployment failed.
  echo Trying alternative approach...
  
  echo.
  echo Step 6b: Trying to deploy with --force...
  call firebase deploy --only functions --force
  
  if %ERRORLEVEL% NEQ 0 (
    echo Force deployment failed.
    echo Trying to connect to emulator instead...
    
    echo.
    echo Step 6c: Starting functions emulator...
    start "Firebase Emulator" cmd /c "firebase emulators:start --only functions"
    
    echo Waiting for emulator to start...
    timeout /t 10 /nobreak
    
    echo.
    echo Step 7: Testing functions on emulator...
    cd functions
    node verify-functions.js --emulator
    cd ..
    
    echo.
    echo Firebase Functions Fix complete.
    echo.
    echo Important: Functions are running in the emulator.
    echo To use them, your application must connect to the emulator.
    echo Add this code to your application:
    echo.
    echo   import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
    echo   const functions = getFunctions();
    echo   connectFunctionsEmulator(functions, "localhost", 5001);
    echo.
  ) else (
    echo.
    echo Functions deployed successfully with --force!
    echo.
    echo Step 7: Verifying functions...
    cd functions
    node verify-functions.js
    cd ..
  )
) else (
  echo.
  echo Functions deployed successfully!
  echo.
  echo Step 7: Verifying functions...
  cd functions
  node verify-functions.js
  cd ..
)

echo.
echo All done! If you still have issues:
echo 1. Check the Firebase console: https://console.firebase.google.com/project/blinderfit/functions
echo 2. Try the emulator approach with: firebase emulators:start --only functions
echo 3. Check if AppCheck is properly configured
echo 4. Ensure your API keys are valid
echo.
pause
