@echo off
echo =====================================================
echo IMPROVED DEPLOYMENT FOR BLINDERFIT
echo =====================================================

echo Step 1: Building the application...
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

echo Step 3: Deploying to Firebase hosting (with updated target configuration)...
call firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
  echo Standard deployment failed, trying project-specific command...
  call firebase deploy --only hosting:blinderfit-live
  if %ERRORLEVEL% NEQ 0 (
    echo Both deployment methods failed.
    echo Please check Firebase CLI installation and permissions.
    pause
    exit /b 1
  )
)

echo =====================================================
echo Deployment completed successfully!
echo Your changes should be visible shortly.
echo =====================================================
pause
