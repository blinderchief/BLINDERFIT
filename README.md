# BlinderFit

AI-powered personalized fitness coach with health tracking, meal logging, exercise planning, and real-time insights — powered by Google Gemini.

## Architecture

| Layer | Technology | Hosting |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui | Vercel |
| **Backend** | Python 3.11 + FastAPI + SQLAlchemy | Railway (Docker) |
| **Database** | PostgreSQL (Neon serverless) | Neon |
| **Auth** | Clerk (JWT) | Clerk |
| **AI** | Google Gemini | Google AI |

## Project Structure

```
BlinderFit/
├── frontend/          # React + TypeScript + Vite app
│   ├── src/
│   │   ├── components/  # UI components + shadcn/ui
│   │   ├── contexts/    # Auth + HealthData contexts
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API client (Axios)
│   │   └── App.tsx      # Root with ClerkProvider
│   ├── vercel.json      # Vercel deployment config
│   └── package.json
├── backend/           # Python FastAPI API server
│   ├── app/
│   │   ├── core/        # Config + database (SQLAlchemy/Neon)
│   │   ├── middleware/   # Auth, rate limiting, security
│   │   ├── routes/       # API route handlers
│   │   └── services/     # Gemini AI, integrations
│   ├── tests/           # Pytest test suite
│   ├── Dockerfile       # Production container
│   ├── railway.toml     # Railway deployment config
│   └── requirements.txt
└── DEPLOYMENT_GUIDE.md  # Step-by-step deployment instructions
```

## Quick Start

### Prerequisites

- Node.js 20+ 
- Python 3.11+
- A [Clerk](https://clerk.com) account (free tier works)
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your Clerk publishable key and backend URL
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL, CLERK_SECRET_KEY, GOOGLE_AI_API_KEY
uvicorn main:app --reload --port 8000
```

## Features

- **FitMentor** — AI health Q&A powered by Gemini
- **PulseHub** — Real-time health dashboard with charts
- **Assessment** — Personalized onboarding questionnaire
- **Tracking** — Meal, exercise, and weight logging
- **Plans** — AI-generated personalized fitness plans
- **FitLearn** — Health & nutrition educational content
- **MindShift** — Mental wellness resources
- **TribeVibe** — Community features
- **MyZone** — Personal profile and progress

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions covering:

1. **Clerk** — Authentication setup
2. **Neon** — PostgreSQL database provisioning
3. **Railway** — Backend deployment (Docker)
4. **Vercel** — Frontend deployment

## API Documentation

When the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## License

Private
