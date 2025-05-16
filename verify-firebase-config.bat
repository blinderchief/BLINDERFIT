@echo off
echo ===== Verifying Firebase Configuration =====

echo 1. Checking Firebase login status...
firebase login:list
if %ERRORLEVEL% neq 0 (
  echo You need to log in to Firebase. Running login command...
  firebase login
)

echo 2. Checking project association...
firebase use
if %ERRORLEVEL% neq 0 (
  echo Setting the default project to blinderfit...
  firebase use blinderfit
)

echo 3. Checking hosting target configuration...
firebase target:apply hosting blinderfit-live blinderfit-live
if %ERRORLEVEL% neq 0 (
  echo Failed to set hosting target. Checking existing targets...
  firebase target:list
)

echo ===== Configuration Check Complete =====
pause
