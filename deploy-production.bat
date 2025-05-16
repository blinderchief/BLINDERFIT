@echo off
echo.
echo ===================================================
echo BLINDERFIT PRODUCTION DEPLOYMENT
echo ===================================================
echo.

echo [1/5] Building frontend application for production...
REM Use our fixed vite.config.js which handles ESM issues properly
call npm run build
set BUILD_RESULT=%ERRORLEVEL%

if %BUILD_RESULT% NEQ 0 (
  echo ERROR: Frontend build failed!
  pause
  exit /b 1
)

echo.
echo [2/5] Installing Function dependencies...
cd functions
call npm install
cd ..
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Function dependencies installation failed!
  pause
  exit /b 1
)

echo.
echo [3/5] Verifying environment variables...
if not exist functions\.env (
  echo Creating .env file from example...
  copy functions\.env.example functions\.env
  echo Please verify API keys in functions\.env are correct
  pause
)

echo.
echo [4/5] Deploying functions...
call firebase deploy --only functions
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Function deployment had issues. 
  echo Check the logs above for details.
  pause
)

echo.
echo [5/5] Deploying website to blinderfit.blinder.live...
call firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Website deployment failed!
  pause
  exit /b 1
)

echo.
echo ===================================================
echo DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ===================================================
echo.
echo Your website is now live at https://blinderfit.blinder.live
echo.

pause
