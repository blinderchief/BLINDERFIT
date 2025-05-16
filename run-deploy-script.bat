@echo off
echo ===================================================
echo DEPLOYING BLINDERFIT TO blinderfit.blinder.live
echo ===================================================

echo Running Node.js deployment script...
node --experimental-modules deploy-script.js
if %ERRORLEVEL% NEQ 0 (
  echo Deployment failed!
  pause
  exit /b 1
)
pause
