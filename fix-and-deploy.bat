@echo off
echo ===== Fixing BlinderFit Deployment =====

echo 1. Cleaning build artifacts...
if exist "dist" (
  rmdir /s /q dist
)
if exist ".firebase" (
  rmdir /s /q .firebase
)

echo 2. Installing dependencies...
call npm install

echo 3. Building project...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Build failed. Please check the errors above.
  pause
  exit /b 1
)

echo 4. Checking Firebase configuration...
call firebase use blinderfit
if %ERRORLEVEL% neq 0 (
  echo Failed to select Firebase project. Make sure you're logged in.
  pause
  exit /b 1
)

echo 5. Verifying hosting target configuration...
echo Target configuration will use blinderfit-live

echo 6. Deploying to Firebase...
call firebase deploy --only hosting
if %ERRORLEVEL% neq 0 (
  echo Deployment failed. Please check the errors above.
  pause
  exit /b 1
)

echo ===== Deployment Complete =====
echo Your app should now be available at: https://blinderfit-live.web.app or your custom domain
pause
