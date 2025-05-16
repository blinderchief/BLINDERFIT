@echo off
echo ===================================================
echo STEP 2: INSTALL FIREBASE FUNCTIONS DEPENDENCIES
echo ===================================================
cd functions
npm install
cd ..
echo.
echo If the functions dependencies were installed successfully, run deploy-step3.bat
pause
