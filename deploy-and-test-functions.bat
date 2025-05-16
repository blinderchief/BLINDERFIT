@echo off
echo =========================
echo BlinderFit Functions Deployment
echo =========================
echo.

cd %~dp0

echo Checking Firebase login status...
firebase login:list
if %ERRORLEVEL% NEQ 0 (
  echo You need to log in to Firebase first.
  echo.
  echo Running Firebase login...
  firebase login
)

echo.
echo Deploying only the Firebase Functions...
echo This may take a few minutes...
echo.

firebase deploy --only functions

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Deployment failed. Trying to fix common issues...
  
  echo.
  echo Checking for node_modules in functions directory...
  if not exist "functions\node_modules" (
    echo Installing dependencies in functions directory...
    cd functions
    npm install
    cd ..
  )
  
  echo.
  echo Retrying deployment...
  firebase deploy --only functions
  
  if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Deployment still failed. Please check the Firebase console for more details.
    echo Visit: https://console.firebase.google.com/project/blinderfit/functions
  ) else (
    echo.
    echo Functions deployed successfully!
    echo.
    echo Running test to verify functions work...
    call test-fitmentor-api.bat
  )
) else (
  echo.
  echo Functions deployed successfully!
  echo.
  echo Running test to verify functions work...
  call test-fitmentor-api.bat
)

echo.
pause
