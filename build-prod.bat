@echo off
echo.
echo ===================================================
echo BLINDERFIT PRODUCTION BUILD SCRIPT
echo ===================================================
echo.

echo [1/5] Backing up configuration files...
copy vite.config.ts vite.config.ts.bak
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to back up vite.config.ts!
  pause
  exit /b 1
)

echo.
echo [2/5] Creating a production-ready vite.config.ts...
echo // Production vite.config.ts - without lovable-tagger > vite.config.ts.temp
echo import { defineConfig } from "vite"; >> vite.config.ts.temp
echo import react from "@vitejs/plugin-react-swc"; >> vite.config.ts.temp
echo import path from "path"; >> vite.config.ts.temp
echo. >> vite.config.ts.temp
echo // https://vitejs.dev/config/ >> vite.config.ts.temp
echo export default defineConfig({ >> vite.config.ts.temp
echo   server: { >> vite.config.ts.temp
echo     host: "localhost", >> vite.config.ts.temp
echo     port: 8080, >> vite.config.ts.temp
echo     open: true, >> vite.config.ts.temp
echo   }, >> vite.config.ts.temp
echo   plugins: [react()], >> vite.config.ts.temp
echo   resolve: { >> vite.config.ts.temp
echo     alias: { >> vite.config.ts.temp
echo       "@": path.resolve(__dirname, "./src"), >> vite.config.ts.temp
echo     }, >> vite.config.ts.temp
echo   }, >> vite.config.ts.temp
echo }); >> vite.config.ts.temp
move /y vite.config.ts.temp vite.config.ts
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to create production vite.config.ts!
  copy vite.config.ts.bak vite.config.ts
  pause
  exit /b 1
)

echo.
echo [3/5] Building for production...
call npm run build
set BUILD_RESULT=%ERRORLEVEL%

echo.
echo [4/5] Restoring original configuration...
copy vite.config.ts.bak vite.config.ts
del vite.config.ts.bak

if %BUILD_RESULT% NEQ 0 (
  echo ERROR: Build failed!
  pause
  exit /b 1
)

echo.
echo [5/5] Production build completed successfully!
echo Your files are ready in the dist directory.
echo.

exit /b 0
