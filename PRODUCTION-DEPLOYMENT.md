# BlinderFit Production Deployment Guide

This guide provides comprehensive instructions for deploying the BlinderFit application to production at blinderfit.blinder.live.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project configured
3. Google Generative AI API key
4. Domain ownership of blinderfit.blinder.live
5. Node.js 20.x installed

## Deployment Steps

### 1. Configure Environment Variables

1. Create or update `.env` file in the `functions` directory:

```
GOOGLE_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE
GENKIT_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE
FIREBASE_PROJECT_ID=blinderfit
GENKIT_MODEL=gemini-1.5-pro
```

2. Set Firebase Config Variables:

```
firebase use blinderfit
firebase functions:config:set genkit.apikey="AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE"
```

### 2. Connect Custom Domain

Follow the steps in [DOMAIN-SETUP.md](./DOMAIN-SETUP.md) to connect your custom domain (blinderfit.blinder.live) to Firebase hosting.

### 3. Build and Deploy

Use our provided script to build and deploy the application:

```
deploy-production.bat
```

This script will:
- Build the frontend application
- Install Functions dependencies
- Deploy Firebase Functions
- Deploy Firebase Hosting

### 4. Verify Deployment

After deployment, verify:

1. Frontend loads properly at https://blinderfit.blinder.live
2. Authentication works
3. AI functionality works correctly:
   - Test askAI functionality
   - Test fitness plan generation

### 5. Monitoring and Logs

Monitor your production deployment:

1. Firebase Console: https://console.firebase.google.com/project/blinderfit
2. Firebase Functions logs: `firebase functions:log`
3. Google Cloud Console for more detailed logs

### Troubleshooting

#### CORS Issues

If you encounter CORS issues, verify:
1. Your domain is correctly added to the CORS whitelist
2. Firebase Functions are properly deployed
3. The Express app is correctly handling CORS headers

#### AI Functionality Issues

If AI functionality doesn't work:
1. Check API keys in environment variables
2. Verify Firebase Authentication is working correctly
3. Inspect browser console for errors
4. Check Firebase Function logs

#### Deployment Issues

If deployment fails:
1. Check for build errors in the logs
2. Verify Node.js version compatibility
3. Ensure all dependencies are correctly installed
4. Check Firebase CLI permissions

## Automated Health Checks

You can use the health check endpoint to verify API functionality:

```
curl https://us-central1-blinderfit.cloudfunctions.net/app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-05-15T12:34:56.789Z",
  "environment": "production"
}
```
