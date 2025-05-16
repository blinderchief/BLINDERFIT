@echo off
echo =====================================================
echo COMPLETE DEPLOYMENT PROCESS FOR BLINDERFIT
echo =====================================================

echo Step 1: Building the application with increased chunk size limit...
cd /d "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_"
call npx vite build
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

echo Step 3: Configuring Firebase target...
call firebase target:apply hosting blinderfit-live blinderfit-live
if %ERRORLEVEL% NEQ 0 (
  echo Trying alternate target configuration...
  call firebase target:apply hosting blinderfit-live blinderfit
  if %ERRORLEVEL% NEQ 0 (
    echo Target configuration failed. Continuing anyway...
  )
)

echo Step 4: Deploying to Firebase hosting...
call firebase deploy --only hosting:blinderfit-live
if %ERRORLEVEL% NEQ 0 (
  echo First deployment attempt failed. Trying standard deployment...
  call firebase deploy --only hosting
  if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed!
    pause
    exit /b 1
  )
)

echo =====================================================
echo Deployment completed successfully!
echo Your changes should be visible on blinderfit.blinder.live
echo (It might take a few minutes for changes to propagate)
echo =====================================================
pause
