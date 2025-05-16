@echo off
echo Searching for hardcoded API keys in the project...
cd /d "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_"

echo Looking for: AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE
findstr /s /i "AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE" *.* src\*.* .env*

echo.
echo Looking for references to identitytoolkit.googleapis.com
findstr /s /i "identitytoolkit.googleapis.com" *.* src\*.* .env*

echo.
echo Completed API key search
pause