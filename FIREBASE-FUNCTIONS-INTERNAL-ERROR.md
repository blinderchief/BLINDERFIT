# Firebase Functions Troubleshooting Guide

This guide specifically addresses the "functions/internal" error and "message port closed before a response was received" issues in the BlinderFit application.

## Common Error Messages

### Error 1: functions/internal

```
FirebaseError: Firebase: Error (functions/internal).
```

This is a generic server-side error indicating something went wrong with the Firebase Function execution.

### Error 2: Message Port Closed

```
Error: A message port closed before a response was received.
```

This typically occurs when the connection to the function is interrupted before it completes.

## Root Causes and Solutions

### 1. AppCheck Configuration Issues

**Problem**: Misconfigured AppCheck can block function calls.

**Solution**:
- Make sure AppCheck is properly configured for both development and production
- Use debug tokens in development
- Verify reCAPTCHA site keys are correct

```javascript
// Local development config
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

// Initialize AppCheck with proper error handling
try {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('your-site-key'),
    isTokenAutoRefreshEnabled: true
  });
} catch (error) {
  console.error('AppCheck initialization failed:', error);
  // Continue without AppCheck in development
}
```

### 2. Functions Timeout

**Problem**: Functions that run too long will timeout (60s default).

**Solution**:
- Keep functions small and focused
- Use background functions for long-running operations
- Increase timeout for specific functions:

```javascript
// In your functions/index.js
exports.longRunningFunction = onCall({
  timeoutSeconds: 300,  // 5 minutes
  memory: '1GiB',       // Optional: increase memory
}, async (data) => {
  // Function implementation
});
```

### 3. CORS Issues

**Problem**: Cross-Origin Resource Sharing blocks function calls.

**Solution**:
- Ensure CORS is properly configured
- Use the cors middleware in HTTP functions
- Add your domain to the allowed origins

```javascript
// In your functions/index.js
const cors = require('cors')({origin: true});

exports.myFunction = onRequest((req, res) => {
  return cors(req, res, () => {
    // Function implementation
  });
});
```

### 4. Node.js Version Mismatch

**Problem**: Using an unsupported Node.js version.

**Solution**:
- Check your Node.js version: `node --version`
- Ensure it matches Firebase requirements (currently Node.js 16 or 18)
- Set your Node.js version in your `package.json`:

```json
"engines": {
  "node": "16"
}
```

### 5. Firebase CLI & Emulator Issues

**Problem**: Outdated or misconfigured Firebase tools.

**Solution**:
- Update Firebase CLI: `npm install -g firebase-tools`
- Re-login: `firebase login`
- Clear cache: `firebase functions:delete-debug-tokens`
- Restart emulators: `firebase emulators:start --only functions`

### 6. Connection to Emulator

**Problem**: Code not connecting to the emulator.

**Solution**:
- Use the emulator connection utility:

```javascript
// Import this in your app's entry point
import './utils/emulator-connection';
```

- The emulator should also have a visible indicator on the UI

### 7. Authentication Issues

**Problem**: User doesn't have permission to call function.

**Solution**:
- Check if the function requires authentication
- Ensure user is logged in for authenticated functions
- Verify security rules in Firebase console

## Specific Tests

### Test 1: Simple Function Test

Run the minimal test:
```
Open function-test.html in your browser
Click "Run Basic Test"
```

### Test 2: Emulator Test

Start the emulator:
```
firebase emulators:start --only functions
```

Then run the test:
```
Open function-test.html in your browser
Click "Run Emulator Test"
```

### Test 3: Direct Node.js Test

```
cd functions
node direct-functions-test.js
```

## Additional Diagnostic Steps

1. **Check Function Logs**:
   - View logs in Firebase Console > Functions > Logs
   - Or run: `firebase functions:log`

2. **Verify Function Deployment**:
   - Check if function exists: `firebase functions:list`
   - View config: `firebase functions:config:get`

3. **HTTPS Inspection**:
   - Use browser DevTools Network tab
   - Look for failed function calls
   - Check status codes and error responses

4. **Check for Rate Limiting**:
   - Firebase has quota limits
   - Check usage in Firebase Console

## Getting Additional Help

If these steps don't resolve your issue:

1. Open a detailed issue on [Firebase GitHub](https://github.com/firebase/firebase-tools/issues)
2. Post on [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-functions) with the `firebase-functions` tag
3. Contact Firebase Support through the [Google Cloud Console](https://console.cloud.google.com/support)
