// Direct Firebase Functions Test Tool
// This script runs directly in the browser console
// It bypasses React and tests the Firebase Functions directly

// Copy this entire function to your browser console
async function testFirebaseFunctions() {
  console.group('Firebase Functions Test Tool');
  console.log('Starting Firebase Functions test...');
  
  try {
    // Get Firebase instance from the app
    const { app, functions } = await import('/src/integrations/firebase/client.js');
    const { httpsCallable } = await import('firebase/functions');

    // Optional: Use the emulator if running locally
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const { connectFunctionsEmulator } = await import('firebase/functions');
      console.log('Connecting to emulator...');
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
    
    // Force debug token for local testing
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      console.log('Debug token set for AppCheck');
    }
    
    // Test functions - modify this array to test different functions
    const testsToRun = [
      { 
        name: 'helloWorld', 
        funcName: 'helloWorld', 
        params: {} 
      },
      { 
        name: 'Basic AI query',
        funcName: 'askAI',
        params: { question: 'What are some good stretching exercises?' }
      }
    ];
    
    // Run each test
    for (const test of testsToRun) {
      console.group(`Test: ${test.name}`);
      console.log(`Calling function: ${test.funcName}`);
      console.log('Parameters:', test.params);
      
      try {
        const func = httpsCallable(functions, test.funcName);
        console.time('Function execution time');
        const result = await func(test.params);
        console.timeEnd('Function execution time');
        
        console.log('Result:', result);
        console.log('SUCCESS ✅');
      } catch (error) {
        console.error('Error calling function:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.log('FAILED ❌');
      }
      
      console.groupEnd();
    }
    
    console.log('All tests completed.');

  } catch (error) {
    console.error('Fatal error in test tool:', error);
  }
  
  console.groupEnd();
  return 'Tests completed';
}

// Run the function automatically when this script is loaded
testFirebaseFunctions().then(msg => console.log(msg));
