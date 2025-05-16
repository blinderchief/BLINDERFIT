@echo off
echo ===== Fixing Critical Issues for BlinderFit =====

echo 1. Fixing vite.config.js (UI components directory import issue)...
echo.
echo Examining current configuration...
type vite.config.js | findstr /C:"ui: ['@/components/ui']" > nul
if %ERRORLEVEL% equ 0 (
  echo Found problematic configuration. Fixing...
  powershell -Command "(Get-Content vite.config.js) -replace \"ui: \['@/components/ui'\],\", \"// Remove incorrect ui chunk that tries to import directory`n          // Each UI component is imported individually instead,\" | Set-Content vite.config.js"
  echo vite.config.js updated successfully.
) else (
  echo No issues found in vite.config.js or already fixed.
)

echo.
echo 2. Fixing .firebaserc (Multiple sites issue)...
echo.
echo Examining current configuration...
type .firebaserc | findstr /C:"\"blinderfit-live\": [" > nul
if %ERRORLEVEL% equ 0 (
  echo Checking for multiple sites...
  type .firebaserc | findstr /C:"\"blinderfit\"," > nul
  if %ERRORLEVEL% equ 0 (
    echo Found multiple sites for blinderfit-live target. Fixing...
    powershell -Command "(Get-Content .firebaserc) -replace \"\"\"blinderfit-live\"\": \[`n          \"\"blinderfit\"\",`n          \"\"blinderfit-live\"\"`n        \]\", \"\"\"blinderfit-live\"\": \[`n          \"\"blinderfit-live\"\"`n        \]\" | Set-Content .firebaserc"
    echo .firebaserc updated successfully.
  ) else (
    echo No multiple sites issue found in .firebaserc.
  )
) else (
  echo No issues found in .firebaserc or already fixed.
)

echo.
echo 3. Verifying fixes...
echo.
echo Checking vite.config.js...
type vite.config.js | findstr /C:"Remove incorrect ui chunk" > nul
if %ERRORLEVEL% equ 0 (
  echo vite.config.js - Fix verified!
) else (
  echo vite.config.js - Fix NOT found!
)

echo Checking .firebaserc...
type .firebaserc | findstr /C:"\"blinderfit-live\": [" > nul
if %ERRORLEVEL% equ 0 (
  type .firebaserc | findstr /C:"\"blinderfit\"," > nul
  if %ERRORLEVEL% neq 0 (
    echo .firebaserc - Fix verified!
  ) else (
    echo .firebaserc - Fix NOT found!
  )
) else (
  echo .firebaserc - Could not verify!
)

echo.
echo ===== Critical Fixes Completed =====
echo Next steps:
echo 1. Run "npm run build" to build the application
echo 2. Run "firebase deploy --only hosting" to deploy
echo.
pause
