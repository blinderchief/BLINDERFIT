@echo off
echo ===== Deploying BlinderFit to Firebase =====

echo 1. Checking Firebase login status...
firebase login:list 2>nul || (
  echo You need to log in to Firebase. Running login command...
  firebase login
)

echo 2. Setting hosting target...
firebase target:apply hosting blinderfit-live blinderfit-live

echo 3. Deploying to Firebase (hosting only)...
firebase deploy --only hosting

echo ===== Deployment Completed =====
pause
