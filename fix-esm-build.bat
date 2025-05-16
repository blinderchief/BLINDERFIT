@echo off
echo.
echo ===================================================
echo BLINDERFIT PRODUCTION BUILD SCRIPT (ESM FIX)
echo ===================================================
echo.

set MODULE_PATH=node_modules\lovable-tagger\package.json

echo [1/4] Backing up module package.json...
copy "%MODULE_PATH%" "%MODULE_PATH%.bak"
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to back up the module package.json!
  pause
  exit /b 1
)

echo.
echo [2/4] Temporarily modifying module type to make it compatible...
type "%MODULE_PATH%" | findstr /v "\"type\": \"module\"" > "%MODULE_PATH%.temp"
move /y "%MODULE_PATH%.temp" "%MODULE_PATH%"
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to modify the module package.json!
  copy "%MODULE_PATH%.bak" "%MODULE_PATH%"
  del "%MODULE_PATH%.bak"
  pause
  exit /b 1
)

echo.
echo [3/4] Building for production...
call npm run build
set BUILD_RESULT=%ERRORLEVEL%

echo.
echo [4/4] Restoring original module configuration...
copy "%MODULE_PATH%.bak" "%MODULE_PATH%"
del "%MODULE_PATH%.bak"

if %BUILD_RESULT% NEQ 0 (
  echo ERROR: Build failed!
  pause
  exit /b 1
)

echo.
echo Production build completed successfully!
echo Your files are ready in the dist directory.
echo.

exit /b 0
