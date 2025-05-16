@echo off
echo ===== Testing Firebase Authentication with AppCheck =====

echo 1. Building the application with AppCheck enabled...
call npm run build

if %ERRORLEVEL% neq 0 (
  echo Build failed! Please check the error messages above.
  pause
  exit /b 1
)

echo.
echo 2. Starting the application for testing...
echo The application will now start in your browser. Please test:
echo   - Login functionality with new Firebase configuration
echo   - Registration functionality
echo   - PulseHub dashboard loading
echo   - Check browser console for any AppCheck errors
echo.
echo Press any key to start the application...
pause > nul

start npm run dev

echo.
echo ===== Important Notes =====
echo.
echo 1. The Firebase configuration has been updated with the new API key.
echo 2. AppCheck is now enabled with a valid reCAPTCHA site key.
echo 3. The reCAPTCHA v3 badge might appear in the bottom-right corner of the page.
echo.
echo If authentication fails:
echo   1. Check browser console (F12) for specific error messages
echo   2. Look for any AppCheck-related errors
echo   3. Make sure your reCAPTCHA site key is properly configured in the Firebase Console
echo   4. Verify the domain is listed in the reCAPTCHA allowed domains
echo.
echo Press any key to exit...
pause > nul
