@echo off
REM Blinderfit Quick Setup Script for Windows
REM This script helps you quickly set up the entire Blinderfit application

echo 🚀 Blinderfit Quick Setup
echo ==========================

REM Check prerequisites
echo 📋 Checking prerequisites...

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    echo Please install Python 3.10 or higher from https://python.org
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo Please install Node.js 18 or higher from https://nodejs.org
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is required but not installed.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install UV if not present
uv --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing UV package manager...
    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
)

echo ✅ UV installed

REM Setup backend
echo 🔧 Setting up backend...

cd backend

REM Create virtual environment
echo 🐍 Creating Python virtual environment...
uv venv

REM Activate virtual environment and install dependencies
echo 📦 Installing backend dependencies...
uv sync

echo ✅ Backend setup complete

REM Setup frontend
echo 🎨 Setting up frontend...

cd ../frontend

REM Install dependencies
echo 📦 Installing frontend dependencies...
call npm install

echo ✅ Frontend setup complete

REM Create environment files
echo 📝 Creating environment files...

cd ../backend
if not exist .env (
    echo # Environment> .env
    echo ENVIRONMENT=development>> .env
    echo.>> .env
    echo # Server settings>> .env
    echo HOST=0.0.0.0>> .env
    echo PORT=8000>> .env
    echo.>> .env
    echo # CORS settings>> .env
    echo ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]>> .env
    echo.>> .env
    echo # Firebase settings (REPLACE WITH YOUR VALUES)>> .env
    echo FIREBASE_PROJECT_ID=your-firebase-project-id>> .env
    echo FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n">> .env
    echo FIREBASE_CLIENT_EMAIL=your-firebase-client-email>> .env
    echo.>> .env
    echo # Google AI (Gemini) settings (REPLACE WITH YOUR VALUES)>> .env
    echo GOOGLE_AI_API_KEY=your-google-ai-api-key>> .env
    echo GEMINI_MODEL=gemini-2.5-flash>> .env
    echo.>> .env
    echo # JWT settings (REPLACE WITH YOUR VALUES)>> .env
    echo JWT_SECRET_KEY=your-super-secret-jwt-key-here>> .env
    echo JWT_ALGORITHM=HS256>> .env
    echo JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30>> .env
    echo.>> .env
    echo # Database settings>> .env
    echo FIRESTORE_EMULATOR_HOST=>> .env
    echo.>> .env
    echo # API settings>> .env
    echo API_V1_PREFIX=/api/v1>> .env
    echo.>> .env
    echo # Rate limiting>> .env
    echo RATE_LIMIT_REQUESTS=100>> .env
    echo RATE_LIMIT_WINDOW=60>> .env
    echo.>> .env
    echo # Logging>> .env
    echo LOG_LEVEL=INFO>> .env
    echo ✅ Backend .env file created
) else (
    echo ⚠️  Backend .env file already exists
)

cd ../frontend
if not exist .env (
    echo # Firebase configuration (REPLACE WITH YOUR VALUES)> .env
    echo VITE_FIREBASE_API_KEY=your-firebase-api-key>> .env
    echo VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com>> .env
    echo VITE_FIREBASE_PROJECT_ID=your-firebase-project-id>> .env
    echo VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com>> .env
    echo VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id>> .env
    echo VITE_FIREBASE_APP_ID=your-app-id>> .env
    echo.>> .env
    echo # API configuration>> .env
    echo VITE_API_BASE_URL=http://localhost:8000/api/v1>> .env
    echo.>> .env
    echo # reCAPTCHA (optional)>> .env
    echo VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key>> .env
    echo ✅ Frontend .env file created
) else (
    echo ⚠️  Frontend .env file already exists
)

REM Run tests
echo 🧪 Running system tests...

cd ..
python test_system.py

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit the .env files with your actual API keys and credentials
echo 2. Start the backend: cd backend ^& .venv\Scripts\activate ^& uvicorn main:app --reload
echo 3. Start the frontend: cd frontend ^& npm run dev
echo 4. Visit http://localhost:5173 to see your app
echo.
echo 📚 For detailed instructions, see INSTALLATION_TESTING_GUIDE.md
echo 🔗 API Documentation: http://localhost:8000/docs

pause