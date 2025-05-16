# Firebase Functions Troubleshooting Guide

## Common Errors and Solutions

### 1. "functions/internal" Error

This is a generic internal error that can have multiple causes:

**Potential Solutions:**
- **Check Firebase Deployment**: Make sure functions are properly deployed
- **API Keys**: Verify API keys are valid and properly configured
- **AppCheck**: Ensure AppCheck is properly configured for both dev and prod
- **Function Timeout**: Functions might be timing out (180s limit)

### 2. "FirebaseError: AppCheck error" (403 Forbidden)

This occurs when AppCheck is preventing the function call.

**Solutions:**
- **Enable Debug Tokens**: Add this to your code:
  ```javascript
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  ```
- **Check reCAPTCHA Key**: Ensure the reCAPTCHA v3 site key is valid
- **Initialize In-Dev**: Make sure AppCheck is initialized even in development:
  ```javascript
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LcLKjkrAAAAACnqOSrr2K3LlfBABt-28o1kQohS'),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.error('Failed to initialize AppCheck:', error);
  }
  ```

### 3. Function Not Found Errors

When trying to call a function that doesn't exist or isn't deployed.

**Solutions:**
- Run the function verification script: `node functions/verify-functions.js`
- Check Firebase Console to see deployed functions
- Re-deploy with: `firebase deploy --only functions`

### 4. "Object[object]" Responses

This happens when stringifying an object incorrectly.

**Solutions:**
- Improve response handling with proper parsing
- Add detailed logging:
  ```javascript
  console.log("Raw response:", JSON.stringify(response, null, 2));
  ```
- Use a try-catch when parsing responses

## Debugging Steps

1. **Check Functions Logs**:
   - View in Firebase Console: https://console.firebase.google.com/project/blinderfit/functions/logs
   - Use Firebase CLI: `firebase functions:log`

2. **Test Locally with Emulator**:
   - Run: `firebase emulators:start --only functions`
   - Connect to emulator in code:
     ```javascript
     import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
     const functions = getFunctions();
     connectFunctionsEmulator(functions, "localhost", 5001);
     ```

3. **Verify Environment Variables**:
   - Ensure `.env` file exists with:
     ```
     GOOGLE_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE
     GENKIT_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE
     FIREBASE_PROJECT_ID=blinderfit
     ```

## Quick Fix Scripts

- **Complete Fix Tool**: `fix-functions-complete.bat`
- **Function Verification**: `node functions/verify-functions.js`
- **Add Test Functions**: `node functions/add-test-functions.js`
- **Start Emulator**: `firebase emulators:start --only functions`

## For Persistent Issues

If problems persist after trying the solutions above:

1. Use the emulator approach for local development
2. Consider updating Firebase Functions to the latest version
3. Check for issues with the Google Genkit API
4. Simplify the function code to identify specific problematic components
