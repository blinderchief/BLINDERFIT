// Simple test for FitMentor API

// Import Firebase directly
const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');
const { initializeAppCheck, ReCaptchaV3Provider } = require('firebase/app-check');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQlnFdox_u6NAz6PeeN-82Dk9lKI_bBbA",
  authDomain: "blinderfit.firebaseapp.com",
  projectId: "blinderfit",
  storageBucket: "blinderfit.firebasestorage.app",
  messagingSenderId: "621758849500",
  appId: "1:621758849500:web:6c74cb251f68c73c9a6f19",
  measurementId: "G-1S48HDESZN"
};

// For development only
global.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

async function testFitMentorAPI() {
  try {
    console.log("Testing FitMentor API connectivity...");
    
    console.log("Step 1: Initializing Firebase");
    const app = initializeApp(firebaseConfig);
    
    // Skip AppCheck for direct testing
    
    console.log("Step 2: Getting Functions instance");
    const functions = getFunctions(app, 'us-central1');
    
    console.log("Step 3: Testing basic function");
    const helloWorld = httpsCallable(functions, 'helloWorld');
    const helloResult = await helloWorld({});
    console.log("Hello world result:", helloResult);
    
    console.log("Step 4: Testing AI function");
    const askAI = httpsCallable(functions, 'askAI');
    const aiResult = await askAI({ 
      question: "What's a simple exercise for beginners?" 
    });
    console.log("AI test result:", aiResult);
    
    console.log("Tests completed successfully!");
    return { 
      success: true, 
      results: { hello: helloResult, ai: aiResult } 
    };
    
  } catch (error) {
    console.error("Error in test:", error);
    return { 
      success: false, 
      error: { 
        message: error.message || "Unknown error",
        code: error.code || "unknown",
        details: error.details || error.stack || "No additional details"
      }
    };
  }
}

// Run the test
testFitMentorAPI()
  .then(result => {
    console.log("Test execution completed");
    if (result.success) {
      console.log("All tests PASSED");
    } else {
      console.log("Tests FAILED:", result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error("Unhandled error during test:", err);
    process.exit(1);
  });

// Run the test
testFitMentorAPI()
  .then(result => {
    console.log("Test execution completed");
    if (result.success) {
      console.log("All tests PASSED");
    } else {
      console.log("Tests FAILED:", result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error("Unhandled error during test:", err);
    process.exit(1);
  });
