@echo off
echo Cleaning up additional test files...

echo Removing components\AuthTest.tsx...
del /Q "src\components\AuthTest.tsx"

echo Removing TestComponent.tsx if it still exists...
if exist "src\TestComponent.tsx" del /Q "src\TestComponent.tsx"

echo Removing components\FirebaseTest.tsx if it still exists...
if exist "src\components\FirebaseTest.tsx" del /Q "src\components\FirebaseTest.tsx"

echo Additional cleanup complete!
pause
