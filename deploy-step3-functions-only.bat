@echo off
echo ===================================================
echo STEP 3 ALTERNATIVE: DEPLOY ONLY FIREBASE FUNCTIONS
echo ===================================================
firebase deploy --only functions
echo.
echo If the functions deployment was successful, your BlinderFit backend is now live!
pause
