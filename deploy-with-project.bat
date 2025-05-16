@echo off
echo =====================================================
echo DEPLOYING TO FIREBASE HOSTING WITH PROJECT ID
echo =====================================================

echo Step 1: Building application...
cd /d "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_"
call npx vite build
if %ERRORLEVEL% NEQ 0 (
  echo Build failed!
  pause
  exit /b 1
)

echo Step 2: Checking if dist folder exists...
if not exist "dist\index.html" (
  echo ERROR: dist/index.html not found after build!
  pause
  exit /b 1
)
echo Build successful! dist/index.html found.

echo Step 3: Running Firebase deployment with explicit project...
call firebase deploy --only hosting:blinderfit-live --project blinderfit

echo =====================================================
echo Deployment completed! Check blinderfit.blinder.live
echo (It might take a few minutes for changes to be visible)
echo =====================================================
pause
