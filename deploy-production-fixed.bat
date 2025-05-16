@echo off
echo.
echo ===================================================
echo BLINDERFIT PRODUCTION DEPLOYMENT (FIXED VERSION)
echo ===================================================
echo.

echo [1/5] Building frontend application with production config...
set NODE_ENV=production
call npx vite build --config vite.production.config.mjs
if %ERRORLEVEL% NEQ 0 (
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
echo [3/5] Building Functions...
cd functions
call npm run build
cd ..
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Functions build failed!
  pause
  exit /b 1
)

echo.
echo [4/5] Deploying to Firebase (blinderfit-live target)...
call firebase deploy --only hosting:blinderfit-live,functions
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Firebase deployment failed!
  pause
  exit /b 1
)

echo.
echo [5/5] Deployment complete!
echo.
echo Your application is now live at: https://blinderfit.blinder.live
echo.

pause
