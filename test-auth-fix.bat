@echo off
echo ===== BlinderFit Authentication Test =====

echo 1. Building the application to apply fixes...
call npm run build

echo 2. Starting the application locally...
start npm run dev

echo.
echo ===== Testing Instructions =====
echo 1. Wait for the application to open in your browser
echo 2. Try to log in with your credentials
echo 3. If successful, navigate to PulseHub to see if it loads correctly
echo 4. If you encounter any issues, check the browser console (F12) for errors
echo.
echo For detailed troubleshooting, see:
echo - AUTH-APPCHECK-TROUBLESHOOTING.md
echo - AUTH-DASHBOARD-FIXES-SUMMARY.md
echo.
pause
