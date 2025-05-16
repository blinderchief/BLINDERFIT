@echo off
echo ======================================
echo Firebase Functions Comprehensive Test
echo ======================================
echo.

echo Step 1: Installing required dependencies
cd functions
call npm install firebase firebase-functions firebase-admin firebase-functions-test --save-dev
cd ..
echo.

echo Step 2: Adding test functions to index.js
cd functions
node add-test-functions.js
cd ..
echo.

echo Step 3: Starting Firebase Functions emulator
start "Firebase Emulator" cmd /c "firebase emulators:start --only functions"
echo Waiting for emulator to start...
timeout /t 10
echo.

echo Step 4: Running direct test against emulator
cd functions
node direct-functions-test.js --emulator
echo.

echo Step 5: Running direct test against production
node direct-functions-test.js
cd ..
echo.

echo Step 6: Verifying function deployments
cd functions
node verify-functions.js
cd ..
echo.

echo All tests completed! Check the output above for results.
echo.
echo Note: The Firebase emulator is still running in a separate window.
echo Close it when you're done testing.
echo.
pause
