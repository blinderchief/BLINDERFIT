# Manual Deployment Guide for BlinderFit

If you're experiencing issues with automated deployment scripts, follow these manual steps to deploy your changes to blinderfit.blinder.live:

## Prerequisites
- Make sure you have Firebase CLI installed (`npm install -g firebase-tools`)
- Make sure you're logged in to Firebase (`firebase login`)

## Step-by-Step Deployment

### 1. Build the Application
```bash
cd "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_"
npx vite build
```

### 2. Verify the Build
Check that the build was successful by confirming that the `dist` folder contains `index.html` and other assets.

### 3. Deploy to Firebase Hosting
```bash
cd "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_"
firebase deploy --only hosting
```

### 4. Alternative: Deploy with Specific Project and Target
If the above doesn't work, try specifying the project ID and target:
```bash
cd "c:\Users\SUYASH KUMAR SINGH\OneDrive\Desktop\Blinderfit_"
firebase deploy --only hosting:blinderfit-live --project blinderfit
```

### 5. Check Your Deployment
After deployment, visit https://blinderfit.blinder.live to see your changes. It might take a few minutes for changes to propagate.

## Troubleshooting

### Firebase Login Issues
If you're having problems with Firebase login, try:
```bash
firebase logout
firebase login
```

### Permission Issues
Make sure you have the proper permissions for the Firebase project. You should be either the project owner or have Editor/Developer permissions.

### Build Issues
If you encounter build issues, try cleaning the build directory:
```bash
rd /s /q dist
npx vite build
```

### Firebase Configuration Issues
Double-check the `.firebaserc` file to ensure it has the correct project ID and hosting targets.

### Manual Upload
As a last resort, you could manually upload the built files to Firebase hosting through the Firebase Console web interface.
