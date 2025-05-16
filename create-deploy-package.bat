@echo off
echo =====================================================
echo CREATING DEPLOYMENT PACKAGE FOR MANUAL UPLOAD
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

echo Step 3: Creating ZIP file for manual upload...
powershell Compress-Archive -Path "dist\*" -DestinationPath "blinderfit-deploy-package.zip" -Force

echo =====================================================
echo Deployment package created: blinderfit-deploy-package.zip
echo You can now manually upload this ZIP file to Firebase Console
echo or your web hosting provider.
echo =====================================================
pause
