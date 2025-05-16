@echo off
cd "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_\functions"
npm install firebase-admin@^12.0.0 firebase-functions@^5.1.0 @genkit-ai/firebase@^1.9.0 --save
echo "Installation complete. Now testing functions..."
node -e "try { require('./src/utils/firebase-init'); console.log('Firebase initialization successful!'); } catch (e) { console.error('Firebase initialization failed:', e); }"
echo "Test complete."
pause
