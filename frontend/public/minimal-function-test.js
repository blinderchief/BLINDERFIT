// minimal-function-test.js
// A minimalist test script to isolate Firebase Functions issues

async function testFirebaseFunctions() {
  try {
    console.log("=== MINIMAL FIREBASE FUNCTIONS TEST ===");
    console.log("Starting test at:", new Date().toISOString());
    
    // Check if Firebase SDK is available
    if (typeof firebase === 'undefined') {
      throw new Error("Firebase SDK not loaded in the page");
    }
    
    // Basic Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyDQlnFdox_u6NAz6PeeN-82Dk9lKI_bBbA",
      authDomain: "blinderfit.firebaseapp.com",
      projectId: "blinderfit",
      storageBucket: "blinderfit.firebasestorage.app",
      messagingSenderId: "621758849500",
      appId: "1:621758849500:web:6c74cb251f68c73c9a6f19",
    };
    
    // Initialize a test instance
    console.log("Step 1: Initializing Firebase test instance");
    const app = firebase.initializeApp(firebaseConfig, "minimal-test");
    
    // Configure App Check
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      console.log("Development environment - enabling AppCheck debug token");
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    // Initialize App Check - fully optional, test both with and without it
    if (firebase.appCheck) {
      try {
        console.log("Initializing AppCheck with debug mode");
        firebase.appCheck().activate(
          new firebase.appCheck.ReCaptchaV3Provider('6LcLKjkrAAAAACnqOSrr2K3LlfBABt-28o1kQohS'),
          true
        );
      } catch (e) {
        console.warn("AppCheck initialization failed (continuing anyway):", e);
      }
    }
    
    // Get Functions instance - this is critical
    console.log("Step 2: Getting Functions instance");
    const functions = firebase.functions(app);
    
    // Connect to emulator if on localhost
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      try {
        console.log("Connecting to Functions emulator on localhost:5001");
        functions.useEmulator("localhost", 5001);
      } catch (e) {
        console.error("Failed to connect to emulator:", e);
      }
    }
    
    // Try each function in sequence
    console.log("Step 3: Testing testPing function (if available)");
    try {
      const testPing = firebase.functions(app).httpsCallable('testPing');
      console.log("Calling testPing...");
      const pingResult = await testPing({test: true, timestamp: Date.now()});
      console.log("testPing result:", pingResult);
    } catch (err) {
      console.error("testPing function failed:", err);
    }
    
    console.log("Step 4: Testing helloWorld function");
    try {
      const helloWorld = firebase.functions(app).httpsCallable('helloWorld');
      console.log("Calling helloWorld...");
      const helloResult = await helloWorld({});
      console.log("helloWorld result:", helloResult);
    } catch (err) {
      console.error("helloWorld function failed:", err);
    }
    
    console.log("Step 5: Testing askAI function");
    try {
      const askAI = firebase.functions(app).httpsCallable('askAI');
      console.log("Calling askAI...");
      const aiResult = await askAI({
        question: "What's a simple exercise for beginners?"
      });
      console.log("askAI result:", aiResult);
    } catch (err) {
      console.error("askAI function failed:", err);
    }
    
    console.log("=== TEST COMPLETE ===");
    return "Test completed - check console for results";
    
  } catch (error) {
    console.error("Fatal test error:", error);
    return `Test failed: ${error.message}`;
  }
}

// Execute if this script is loaded in the browser
if (typeof window !== 'undefined') {
  console.log("Minimal Firebase Functions test script loaded");
  console.log("Run testFirebaseFunctions() to execute the test");
}

// Export the test function
if (typeof module !== 'undefined') {
  module.exports = { testFirebaseFunctions };
}
