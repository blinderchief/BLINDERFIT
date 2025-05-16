@echo off
echo ===================================
echo Firebase Functions Diagnostic Tool
echo ===================================
echo.

set ERROR_COUNT=0

REM Check Node.js version
echo Checking Node.js version...
node --version > temp.txt
set /p NODE_VERSION=<temp.txt
del temp.txt
echo Node.js version: %NODE_VERSION%

REM Check for critical files
echo.
echo Checking for critical Firebase files...

IF NOT EXIST firebase.json (
  echo [ERROR] firebase.json is missing!
  set /A ERROR_COUNT+=1
) ELSE (
  echo [OK] firebase.json exists
)

IF NOT EXIST .firebaserc (
  echo [WARNING] .firebaserc is missing. This may cause deployment issues.
) ELSE (
  echo [OK] .firebaserc exists
)

IF NOT EXIST functions\package.json (
  echo [ERROR] functions\package.json is missing!
  set /A ERROR_COUNT+=1
) ELSE (
  echo [OK] functions\package.json exists
)

REM Check for .env file
IF NOT EXIST functions\.env (
  echo [WARNING] functions\.env file is missing. API keys may not be available.
) ELSE (
  echo [OK] functions\.env exists
)

REM Check Firebase CLI installation
echo.
echo Checking Firebase CLI installation...
call firebase --version > temp.txt 2>&1
set /p FIREBASE_VERSION=<temp.txt
del temp.txt

echo Firebase CLI: %FIREBASE_VERSION%
IF "%FIREBASE_VERSION:~0,1%"=="f" (
  echo [OK] Firebase CLI is installed
) ELSE (
  echo [ERROR] Firebase CLI is not properly installed
  set /A ERROR_COUNT+=1
)

REM Check for Firebase Functions dependencies
echo.
echo Checking Firebase Functions dependencies...
cd functions

IF EXIST node_modules (
  echo [OK] node_modules exists
) ELSE (
  echo [WARNING] node_modules is missing in functions folder. Will attempt to install.
  call npm install
)

REM Check for critical dependencies
call npm list firebase-functions > temp.txt 2>&1
findstr /C:"firebase-functions" temp.txt > nul
IF %ERRORLEVEL% EQU 0 (
  echo [OK] firebase-functions is installed
) ELSE (
  echo [ERROR] firebase-functions is missing!
  set /A ERROR_COUNT+=1
)

call npm list firebase-admin > temp.txt 2>&1
findstr /C:"firebase-admin" temp.txt > nul
IF %ERRORLEVEL% EQU 0 (
  echo [OK] firebase-admin is installed
) ELSE (
  echo [ERROR] firebase-admin is missing!
  set /A ERROR_COUNT+=1
)

call npm list genkit > temp.txt 2>&1
findstr /C:"genkit" temp.txt > nul
IF %ERRORLEVEL% EQU 0 (
  echo [OK] genkit is installed
) ELSE (
  echo [WARNING] genkit is missing. AI functions may not work.
)

del temp.txt
cd ..

REM Check for Emulator configuration
echo.
echo Checking Firebase Emulator configuration...
findstr /C:"emulators" firebase.json > nul
IF %ERRORLEVEL% EQU 0 (
  echo [OK] Emulator configuration found in firebase.json
) ELSE (
  echo [WARNING] No emulator configuration found in firebase.json
)

REM Run the direct hello world test
echo.
echo Running basic hello world function test...
cd functions
node direct-hello-world-test.js --emulator
cd ..

echo.
echo ===================================
echo Firebase Diagnostic Summary
echo ===================================
echo.

IF %ERROR_COUNT% GTR 0 (
  echo Found %ERROR_COUNT% critical errors that need to be fixed!
) ELSE (
  echo No critical errors found.
)

echo.
echo Next steps:
echo 1. Run 'start-functions-emulator.bat' to test locally
echo 2. Run 'direct-hello-world-test.js' to test with emulator
echo 3. Check Firebase Console for deployment status
echo 4. Check 'FIREBASE-FUNCTIONS-INTERNAL-ERROR.md' for troubleshooting tips
echo.

pause
