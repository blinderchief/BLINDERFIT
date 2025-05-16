@echo off
echo ===================================================
echo STEP 3 ALTERNATIVE: DEPLOY ONLY FIREBASE HOSTING
echo ===================================================
firebase deploy --only hosting
echo.
echo If the hosting deployment was successful, your BlinderFit frontend is now live!
pause
