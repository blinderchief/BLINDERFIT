@echo off
echo ========================
echo BlinderFit Functions Test
echo ========================
echo.

echo Testing connection to Firebase...
curl -s -o nul -w "Firebase status: %%{http_code}\n" https://blinderfit.firebaseapp.com/

echo.
echo Testing basic API access...
curl -s -o nul -w "Firebase API status: %%{http_code}\n" https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDQlnFdox_u6NAz6PeeN-82Dk9lKI_bBbA

echo.
echo Opening test page in browser...
start "" http://localhost:3000/testfitmentor.html

echo.
echo Checking if Firebase CLI is installed...
firebase --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Firebase CLI is not installed. This might cause deployment issues.
  echo To install, run: npm install -g firebase-tools
) else (
  firebase --version | findstr /r "[0-9]"
)

echo.
echo Checking for potential environment issues...
echo.
echo Node version:
node --version
echo.
echo NPM version:
npm --version
echo.

echo AppCheck status:
if exist "./src/integrations/firebase/client.ts" (
  findstr /C:"appCheck" ./src/integrations/firebase/client.ts
)

echo.
echo Please check the browser test page for interactive testing.
echo If tests fail, you may need to check your Firebase Functions deployment.
echo.
pause
