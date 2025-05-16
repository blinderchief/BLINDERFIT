# BlinderFit Deployment Guide

This guide provides step-by-step instructions for deploying the BlinderFit application to Firebase hosting.

## Prerequisites

1. Node.js and npm installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Access to the BlinderFit Firebase project

## Fixed Issues

We've resolved two major issues in this project:

1. **Build Error (EISDIR)**: Fixed by removing the incorrect `ui` chunk in the manual chunking configuration in `vite.config.js` that was trying to import the entire `components/ui` directory.

2. **Firebase Hosting Target Issue**: Fixed by updating the `.firebaserc` file to use only one site for the `blinderfit-live` target.

## Deployment Steps

### 1. Build the Application

```bash
# Clean previous build
rmdir /s /q dist

# Install dependencies (if needed)
npm install

# Build the application
npm run build
```

### 2. Verify Firebase Configuration

```bash
# Log in to Firebase (if not already logged in)
firebase login

# Select the correct project
firebase use blinderfit

# Set up the hosting target
firebase target:apply hosting blinderfit-live blinderfit-live
```

### 3. Deploy to Firebase

```bash
# Deploy hosting only
firebase deploy --only hosting
```

## Troubleshooting

### 1. Login Issues

If you're having trouble logging in to Firebase, try:

```bash
firebase logout
firebase login
```

### 2. Deployment Target Issues

If you see an error about hosting targets being linked to multiple sites:

1. Check `.firebaserc` to ensure each target has only one site.
2. Run `firebase target:clear hosting blinderfit-live` and then `firebase target:apply hosting blinderfit-live blinderfit-live`.

### 3. Build Issues

If you encounter build errors:

1. Check `vite.config.js` for any incorrect imports or configurations.
2. Run `npm run build -- --debug` for more detailed error messages.

## Verification

After deployment:

1. Visit your site at [https://blinderfit-live.web.app](https://blinderfit-live.web.app) or your custom domain.
2. Test login and registration functionality.
3. Verify the PulseHub section renders correctly.

## Manual Deployment (Alternative)

If the automated deployment fails, you can manually upload the built files:

1. Build the application with `npm run build`.
2. Go to the Firebase Console > Hosting.
3. Click "Get Started" or "Add another site".
4. Follow the instructions to manually upload the contents of the `dist` folder.

## Next Steps

After successful deployment:

1. Set up custom domains in Firebase Hosting if needed.
2. Configure Firebase Authentication for your production environment.
3. Set up monitoring and analytics.
