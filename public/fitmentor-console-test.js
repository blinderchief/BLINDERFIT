// Add this to your FitMentor.tsx file or import it
// You can run this function from your browser's console to test the FitMentor API directly

async function testFitMentorAPI() {
  try {
    console.log("Testing FitMentor API connectivity...");
    
    // Import the Firebase functions
    const { functions } = await import('./integrations/firebase/client');
    const { httpsCallable } = await import('firebase/functions');
    
    console.log("Step 1: Getting Firebase functions instance");
    console.log("Functions instance:", functions);
    
    // Enable debug token for local testing if needed
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      console.log("Setting debug token for local testing");
      // @ts-ignore
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    // Try to call the hello world function
    console.log("Step 2: Calling hello world function");
    const helloWorld = httpsCallable(functions, 'helloWorld');
    const helloResult = await helloWorld({});
    console.log("Hello world result:", helloResult);
    
    // Try a simple AI question
    console.log("Step 3: Testing AI response");
    const askAI = httpsCallable(functions, 'askAI');
    const aiResult = await askAI({ 
      question: "What's a simple exercise for beginners?" 
    });
    console.log("AI test result:", aiResult);
    
    console.log("Tests completed successfully!");
    return { success: true, results: { hello: helloResult, ai: aiResult } };
    
  } catch (error) {
    console.error("Error in test:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    return false;
  }
}

// Make the function available in the window object
window.testFitMentorAPI = testFitMentorAPI;

// Usage: Run in browser console
// testFitMentorAPI().then(console.log)

// Make the function available in the window object
window.testFitMentorAPI = testFitMentorAPI;

// Usage: Run in browser console
// testFitMentorAPI().then(console.log)
