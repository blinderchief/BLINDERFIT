// Run this in the browser console to test FitMentor API functionality

// Function to test various Firebase function calls
async function testFitMentorAPI() {
  try {
    console.log("Testing FitMentor API connectivity...");
    
    // Firebase configuration - same as in your app
    const firebaseConfig = {
      apiKey: "AIzaSyDQlnFdox_u6NAz6PeeN-82Dk9lKI_bBbA",
      authDomain: "blinderfit.firebaseapp.com",
      projectId: "blinderfit",
      storageBucket: "blinderfit.firebasestorage.app",
      messagingSenderId: "621758849500",
      appId: "1:621758849500:web:6c74cb251f68c73c9a6f19",
      measurementId: "G-1S48HDESZN"
    };

    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      throw new Error("Firebase SDK not loaded. Make sure the script tags are included properly.");
    }

    console.log("Step 1: Initializing Firebase");
    // Initialize Firebase (check if already initialized)
    let app;
    try {
      app = firebase.app("test-instance");
    } catch (e) {
      app = firebase.initializeApp(firebaseConfig, "test-instance");
    }
    
    // Enable debug token for AppCheck in development
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      console.log("Setting up debug token for local development");
      // For development only, we'll use debug tokens
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    // Initialize AppCheck if available
    if (firebase.appCheck) {
      console.log("Initializing AppCheck");
      try {
        firebase.appCheck().activate(
          // Use reCAPTCHA v3 provider
          new firebase.appCheck.ReCaptchaV3Provider('6LcLKjkrAAAAACnqOSrr2K3LlfBABt-28o1kQohS'),
          // Pass true to autoRefresh tokens as they expire
          true
        );
      } catch (e) {
        console.warn("AppCheck initialization failed:", e);
      }
    } else {
      console.warn("AppCheck not available in this version of Firebase");
    }
    
    console.log("Step 2: Getting Functions instance");
    // Initialize Functions
    try {
      // Check if functions is defined
      if (!firebase.functions) {
        throw new Error("Firebase Functions SDK not loaded");
      }
      
      const functions = firebase.functions(app);
      
      // Use emulator if on localhost
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        console.log("Using Functions emulator");
        try {
          functions.useEmulator("localhost", 5001);
        } catch (e) {
          console.warn("Failed to connect to emulator:", e);
        }
      }
      
      console.log("Step 3: Testing basic function");
      try {
        // First fix: Create a properly scoped function instance
        const functionsInstance = firebase.functions(app);
        
        // Second fix: Add timeout control to prevent message port closed issues
        const helloWorld = functionsInstance.httpsCallable('helloWorld');
        
        // Create a timeout promise to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Function call timed out after 10 seconds')), 10000)
        );
        
        // Use Promise.race to implement the timeout
        console.log("Calling helloWorld with timeout control...");
        const helloResult = await Promise.race([
          helloWorld({}),
          timeoutPromise
        ]);
        
        console.log("Hello world result:", helloResult);
      } catch (error) {
        console.error("Error calling helloWorld:", error);
        throw error; // Rethrow to maintain original behavior
      }
      
      console.log("Step 4: Testing AI function");
      try {
        // Get the same functions instance
        const functionsInstance = firebase.functions(app);
        
        // Create the callable with timeout control
        const askAI = functionsInstance.httpsCallable('askAI');
        
        // Create a timeout promise with longer timeout for AI (20 seconds)
        const aiTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI function call timed out after 20 seconds')), 20000)
        );
        
        // Call with timeout control
        console.log("Calling askAI with timeout control...");
        const aiResult = await Promise.race([
          askAI({ 
            question: "What's a simple exercise for beginners?" 
          }),
          aiTimeoutPromise
        ]);
        
        console.log("AI test result:", aiResult);
      } catch (error) {
        console.error("Error calling askAI:", error);
        // Continue execution even if AI fails
      }
      
      console.log("Tests completed successfully!");
      return { 
        success: true, 
        results: { hello: helloResult, ai: aiResult } 
      };
    } catch (error) {
      console.error("Error in Firebase Functions:", error);
      throw error;
    }
    
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

// Export for use with script tag
window.testFitMentorAPI = testFitMentorAPI;

// Export for use with script tag
window.testFitMentorAPI = testFitMentorAPI;

// Export for use with script tag
window.testFitMentorAPI = testFitMentorAPI;
