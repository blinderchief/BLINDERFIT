# Deploy to Firebase Hosting
# This PowerShell script will deploy your application to Firebase Hosting

Write-Host "Building application with Vite..." -ForegroundColor Green
npm run build

Write-Host "Checking if build was successful..." -ForegroundColor Green
if (-not (Test-Path ".\dist\index.html")) {
    Write-Host "Error: Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Green
firebase deploy --only hosting

Write-Host "Deployment complete. Changes should be visible on blinderfit.blinder.live shortly." -ForegroundColor Green
