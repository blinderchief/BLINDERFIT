@echo off
echo.
echo ===================================================
echo BLINDERFIT AI SYSTEM VERIFICATION
echo ===================================================
echo.

echo Setting up environment...

:: Create .env file for the verification script if it doesn't exist
if not exist scripts\.env (
  echo Creating .env file for verification script...
  echo API_URL=https://us-central1-blinderfit.cloudfunctions.net/app> scripts\.env
  echo TEST_EMAIL=test@example.com>> scripts\.env
  echo TEST_PASSWORD=testPassword123>> scripts\.env
  echo GOOGLE_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE>> scripts\.env
  
  echo Please edit scripts\.env with your test user credentials
  pause
)

echo.
echo Installing test dependencies...
cd scripts
call npm install axios firebase dotenv

echo.
echo Running AI system verification tests...
node verify-ai-system.js

echo.
echo Verification complete!
cd ..

pause
