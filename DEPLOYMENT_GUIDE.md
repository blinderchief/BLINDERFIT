# Blinderfit Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying Blinderfit to production using Firebase and Docker.

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Docker and Docker Compose installed
- Google Cloud Platform project
- Domain name (optional but recommended)

## 1. Firebase Setup

### 1.1 Create Firebase Project
```bash
# Login to Firebase
firebase login

# Create new project
firebase projects:create blinderfit-prod

# Select the project
firebase use blinderfit-prod
```

### 1.2 Enable Required Services
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication
3. Enable Firestore Database
4. Enable Storage (for file uploads)
5. Enable Hosting
6. Enable Cloud Functions (if needed)

### 1.3 Configure Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password and Google providers
3. Configure authorized domains (add your production domain)

### 1.4 Firestore Security Rules
The Firestore rules are already configured in `firestore.rules`. Deploy them:
```bash
firebase deploy --only firestore:rules
```

### 1.5 Firestore Indexes
Deploy the indexes:
```bash
firebase deploy --only firestore:indexes
```

## 2. Environment Variables Setup

### 2.1 Backend Environment Variables
Create a `.env` file in the backend directory:

```env
# Environment
ENVIRONMENT=production

# Server
HOST=0.0.0.0
PORT=8000

# CORS
ALLOWED_ORIGINS=https://blinderfit.blinder.live,https://blinderfit-prod.web.app,https://blinderfit-prod.firebaseapp.com

# Firebase
FIREBASE_PROJECT_ID=blinderfit-prod
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@blinderfit-prod.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40blinderfit-prod.iam.gserviceaccount.com

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Logging
LOG_LEVEL=INFO
```

### 2.2 Frontend Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=https://api.blinderfit.blinder.live
VITE_APP_NAME=Blinderfit
VITE_APP_VERSION=1.0.0
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=blinderfit-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blinderfit-prod
VITE_FIREBASE_STORAGE_BUCKET=blinderfit-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 3. Docker Deployment

### 3.1 Build and Deploy with Docker Compose
```bash
# Navigate to project root
cd /path/to/blinderfit

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3.2 Environment Variables for Docker
Create a `.env.prod` file for production:

```env
# Firebase
FIREBASE_PROJECT_ID=blinderfit-prod
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@blinderfit-prod.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40blinderfit-prod.iam.gserviceaccount.com

# API Keys
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET_KEY=your-jwt-secret

# URLs
ALLOWED_ORIGINS=https://blinderfit.blinder.live
VITE_API_BASE_URL=https://api.blinderfit.blinder.live
```

Run with environment file:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## 4. Firebase Hosting Setup

### 4.1 Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4.2 Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### 4.3 Configure Hosting
Update `firebase.json` if needed:

```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.css",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 5. Domain Configuration

### 5.1 Custom Domain Setup
1. Go to Firebase Console > Hosting
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

### 5.2 API Domain
For the backend API, you can:
- Use Firebase Cloud Functions
- Deploy to Google Cloud Run
- Use a VPS with Nginx reverse proxy

## 6. SSL and Security

### 6.1 SSL Certificate
Firebase Hosting provides automatic SSL certificates. For custom domains:
- SSL is automatically provisioned by Firebase
- Renewals are handled automatically

### 6.2 Security Headers
Security headers are configured in the backend middleware and nginx configuration.

## 7. Monitoring and Logging

### 7.1 Firebase Monitoring
- Use Firebase Crashlytics for error monitoring
- Firebase Performance Monitoring for app performance
- Firebase Analytics for user behavior

### 7.2 Backend Monitoring
```bash
# Check backend health
curl https://api.blinderfit.blinder.live/health

# View logs
docker-compose -f docker-compose.prod.yml logs backend
```

## 8. Backup and Recovery

### 8.1 Firestore Backup
```bash
# Export data
gcloud firestore export gs://blinderfit-backup --project=blinderfit-prod

# Import data
gcloud firestore import gs://blinderfit-backup --project=blinderfit-prod
```

### 8.2 Database Backup Strategy
- Daily automated backups
- Point-in-time recovery available
- Test restoration procedures regularly

## 9. Scaling

### 9.1 Horizontal Scaling
```yaml
# Update docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

### 9.2 Load Balancing
- Use Firebase Hosting for frontend load balancing
- Consider Google Cloud Load Balancer for backend
- Implement Redis clustering for session storage

## 10. Troubleshooting

### 10.1 Common Issues

**Backend not starting:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker-compose -f docker-compose.prod.yml exec backend env
```

**Firebase authentication issues:**
- Verify API keys in environment variables
- Check Firebase Console configuration
- Ensure authorized domains are configured

**CORS errors:**
- Verify ALLOWED_ORIGINS in backend environment
- Check nginx configuration for API proxy

### 10.2 Health Checks
```bash
# Backend health
curl -f https://api.blinderfit.blinder.live/health

# Frontend health
curl -f https://blinderfit.blinder.live
```

## 11. Maintenance

### 11.1 Regular Updates
```bash
# Update dependencies
cd backend && pip install -U -r requirements.txt
cd ../frontend && npm update

# Rebuild and deploy
docker-compose -f docker-compose.prod.yml up -d --build
firebase deploy
```

### 11.2 Monitoring Alerts
- Set up alerts for high error rates
- Monitor API response times
- Track user engagement metrics

## 12. Cost Optimization

### 12.1 Firebase Costs
- Monitor usage in Firebase Console
- Set up budgets and alerts
- Optimize Firestore queries

### 12.2 API Costs
- Monitor Gemini API usage
- Implement caching strategies
- Use appropriate model sizes

## Support
For issues or questions:
- Check the logs: `docker-compose logs`
- Review Firebase Console for errors
- Contact the development team

## Checklist
- [ ] Firebase project created and configured
- [ ] Environment variables set up
- [ ] Docker containers built and running
- [ ] Frontend deployed to Firebase Hosting
- [ ] Custom domain configured (optional)
- [ ] SSL certificates provisioned
- [ ] Health checks passing
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented
- [ ] Security headers verified</content>
<parameter name="filePath">c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_\DEPLOYMENT_GUIDE.md