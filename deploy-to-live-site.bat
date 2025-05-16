@echo off
echo ===================================================
echo BLINDERFIT DEPLOYMENT TO blinderfit.blinder.live
echo ===================================================

echo Step 1: Building the application...
call npx vite build
if %ERRORLEVEL% NEQ 0 (
  echo Failed to build the application!
  pause
  exit /b 1
)
echo Build successful!

echo Step 2: Verifying Firebase login...
call firebase login:list
if %ERRORLEVEL% NEQ 0 (
  echo Not logged in to Firebase. Please log in now...
  call firebase login
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to log in to Firebase!
    pause
    exit /b 1
  )
)
echo Firebase login verified!

echo Step 3: Confirming Firebase target...
call firebase target:apply hosting blinderfit blinderfit-live
if %ERRORLEVEL% NEQ 0 (
  echo Warning: Could not set target. Will continue anyway.
)
echo Target configuration checked!

echo Step 4: Deploying to Firebase hosting...
call firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
  echo Failed to deploy to Firebase hosting!
  pause
  exit /b 1
)
echo Deployment successful!

echo ===================================================
echo Your changes have been deployed to blinderfit.blinder.live
echo It may take a few minutes for the changes to be visible.
echo ===================================================
pause
