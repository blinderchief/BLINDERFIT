@echo off
echo.
echo ===================================================
echo BLINDERFIT CLEANUP SCRIPT
echo ===================================================
echo.

echo Cleaning up temporary files...
del /q *bak* 2>nul
del /q *temp* 2>nul
del /q basic-vite.config.js 2>nul
del /q build-prod.js 2>nul
del /q deploy-production-fixed.bat 2>nul
del /q deploy-production-stub.bat 2>nul
del /q fix-esm-build.bat 2>nul
del /q production-build.js 2>nul
del /q simple-build.bat 2>nul
del /q vite.production.js 2>nul
del /q vite.production.config.js 2>nul
del /q vite.config.prod.js 2>nul

echo.
echo Cleanup complete!
echo.
pause
