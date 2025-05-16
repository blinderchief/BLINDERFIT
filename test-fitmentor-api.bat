@echo off
echo Testing FitMentor API Integration...
echo.

cd %~dp0
cd ..

echo Running test script...
echo.

node scripts/test-fitmentor-api.js

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Test failed! Please check the errors above.
  echo Possible solutions:
  echo 1. Verify Firebase configuration is correct
  echo 2. Check if Firebase Functions are deployed
  echo 3. Ensure AppCheck is properly configured
  echo 4. Check network connectivity to Firebase
) else (
  echo.
  echo Tests passed successfully!
)

echo.
pause
