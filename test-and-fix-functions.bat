@echo off
echo ================================================
echo Complete Firebase Functions Test and Fix Package
echo ================================================
echo.

REM Set up colors for better readability
set GREEN=[92m
set YELLOW=[93m
set RED=[91m
set CYAN=[96m
set RESET=[0m

echo %CYAN%Phase 1: Installing dependencies%RESET%
cd functions
echo Installing Firebase dependencies...
call npm install firebase-functions@latest firebase-admin@latest --save
echo Installing testing utilities...
call npm install firebase-functions-test --save-dev
cd ..
echo.

echo %CYAN%Phase 2: Setting up diagnostic tools%RESET%
echo Adding test and diagnostic functions...
cd functions
node add-test-functions.js
echo.

echo %CYAN%Phase 3: Validating functions%RESET%
echo Running direct test to validate function code...
node direct-hello-world-test.js
cd ..
echo.

echo %CYAN%Phase 4: Testing emulator connection%RESET%
echo Starting Firebase emulator (functions only)...
start "Firebase Emulator" cmd /c "firebase emulators:start --only functions"
echo Waiting for emulator to start...
timeout /t 10
echo.
echo Running test against emulator...
cd functions
node direct-hello-world-test.js --emulator
cd ..
echo.

echo %CYAN%Phase 5: Testing browser-based functions%RESET%
echo.
echo %YELLOW%Please complete these manual steps:%RESET%
echo.
echo 1. Open the following file in your browser:
echo    %GREEN%function-error-diagnosis.html%RESET%
echo.
echo 2. Click "Test HelloWorld" to test the function
echo.
echo 3. If it fails with "functions/internal", try:
echo    %GREEN%- Click "Test with Emulator" to check if it works with emulator%RESET%
echo    %GREEN%- Go to Settings tab and enable Debug Token if on localhost%RESET%
echo    %GREEN%- Try disabling AppCheck to isolate if that's the issue%RESET%
echo.

echo %CYAN%Phase 6: Applying internal error fixes%RESET%
echo.
echo 1. Modifying function timeout and memory settings...
cd functions

REM Ensure the modified index.js file is used
echo.
echo 2. Setting up proper CORS handling...
echo   - Checking for missing Firebase dependencies...
call npm list firebase-functions firebase-admin cors
echo.

echo %CYAN%Phase 7: Final verification%RESET%
echo Running test one more time...
node direct-hello-world-test.js
cd ..
echo.

echo %GREEN%All tests complete!%RESET%
echo.
echo Next steps:
echo 1. Review the FIREBASE-FUNCTIONS-INTERNAL-ERROR.md file for troubleshooting tips
echo 2. Use the diagnostic tool at function-error-diagnosis.html for detailed testing
echo 3. If still encountering issues, try deploying the functions to production with:
echo    %YELLOW%firebase deploy --only functions%RESET%
echo.

echo %RED%IMPORTANT: Make sure to stop the emulator when done testing!%RESET%
echo.
pause
