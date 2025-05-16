@echo off
echo Cleaning up test files...

echo Removing TestComponent.tsx...
del /Q "src\TestComponent.tsx"

echo Removing AuthTest.tsx...
del /Q "src\components\AuthTest.tsx"

echo Removing FirebaseTest.tsx...
del /Q "src\components\FirebaseTest.tsx"

echo Cleanup complete!
pause
