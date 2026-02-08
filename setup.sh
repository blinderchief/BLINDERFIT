#!/bin/bash
# Blinderfit Quick Setup Script
# This script helps you quickly set up the entire Blinderfit application

set -e

echo "🚀 Blinderfit Quick Setup"
echo "=========================="

# Check if we're on Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "Windows detected. Please run this script in PowerShell or manually follow the installation guide."
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install UV if not present
if ! command_exists uv; then
    echo "📦 Installing UV package manager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

echo "✅ UV installed"

# Setup backend
echo "🔧 Setting up backend..."

cd backend

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
uv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing backend dependencies..."
uv sync

echo "✅ Backend setup complete"

# Setup frontend
echo "🎨 Setting up frontend..."

cd ../frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete"

# Create environment files
echo "📝 Creating environment files..."

cd ../backend
if [ ! -f .env ]; then
    cat > .env << EOF
# Environment
ENVIRONMENT=development

# Server settings
HOST=0.0.0.0
PORT=8000

# CORS settings
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Firebase settings (REPLACE WITH YOUR VALUES)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Google AI (Gemini) settings (REPLACE WITH YOUR VALUES)
GOOGLE_AI_API_KEY=your-google-ai-api-key
GEMINI_MODEL=gemini-2.5-flash

# JWT settings (REPLACE WITH YOUR VALUES)
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database settings
FIRESTORE_EMULATOR_HOST=

# API settings
API_V1_PREFIX=/api/v1

# Rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Logging
LOG_LEVEL=INFO
EOF
    echo "✅ Backend .env file created"
else
    echo "⚠️  Backend .env file already exists"
fi

cd ../frontend
if [ ! -f .env ]; then
    cat > .env << EOF
# Firebase configuration (REPLACE WITH YOUR VALUES)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# API configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1

# reCAPTCHA (optional)
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
EOF
    echo "✅ Frontend .env file created"
else
    echo "⚠️  Frontend .env file already exists"
fi

# Run tests
echo "🧪 Running system tests..."

cd ..
python test_system.py

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit the .env files with your actual API keys and credentials"
echo "2. Start the backend: cd backend && source .venv/bin/activate && uvicorn main:app --reload"
echo "3. Start the frontend: cd frontend && npm run dev"
echo "4. Visit http://localhost:5173 to see your app"
echo ""
echo "📚 For detailed instructions, see INSTALLATION_TESTING_GUIDE.md"
echo "🔗 API Documentation: http://localhost:8000/docs"