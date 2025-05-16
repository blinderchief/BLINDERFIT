# BlinderFit Authentication and AppCheck Troubleshooting Guide

## Current Issues Fixed

### 1. Firebase Authentication Error
**Issue:** Authentication was failing with the error:
```
FirebaseError: AppCheck: ReCAPTCHA error. (appCheck/recaptcha-error).
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword 403 (Forbidden)
Firebase: Error (auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.authenticationservice.signinwithpassword-are-blocked.)
```

**Fix Applied:** 
- Updated Firebase AppCheck with a valid reCAPTCHA site key
- Updated Firebase configuration with the correct API key and settings
- Fixed build error related to multiple exports of `appCheck`

### 2. PulseHub Loading Screen Issue
**Issue:** PulseHub page was stuck showing "Loading your vision dashboard..." indefinitely

**Fix Applied:**
- Added proper error handling and timeout logic to the data fetching in PulseHub
- Improved the loading screen with helpful information if loading takes too long
- Added a fallback UI when no user is authenticated

## Re-enabling AppCheck for Production

When you're ready to re-enable AppCheck for production, follow these steps:

1. **Create a new reCAPTCHA v3 site key:**
   - Go to the [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
   - Create a new reCAPTCHA v3 key for your domain (blinderfit.blinder.live)
   - Copy the site key

2. **Configure Firebase AppCheck:**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Navigate to your project
   - Go to Settings > App Check
   - Enable reCAPTCHA v3 as a provider
   - Enter your reCAPTCHA site key
   - Save the changes

3. **Update your code:**
   - Open `src/integrations/firebase/client.ts`
   - Uncomment the AppCheck configuration section
   - Replace `'YOUR_RECAPTCHA_SITE_KEY'` with your new reCAPTCHA site key
   - Test thoroughly in a staging environment before deploying to production

## Troubleshooting Authentication Issues

If authentication issues persist:

1. **Check Firebase Authentication console:**
   - Ensure sign-in methods are enabled
   - Verify there are no IP restrictions or unusual security rules

2. **Verify Firestore Security Rules:**
   - Ensure your security rules allow authenticated users to read and write to their data

3. **Test with Firebase Local Emulator:**
   - Use Firebase emulators to test authentication locally
   - Run: `firebase emulators:start`

4. **Check for Browser Console Errors:**
   - Open the browser developer tools (F12)
   - Look for specific error messages in the Console tab
   - Network tab can show failed requests with specific error codes

## Data Loading Issues in PulseHub

If the dashboard still shows loading or doesn't display data:

1. **Check User Document Structure:**
   - Verify that the user document exists in Firestore
   - Ensure it follows the expected structure with stats, weeklyTarget, etc.

2. **Initialize Default Data:**
   - Consider implementing a function that creates default user data when a new user signs up
   - Example function:

```javascript
const createDefaultUserData = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  
  if (!docSnap.exists()) {
    await setDoc(userDocRef, {
      stats: {
        workoutCompleted: 0,
        daysStreak: 0,
        focusScore: 65,
        totalPoints: 0,
        weeklyGoalProgress: 0,
        nextSessionTime: "09:30",
        heartRate: { current: 72, resting: 62, max: 165 },
        hydration: 65,
        sleep: { average: 7.4, quality: 82 }
      },
      weeklyTarget: {
        current: 0,
        target: 5,
        percentage: 0
      },
      weeklyProgress: [
        { name: 'Strength', completed: 0, total: 4 },
        { name: 'Cardio', completed: 0, total: 3 },
        { name: 'Flexibility', completed: 0, total: 2 },
        { name: 'Recovery', completed: 0, total: 3 }
      ],
      challengeProgress: 0,
      createdAt: serverTimestamp()
    });
    return true;
  }
  return false;
};
```

## Contact Support

If you continue to experience issues with Firebase authentication or AppCheck:

1. Check the [Firebase Status Dashboard](https://status.firebase.google.com/)
2. Review the [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
3. For AppCheck issues, see [Firebase AppCheck Documentation](https://firebase.google.com/docs/app-check)
