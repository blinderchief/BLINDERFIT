@echo off
echo =====================================================
echo COMPLETE BLINDERFIT DEPLOYMENT WITH ALL FIXES
echo =====================================================

echo Step 1: Checking environment...
node --version
npm --version
echo.

echo Step 2: Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo Warning: npm install had issues but continuing...
)
echo.

echo Step 3: Building the application...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
  echo Build failed!
  pause
  exit /b 1
)
echo.

echo Step 4: Verifying the build...
if not exist "dist\index.html" (
  echo ERROR: dist/index.html not found after build!
  pause
  exit /b 1
)
echo Build successful! dist/index.html found.
echo.

echo Step 5: Attempting Firebase login if needed...
call firebase login:list
if %ERRORLEVEL% NEQ 0 (
  echo You need to log in to Firebase.
  call firebase login
)
echo.

echo Step 6: Deploying to Firebase hosting...
call firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
  echo First deployment attempt failed, trying with specific target...
  call firebase deploy --only hosting:blinderfit-live
  if %ERRORLEVEL% NEQ 0 (
    echo Creating deployment package for manual upload...
    powershell Compress-Archive -Path "dist\*" -DestinationPath "blinderfit-deploy-package.zip" -Force
    echo Manual deployment package created: blinderfit-deploy-package.zip
    echo Please upload this file manually through Firebase Console.
    echo.
    echo Instructions:
    echo 1. Go to Firebase Console (https://console.firebase.google.com)
    echo 2. Select the blinderfit project
    echo 3. Go to Hosting
    echo 4. Click Manual Deploy tab
    echo 5. Upload the blinderfit-deploy-package.zip file
    pause
    exit /b 1
  )
)

echo =====================================================
echo Deployment completed successfully!
echo Your changes should be visible shortly at:
echo - blinderfit.blinder.live
echo =====================================================
pause
