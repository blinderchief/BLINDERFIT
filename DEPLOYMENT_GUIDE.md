# BlinderFit Deployment Guide

Complete step-by-step guide for deploying BlinderFit to production using **Clerk** (auth), **Neon** (database), **Railway** (backend), and **Vercel** (frontend).

---

## Prerequisites

- GitHub account with the BlinderFit repo pushed
- [Clerk](https://clerk.com) account (free tier)
- [Neon](https://neon.tech) account (free tier)
- [Railway](https://railway.app) account (Hobby plan or higher)
- [Vercel](https://vercel.com) account (free tier)
- [Google AI Studio](https://aistudio.google.com) API key

---

## 1. Clerk Authentication Setup

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Name it **BlinderFit** and enable **Email** sign-in
3. From the Clerk Dashboard → **API Keys**, copy:
   - **Publishable key** (`pk_live_...` or `pk_test_...`)
   - **Secret key** (`sk_live_...` or `sk_test_...`)
4. Under **Domains** → add your production frontend URL (e.g., `https://blinderfit.vercel.app`)
5. Under **JWT Templates** (optional) — the default session token works out of the box

### Clerk Keys Needed

| Key | Where Used |
|-----|-----------|
| `pk_live_...` (Publishable) | Frontend `VITE_CLERK_PUBLISHABLE_KEY` |
| `sk_live_...` (Secret) | Backend `CLERK_SECRET_KEY` |

---

## 2. Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and create a new project
2. Name it **blinderfit** and select a region close to your Railway backend
3. Copy the **connection string** from the dashboard:
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/blinderfit?sslmode=require
   ```
4. The database tables are created automatically on first backend startup (SQLAlchemy `create_all`)

### Neon Connection String

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host.neon.tech/blinderfit?sslmode=require` |

---

## 3. Google Gemini AI Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → **Create API key**
3. Copy the API key

| Variable | Value |
|----------|-------|
| `GOOGLE_AI_API_KEY` | `AIza...` |

---

## 4. Backend Deployment (Railway)

### 4.1 Create Railway Service

1. Go to [railway.app](https://railway.app) and create a new project
2. Click **New Service** → **GitHub Repo** → select your BlinderFit repo
3. Set the **Root Directory** to `backend`
4. Railway will auto-detect the Dockerfile

### 4.2 Set Environment Variables

In Railway's service settings → **Variables**, add:

```
DATABASE_URL=postgresql://user:pass@host.neon.tech/blinderfit?sslmode=require
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
GOOGLE_AI_API_KEY=AIza_your_gemini_api_key
ENVIRONMENT=production
PORT=8000
ALLOWED_ORIGINS=["https://blinderfit.vercel.app","https://your-custom-domain.com"]
```

### 4.3 Deploy

Railway will automatically build and deploy from the Dockerfile. After deployment:

1. Copy the generated public URL (e.g., `https://blinderfit-backend-production.up.railway.app`)
2. Test the health endpoint:
   ```bash
   curl https://blinderfit-backend-production.up.railway.app/health
   # Should return: {"status":"healthy","version":"1.0.0"}
   ```
3. Test the API docs: `https://your-backend-url.up.railway.app/docs`

### 4.4 Custom Domain (Optional)

1. In Railway → Service → **Settings** → **Networking**
2. Add your custom domain (e.g., `api.blinderfit.com`)
3. Add the CNAME record to your DNS

---

## 5. Frontend Deployment (Vercel)

### 5.1 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import your GitHub repo
3. Set the **Root Directory** to `frontend`
4. Vercel auto-detects the Vite framework

### 5.2 Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
VITE_API_BASE_URL=https://blinderfit-backend-production.up.railway.app
```

### 5.3 Deploy

Click **Deploy**. Vercel will build and publish the frontend.

### 5.4 Custom Domain (Optional)

1. In Vercel → Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `blinderfit.com`)
3. Update DNS records as instructed

---

## 6. Post-Deployment Checklist

### Verify Backend
```bash
# Health check
curl https://your-backend-url/health

# API docs
open https://your-backend-url/docs
```

### Verify Frontend
1. Open the Vercel URL in a browser
2. Check that the Clerk sign-in/sign-up modal works
3. Register a test user
4. Verify the user appears in Clerk Dashboard → **Users**

### Verify Database
1. Open Neon Dashboard → **Tables**
2. After first user registration, verify `users` table has a row

### Update CORS
Make sure `ALLOWED_ORIGINS` on Railway includes your Vercel domain:
```
ALLOWED_ORIGINS=["https://blinderfit.vercel.app"]
```

### Update Clerk Domains
In Clerk Dashboard → **Domains**, ensure your Vercel URL is listed as an allowed origin.

---

## 7. Environment Variables Summary

### Backend (Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string |
| `CLERK_SECRET_KEY` | **Yes** | Clerk secret key |
| `GOOGLE_AI_API_KEY` | **Yes** | Google Gemini API key |
| `PORT` | No | Default: `8000` (Railway sets this) |
| `ENVIRONMENT` | No | `production` |
| `ALLOWED_ORIGINS` | No | JSON array of CORS origins |
| `SERPAPI_KEY` | No | SerpAPI key for web search |
| `GOOGLE_CLIENT_ID` | No | Google OAuth (wearables) |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth (wearables) |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk publishable key |
| `VITE_API_BASE_URL` | **Yes** | Backend API URL |

---

## 8. Monitoring & Troubleshooting

### Health Check
```bash
curl -f https://your-backend-url/health
```

### Railway Logs
Railway Dashboard → Service → **Logs** tab

### Common Issues

| Problem | Solution |
|---------|----------|
| CORS errors | Check `ALLOWED_ORIGINS` on Railway includes your frontend URL |
| 401 Unauthorized | Verify `CLERK_SECRET_KEY` is correct and matches your Clerk app |
| Database connection failed | Check `DATABASE_URL` format with `?sslmode=require` |
| Gemini API errors | Verify `GOOGLE_AI_API_KEY` is valid and has quota |
| Frontend shows blank page | Check browser console for errors; verify `VITE_CLERK_PUBLISHABLE_KEY` |

### API Documentation
- **Swagger UI**: `https://your-backend-url/docs`
- **ReDoc**: `https://your-backend-url/redoc`

---

## 9. Updating

### Deploy Backend Changes
Push to the `main` branch — Railway auto-deploys from GitHub.

### Deploy Frontend Changes
Push to the `main` branch — Vercel auto-deploys from GitHub.

### Database Migrations
Tables are auto-created via SQLAlchemy `Base.metadata.create_all()` on backend startup. For schema changes, update the models in `app/core/database.py` and redeploy.</content>
<parameter name="filePath">c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_\DEPLOYMENT_GUIDE.md