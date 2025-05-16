@echo off
echo ===== Testing Firebase Authentication with Updated Configuration =====

echo 1. Building the application with the new Firebase config...
call npm run build

if %ERRORLEVEL% neq 0 (
  echo Build failed! Please check the error messages above.
  pause
  exit /b 1
)

echo.
echo 2. Starting the application for testing...
echo The application will start in your browser. Please test:
echo   - Login functionality
echo   - Registration functionality
echo   - PulseHub dashboard loading
echo.
echo Press any key to start the application...
pause > nul

start npm run dev

echo.
echo ===== Important Notes =====
echo.
echo 1. The Firebase configuration has been updated with the new API key.
echo 2. AppCheck is temporarily disabled to troubleshoot authentication issues.
echo 3. After confirming authentication works, check if PulseHub loads properly.
echo.
echo If authentication still fails:
echo   1. Check browser console (F12) for specific error messages
echo   2. Verify Firebase Authentication is enabled in the Firebase Console
echo   3. Ensure Email/Password authentication is enabled in the Firebase Console
echo.
echo Press any key to exit...
pause > nul
