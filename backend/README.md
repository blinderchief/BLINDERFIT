# BlinderFit Backend

Python FastAPI backend for BlinderFit — an AI-powered personalized fitness coach.

## Tech Stack

- **Python 3.11** + **FastAPI 0.115**
- **SQLAlchemy 2.0** + **Neon PostgreSQL** (serverless Postgres)
- **Clerk** for JWT authentication (JWKS verification)
- **Google Gemini 2.5 Flash** for AI responses
- **Uvicorn** ASGI server with multi-worker support

## Project Structure

```
backend/
├── main.py                # FastAPI app entry point, middleware, routers
├── requirements.txt       # Python dependencies
├── Dockerfile             # Production container image
├── railway.toml           # Railway deployment config
├── app/
│   ├── core/
│   │   ├── config.py      # Pydantic settings (env vars)
│   │   └── database.py    # PostgreSQL + SQLAlchemy ORM models
│   ├── middleware/
│   │   ├── auth_middleware.py      # Clerk JWT verification
│   │   ├── rate_limit_middleware.py # Per-endpoint rate limiting
│   │   └── security_middleware.py   # Security headers, logging, IP filter
│   ├── models/
│   │   └── __init__.py    # Pydantic request/response models
│   ├── routes/
│   │   ├── auth.py        # Auth (Clerk JWKS, register, profile)
│   │   ├── onboarding.py  # Health data + goals submission
│   │   ├── ai_chat.py     # Gemini AI chat endpoint
│   │   ├── plans.py       # Personalized fitness plan generation
│   │   ├── tracking.py    # Meal, exercise, weight logging
│   │   ├── dashboard.py   # Dashboard + PulseHub data
│   │   ├── ml_predictions.py  # ML-based predictions & insights
│   │   ├── notifications.py   # Push notification management
│   │   └── integrations.py    # Web search, nutrition, wearables
│   ├── services/
│   │   ├── gemini_service.py       # Google Gemini AI client
│   │   ├── integrations_service.py # External API integrations
│   │   └── notification_service.py # Notification logic
│   └── utils/
└── tests/
    ├── conftest.py        # Test fixtures (Clerk mock)
    ├── test_auth.py       # Auth + endpoint tests
    └── test_services.py   # Service-layer tests
```

## Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (from Clerk Dashboard) |
| `GOOGLE_AI_API_KEY` | Yes | Google Gemini API key |
| `PORT` | No | Server port (default: `8000`) |
| `ENVIRONMENT` | No | `development` / `production` |
| `ALLOWED_ORIGINS` | No | JSON array of allowed CORS origins |
| `SERPAPI_KEY` | No | SerpAPI key for web search |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (wearables) |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

## Getting Started

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your actual values

# Run development server
uvicorn main:app --reload --port 8000
```

The API docs are available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Sync Clerk user to DB |
| `POST` | `/auth/verify-token` | Verify JWT token |
| `GET` | `/auth/profile` | Get user profile |
| `PUT` | `/auth/profile` | Update user profile |
| `POST` | `/onboarding/health-data` | Submit health data |
| `POST` | `/onboarding/goals` | Submit fitness goals |
| `POST` | `/ai/chat` | AI chat with Gemini |
| `GET` | `/ai/history` | Get chat history |
| `POST` | `/plans/generate` | Generate fitness plan |
| `GET` | `/plans/current` | Get current plan |
| `POST` | `/tracking/meal` | Log meal |
| `POST` | `/tracking/exercise` | Log exercise |
| `GET` | `/dashboard/overview` | Dashboard data |
| `GET` | `/ml/predictions` | ML predictions |
| `POST` | `/notifications/send` | Send notification |
| `POST` | `/integrations/web-search` | Web search |

## Deployment (Railway)

The backend deploys to **Railway** using Docker.

1. Connect your GitHub repo to Railway
2. Create a new service and set the **Root Directory** to `backend`
3. Add environment variables in Railway dashboard
4. Railway will auto-detect the Dockerfile and deploy

See the [Deployment Guide](../DEPLOYMENT_GUIDE.md) for detailed instructions.

## Running Tests

```bash
cd backend
pytest tests/ -v
```
