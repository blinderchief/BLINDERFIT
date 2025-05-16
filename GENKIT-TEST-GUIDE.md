# Testing the Genkit Integration Locally

This guide provides steps to test the Genkit AI integration locally before deploying to Firebase.

## Prerequisites

1. Node.js v20 (as specified in `package.json`)
2. A valid Google Generative AI API key
3. npm packages installed

## Setup Instructions

### 1. Set up your environment

1. Create a `.env` file in the `functions` directory:   ```
   GOOGLE_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE
   GENKIT_API_KEY=AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE
   FIREBASE_PROJECT_ID=blinderfit
   ```

   The API key is already set up for you.

### 2. Install dependencies

Run the following command in the `functions` directory:

```bash
npm install
```

### 3. Run the test script

To test the Genkit integration, run:

```bash
node test-genkit.js
```

## Troubleshooting

### GCP Project ID warnings

When running the test locally, you may see warnings like:
```
Unable to send logs to Google Cloud: Error: Unable to detect a Project Id in the current environment.
```

This is normal when testing locally without full GCP credentials and doesn't affect the functionality of the test.

### API key issues

If you see errors related to authentication or invalid API keys:

1. Verify your API key is correct
2. Ensure your API key has access to the Gemini model
3. Check that the API key is activated in the Google Cloud Console

### Import errors

If you see "is not a function" or "is not a constructor" errors:

1. Use the correct import pattern for Genkit 1.9.0:
   ```javascript
   // Import Genkit as a default export
   const genkit = require('genkit');
   
   // Import the Google AI plugin - handle different export patterns
   const googleai = require('@genkit-ai/googleai');
   const googleAI = googleai.googleAI || googleai.GoogleGenerativeAI;
   ```

2. Use the right function call pattern:
   ```javascript
   const client = genkit({
     plugins: [googleAI({ apiKey })],
     model: 'gemini-1.5-pro'
   });
   ```

3. If still having issues, try the compatibility wrapper:
   ```javascript
   // Create a compatibility wrapper for the API
   const getGoogleAI = () => {
     const googleai = require('@genkit-ai/googleai');
     return googleai.googleAI || googleai.GoogleGenerativeAI;
   };
   
   const googleAI = getGoogleAI();
   ```

## Next Steps

Once the Genkit test runs successfully, you can proceed to test the full Firebase functions:

```bash
firebase emulators:start --only functions
```

And then deploy:

```bash
firebase deploy --only functions
```
