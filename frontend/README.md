# BlinderFit Frontend

React + TypeScript + Vite frontend for BlinderFit — an AI-powered personalized fitness coach.

## Tech Stack

- **React 18** + **TypeScript 5.5** + **Vite 5.4**
- **Tailwind CSS 3.4** + **shadcn/ui** (Radix UI primitives)
- **Clerk** for authentication (`@clerk/clerk-react`)
- **Axios** for API communication
- **Recharts** for data visualization
- **React Router 6** for client-side routing

## Project Structure

```
src/
├── components/       # Reusable UI components (Layout, Chatbot, ProfileForm, etc.)
│   └── ui/           # shadcn/ui components
├── contexts/         # React contexts (AuthContext, HealthDataContext)
├── hooks/            # Custom hooks (use-ai, use-toast, etc.)
├── pages/            # Page components (Home, FitMentor, PulseHub, etc.)
├── services/         # API service layer (api.ts)
├── lib/              # Utility libraries (content, utils)
├── utils/            # Shared utilities
├── App.tsx           # Root component with ClerkProvider + routing
└── main.tsx          # Entry point
```

## Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (from Clerk Dashboard) |
| `VITE_API_BASE_URL` | Backend API URL (e.g., `http://localhost:8000`) |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment (Vercel)

The frontend deploys to **Vercel** with the included `vercel.json` config.

1. Connect your GitHub repo to Vercel
2. Set the **Root Directory** to `frontend`
3. Add environment variables in Vercel dashboard:
   - `VITE_CLERK_PUBLISHABLE_KEY` → your Clerk publishable key
   - `VITE_API_BASE_URL` → your Railway backend URL (e.g., `https://blinderfit-backend.up.railway.app`)
4. Deploy — Vercel auto-detects Vite and builds accordingly

## Key Features

- **FitMentor** — AI-powered health Q&A via Gemini 2.5 Flash
- **PulseHub** — Real-time health dashboard with charts
- **MyZone** — Personal profile and goal tracking
- **FitLearn** — Educational health content
- **Tracking** — Meal, exercise, and weight logging
- **Assessment** — Health onboarding questionnaire