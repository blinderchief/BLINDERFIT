@echo off
echo.
echo ===================================================
echo BLINDERFIT GENKIT INTEGRATION TEST
echo ===================================================
echo.

echo [1/4] Checking environment...
cd functions
if not exist .env (
  echo ERROR: No .env file found!
  echo Creating .env file from example...
  copy .env.example .env
  echo Please edit the .env file with your actual API keys and run this script again.
  pause
  exit /b 1
)
echo Environment check passed.

echo.
echo [2/4] Installing required packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Package installation failed!
  pause
  exit /b 1
)
echo Package installation complete.

echo.
echo [3/4] Verifying Genkit packages...
call node verify-packages.js
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Package verification had issues.
)

echo.
echo [4/4] Running Genkit test...
echo.
echo This may take a moment...
echo.
call node test-genkit-final.js
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Genkit test failed!
  pause
  exit /b 1
)

echo.
echo ===================================================
echo TEST COMPLETED SUCCESSFULLY!
echo ===================================================
echo.
echo You can now deploy your functions to Firebase:
echo   firebase deploy --only functions
echo.

pause
