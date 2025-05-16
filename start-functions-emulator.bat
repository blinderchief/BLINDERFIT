@echo off
echo ===============================
echo BlinderFit Functions Emulator
echo ===============================
echo.

cd %~dp0

echo Starting Firebase Functions emulator...
echo.
echo NOTE: This will start a local emulator for testing Firebase Functions.
echo Press Ctrl+C to stop the emulator when you're done testing.
echo.
echo To connect to the emulator from your app, import this utility:
echo   import './utils/emulator-connection';
echo.

echo Setting up environment...
if not exist functions\.env (
  echo Creating .env file in functions directory...
  echo GOOGLE_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE> functions\.env
  echo GENKIT_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE>> functions\.env
  echo FIREBASE_PROJECT_ID=blinderfit>> functions\.env
)

rem Check if functions are installed
if not exist functions\node_modules (
  echo Installing dependencies...
  cd functions
  npm install
  cd ..
)

rem Create a helper file to test the emulator in the browser
echo // Load this file in the browser to test the functions emulator> public\test-emulator.js
echo (async function() {>> public\test-emulator.js
echo   console.log("Testing Firebase Functions emulator...");>> public\test-emulator.js
echo   try {>> public\test-emulator.js
echo     const { getFunctions, connectFunctionsEmulator, httpsCallable } = await import("https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js");>> public\test-emulator.js
echo     const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js");>> public\test-emulator.js
echo >> public\test-emulator.js
echo     const firebaseConfig = {>> public\test-emulator.js
echo       apiKey: "AIzaSyDQlnFdox_u6NAz6PeeN-82Dk9lKI_bBbA",>> public\test-emulator.js
echo       authDomain: "blinderfit.firebaseapp.com",>> public\test-emulator.js
echo       projectId: "blinderfit",>> public\test-emulator.js
echo       storageBucket: "blinderfit.firebasestorage.app",>> public\test-emulator.js
echo       messagingSenderId: "621758849500",>> public\test-emulator.js
echo       appId: "1:621758849500:web:6c74cb251f68c73c9a6f19">> public\test-emulator.js
echo     };>> public\test-emulator.js
echo >> public\test-emulator.js
echo     const app = initializeApp(firebaseConfig, "emulator-test");>> public\test-emulator.js
echo     const functions = getFunctions(app);>> public\test-emulator.js
echo     connectFunctionsEmulator(functions, "localhost", 5001);>> public\test-emulator.js
echo >> public\test-emulator.js
echo     const helloWorld = httpsCallable(functions, "helloWorld");>> public\test-emulator.js
echo     const result = await helloWorld({});>> public\test-emulator.js
echo >> public\test-emulator.js
echo     console.log("Emulator test result:", result);>> public\test-emulator.js
echo     return "Emulator test successful ✅";>> public\test-emulator.js
echo   } catch (error) {>> public\test-emulator.js
echo     console.error("Emulator test failed:", error);>> public\test-emulator.js
echo     return "Emulator test failed ❌";>> public\test-emulator.js
echo   }>> public\test-emulator.js
echo })();>> public\test-emulator.js

echo Creating a basic test page...
echo ^<!DOCTYPE html^>> public\test-emulator.html
echo ^<html lang="en"^>>> public\test-emulator.html
echo ^<head^>>> public\test-emulator.html
echo   ^<meta charset="UTF-8"^>>> public\test-emulator.html
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>>> public\test-emulator.html
echo   ^<title^>Firebase Emulator Test^</title^>>> public\test-emulator.html
echo   ^<style^>>> public\test-emulator.html
echo     body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }>> public\test-emulator.html
echo     h1 { color: #d4af37; }>> public\test-emulator.html
echo     button { background: #d4af37; border: none; color: white; padding: 10px 15px; border-radius: 4px; cursor: pointer; }>> public\test-emulator.html
echo     pre { background: #f1f1f1; padding: 15px; border-radius: 4px; overflow-x: auto; }>> public\test-emulator.html
echo   ^</style^>>> public\test-emulator.html
echo ^</head^>>> public\test-emulator.html
echo ^<body^>>> public\test-emulator.html
echo   ^<h1^>Firebase Functions Emulator Test^</h1^>>> public\test-emulator.html
echo   ^<p^>This page tests the connection to the Firebase Functions emulator.^</p^>>> public\test-emulator.html
echo   ^<button id="testBtn"^>Run Emulator Test^</button^>>> public\test-emulator.html
echo   ^<div id="results" style="margin-top: 20px;"^>^</div^>>> public\test-emulator.html
echo   ^<script type="module"^>>> public\test-emulator.html
echo     document.getElementById('testBtn').addEventListener('click', async () => {>> public\test-emulator.html
echo       const resultsDiv = document.getElementById('results');>> public\test-emulator.html
echo       resultsDiv.innerHTML = '<p>Testing emulator connection...</p>';>> public\test-emulator.html
echo       try {>> public\test-emulator.html
echo         const result = await import('./test-emulator.js');>> public\test-emulator.html
echo         resultsDiv.innerHTML = `<p>Test completed!</p><pre>${JSON.stringify(result, null, 2)}</pre>`;>> public\test-emulator.html
echo       } catch (error) {>> public\test-emulator.html
echo         resultsDiv.innerHTML = `<p>Test failed:</p><pre>${error.message}</pre>`;>> public\test-emulator.html
echo       }>> public\test-emulator.html
echo     });>> public\test-emulator.html
echo   ^</script^>>> public\test-emulator.html
echo ^</body^>>> public\test-emulator.html
echo ^</html^>>> public\test-emulator.html

echo.
echo Starting the emulator...
echo.
start "" http://localhost:3000/test-emulator.html
firebase emulators:start --only functions

echo.
echo Emulator stopped. If you ran tests during this session, check the results.
echo.
pause
