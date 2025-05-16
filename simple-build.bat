@echo off
echo.
echo ===================================================
echo BLINDERFIT SIMPLIFIED PRODUCTION BUILD
echo ===================================================
echo.

echo Building for production...
call npx vite build --emptyOutDir --config basic-vite.config.js
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Build failed!
  pause
  exit /b 1
)

echo.
echo Build completed successfully!
echo Your files are ready in the dist directory.
echo.

exit /b 0
