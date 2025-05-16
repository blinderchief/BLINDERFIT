@echo off
echo =====================================================
echo CONFIGURING FIREBASE HOSTING TARGET
echo =====================================================

echo Running target:apply command to set up the hosting target...
firebase target:apply hosting blinderfit-live blinderfit-live
if %ERRORLEVEL% NEQ 0 (
  echo First attempt failed, trying alternative format...
  firebase target:apply hosting blinderfit-live blinderfit
  if %ERRORLEVEL% NEQ 0 (
    echo Both attempts failed. Please check your Firebase project configuration.
    pause
    exit /b 1
  )
)

echo Target configuration applied successfully!
echo.
echo Now you can deploy with:
echo   firebase deploy --only hosting
echo.
pause
