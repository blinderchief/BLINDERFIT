@echo off
echo ===================================================
echo BLINDERFIT DEPLOYMENT HELPER
echo ===================================================

echo 1. Building the application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Error: Build failed!
  pause
  exit /b 1
)

echo 2. Installing Firebase functions dependencies...
cd functions
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo Error: Functions dependency installation failed!
  cd ..
  pause
  exit /b 1
)
cd ..

echo 3. Deploying to Firebase...
call firebase deploy
if %ERRORLEVEL% NEQ 0 (
  echo Error: Firebase deployment failed!
  pause
  exit /b 1
)

echo ===================================================
echo Deployment completed successfully!
echo ===================================================
pause
