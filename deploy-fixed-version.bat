@echo off
echo =====================================================
echo DEPLOYING BLINDERFIT WITH ALL FIXES
echo =====================================================

echo Step 1: Building the application with enhanced chunking...
cd /d "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_"
call npx vite build --emptyOutDir
if %ERRORLEVEL% NEQ 0 (
  echo Build failed!
  pause
  exit /b 1
)

echo Step 2: Verifying the build...
if not exist "dist\index.html" (
  echo ERROR: dist/index.html not found after build!
  pause
  exit /b 1
)
echo Build successful! dist/index.html found.

echo Step 3: Running Firebase login...
call firebase login
if %ERRORLEVEL% NEQ 0 (
  echo Firebase login failed but continuing...
)

echo Step 4: Setting up Firebase hosting target...
call firebase use blinderfit
if %ERRORLEVEL% NEQ 0 (
  echo Firebase project selection failed but continuing...
)

echo Step 5: Applying target...
call firebase target:apply hosting blinderfit-live blinderfit-live
if %ERRORLEVEL% NEQ 0 (
  echo Target application failed but continuing...
)

echo Step 6: Deploying to Firebase hosting...
call firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
  echo Standard hosting deployment failed, trying with project ID...
  call firebase deploy --only hosting --project blinderfit
  if %ERRORLEVEL% NEQ 0 (
    echo Deployment with project ID failed!
    pause
    exit /b 1
  )
)

echo =====================================================
echo Deployment completed successfully!
echo Your changes should be visible shortly.
echo =====================================================
pause
