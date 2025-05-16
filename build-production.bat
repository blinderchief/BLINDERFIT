@echo off
echo.
echo ===================================================
echo BLINDERFIT PRODUCTION BUILD (SIMPLIFIED)
echo ===================================================
echo.

echo Building for production with simplified config...
call npx vite build --config vite.config.production.js
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Build failed!
  exit /b 1
)

echo.
echo Build successful!
echo.

exit /b 0
