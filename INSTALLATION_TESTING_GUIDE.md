# Blinderfit Installation and Testing Guide

## Prerequisites

Before installing Blinderfit, ensure you have the following:

### System Requirements
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **Git**: Latest version
- **Docker**: Optional (for containerized deployment)

### Required Accounts & API Keys
1. **Firebase Project**: For authentication and database
2. **Google AI API Key**: For Gemini AI functionality
3. **Google Cloud Project**: For additional integrations

## 1. Install UV Package Manager

UV is a fast Python package manager that replaces pip, pip-tools, and virtualenv.

### Windows (PowerShell)
```powershell
# Install UV using PowerShell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or using pip (if you prefer)
pip install uv
```

### Linux/macOS
```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or using pip
pip install uv
```

### Verify Installation
```bash
uv --version
```

## 2. Backend Installation

### Clone and Setup
```bash
# Navigate to your project directory
cd "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_"

# Go to backend directory
cd backend
```

### Create Virtual Environment with UV
```bash
# Create a virtual environment
uv venv

# Activate the virtual environment
# Windows (cmd)
venv\Scripts\activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Linux/macOS
source venv/bin/activate
```

### Install Dependencies
```bash
# Install all dependencies (production + development)
uv sync

# Or install only production dependencies
uv sync --no-dev

# Install only development dependencies
uv sync --group dev
```

### Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Copy the template
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# Environment
ENVIRONMENT=development

# Server settings
HOST=0.0.0.0
PORT=8000

# CORS settings
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173", "https://blinderfit.blinder.live"]

# Firebase settings
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google AI (Gemini) settings
GOOGLE_AI_API_KEY=your-google-ai-api-key
GEMINI_MODEL=gemini-2.5-flash

# JWT settings
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
```

## 3. Frontend Installation

### Navigate to Frontend Directory
```bash
# From the project root
cd frontend
```

### Install Dependencies
```bash
# Install all dependencies
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### Environment Configuration

Create a `.env` file in the frontend directory:

```bash
# Copy the template (if exists)
cp .env.example .env
```

Edit the `.env` file:

```env
# Firebase configuration
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
```

## 4. Testing Setup

### Backend Testing

#### Install Test Dependencies
```bash
# From backend directory with virtual environment activated
uv pip install -e . --group test
```

#### Run Tests
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run tests in verbose mode
pytest -v

# Run tests with specific marker
pytest -m "unit"

# Run tests and stop on first failure
pytest -x
```

#### Test Configuration
The `pytest.ini` file is already configured with:
- Async test support
- Coverage reporting
- Test discovery patterns
- Custom markers

### Frontend Testing

#### Install Test Dependencies (if needed)
```bash
# From frontend directory
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## 5. Running the Application

### Development Mode

#### Backend
```bash
# From backend directory with virtual environment activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python module
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
# From frontend directory
npm run dev

# Or using yarn
yarn dev

# Or using pnpm
pnpm dev
```

### Production Mode

#### Backend
```bash
# Using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Or using gunicorn (recommended for production)
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 6. End-to-End Testing

### Manual Testing Checklist

#### 1. Backend Health Check
```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response: {"status": "healthy", "version": "1.0.0"}
```

#### 2. API Documentation
- Visit: http://localhost:8000/docs (Swagger UI)
- Visit: http://localhost:8000/redoc (ReDoc)

#### 3. Frontend Accessibility
- Visit: http://localhost:5173
- Check all pages load correctly
- Test navigation between pages

#### 4. Authentication Flow
1. Register a new user
2. Login with credentials
3. Access protected routes
4. Logout functionality

#### 5. Core Features Testing

**AI Chat:**
```bash
curl -X POST "http://localhost:8000/ai/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello, how can you help me with fitness?"}'
```

**Google Search:**
```bash
curl -X POST "http://localhost:8000/integrations/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "healthy breakfast recipes", "num_results": 5}'
```

**Health Data:**
```bash
curl -X POST "http://localhost:8000/onboarding/health-data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "age": 30,
    "weight": 70,
    "height": 170,
    "gender": "male",
    "activityLevel": "moderate",
    "goals": ["weight_loss"],
    "healthIssues": [],
    "fitnessLevel": "intermediate",
    "availableTime": 60,
    "preferredWorkoutDays": ["monday", "wednesday", "friday"]
  }'
```

### Automated End-to-End Testing

#### Using Playwright (Recommended)
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui
```

#### Using Cypress
```bash
# Install Cypress
npm install --save-dev cypress

# Open Cypress
npx cypress open

# Run tests headlessly
npx cypress run
```

## 7. Performance Testing

### Backend Performance
```bash
# Install locust for load testing
uv pip install locust

# Run load tests
locust -f tests/load_tests.py
```

### Frontend Performance
```bash
# Using Lighthouse
npm install --save-dev lighthouse

# Run Lighthouse audit
npx lighthouse http://localhost:5173 --output html --output-path ./lighthouse-report.html
```

## 8. Docker Deployment (Optional)

### Build and Run with Docker Compose
```bash
# From project root
docker-compose up --build

# Or for production
docker-compose -f docker-compose.prod.yml up --build
```

### Individual Container Testing
```bash
# Build backend container
docker build -t blinderfit-backend ./backend

# Run backend container
docker run -p 8000:8000 --env-file ./backend/.env blinderfit-backend

# Build frontend container
docker build -t blinderfit-frontend ./frontend

# Run frontend container
docker run -p 80:80 blinderfit-frontend
```

## 9. Monitoring and Logging

### Backend Monitoring
- Health checks: `GET /health`
- Metrics: Prometheus integration ready
- Logs: Structured logging with configurable levels

### Frontend Monitoring
- Error boundaries implemented
- React Query for API state management
- Console logging for debugging

## 10. Troubleshooting

### Common Backend Issues

1. **Import Errors**
   ```bash
   # Reinstall dependencies
   uv pip install -e . --force-reinstall
   ```

2. **Environment Variables**
   ```bash
   # Check environment variables
   python -c "import os; print(os.environ.get('GOOGLE_AI_API_KEY'))"
   ```

3. **Firebase Connection**
   ```bash
   # Test Firebase connection
   python -c "from app.core.database import init_firebase; import asyncio; asyncio.run(init_firebase())"
   ```

### Common Frontend Issues

1. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment Variables**
   ```bash
   # Check Vite environment variables
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```

3. **CORS Issues**
   - Check ALLOWED_ORIGINS in backend .env
   - Ensure backend is running on correct port

### Performance Issues

1. **Slow Backend Response**
   - Check database connections
   - Monitor API key rate limits
   - Review logging levels

2. **Slow Frontend Loading**
   - Check bundle size: `npm run build`
   - Optimize images and assets
   - Review network requests

## 11. Production Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring and alerting setup
- [ ] CDN configured for static assets
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Backup and recovery tested
- [ ] Documentation updated

## 12. Support and Resources

### Documentation
- API Documentation: http://localhost:8000/docs
- Frontend Components: Check `src/components/` directory
- Backend Modules: Check `app/` directory

### Getting Help
1. Check logs in `logs/` directory
2. Review error messages in console
3. Check GitHub issues for similar problems
4. Review the DEPLOYMENT_GUIDE.md for deployment issues

### Useful Commands

```bash
# Backend
uv --version                    # Check UV version
uv pip list                     # List installed packages
uv pip check                    # Check for dependency conflicts
pytest --collect-only           # List all tests without running

# Frontend
npm list                       # List installed packages
npm audit                       # Check for security vulnerabilities
npm run build --dry-run        # Check build without creating files
```

This guide provides comprehensive instructions for installing, configuring, and testing your Blinderfit application using UV package manager and modern development practices.