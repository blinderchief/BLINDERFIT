@echo off
echo Deploying Firebase Functions...
cd functions
npm ci
firebase deploy --only functions
