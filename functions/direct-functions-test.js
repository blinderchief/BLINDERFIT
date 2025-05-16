// direct-functions-test.js
// A direct test of Firebase Functions using Node.js

const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable, connectFunctionsEmulator } = require('firebase/functions');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQlnFdox_u6NAz6PeeN-82Dk9lKI_bBbA",
  authDomain: "blinderfit.firebaseapp.com",
  projectId: "blinderfit",
  storageBucket: "blinderfit.firebasestorage.app",
  messagingSenderId: "621758849500",
  appId: "1:621758849500:web:6c74cb251f68c73c9a6f19"
};

// ANSI color codes for prettier console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

// Print test header
console.log(`${colors.bright}${colors.blue}=================================${colors.reset}`);
console.log(`${colors.bright}${colors.blue}  FIREBASE FUNCTIONS DIRECT TEST ${colors.reset}`);
console.log(`${colors.bright}${colors.blue}=================================${colors.reset}`);
console.log(`Started at: ${new Date().toISOString()}`);
console.log(`Node version: ${process.version}`);
console.log();

async function runTest() {
  try {
    // Check if we should use the emulator
    const useEmulator = process.argv.includes('--emulator');
    
    console.log(`${colors.bright}Step 1: Initializing Firebase${colors.reset}`);
    const app = initializeApp(firebaseConfig);
    
    console.log(`${colors.bright}Step 2: Getting Functions instance${colors.reset}`);
    const functions = getFunctions(app, 'us-central1');
    
    if (useEmulator) {
      console.log(`${colors.yellow}Using Functions emulator on localhost:5001${colors.reset}`);
      connectFunctionsEmulator(functions, 'localhost', 5001);
    } else {
      console.log(`${colors.yellow}Using production Firebase Functions${colors.reset}`);
    }
    
    // List of functions to test
    const functionTests = [
      { 
        name: 'testPing',
        payload: { test: true, timestamp: Date.now() },
        desc: 'Basic ping test function'
      },
      { 
        name: 'helloWorld',
        payload: {},
        desc: 'Simple hello world function'
      },
      { 
        name: 'askAI',
        payload: { question: 'What are the benefits of regular exercise?' },
        desc: 'AI-powered response function'
      }
    ];
    
    // Test each function in sequence
    console.log(`\n${colors.bright}Step 3: Testing functions${colors.reset}`);
    
    for (const testCase of functionTests) {
      try {
        console.log(`\n${colors.cyan}Testing: ${testCase.name}${colors.reset} - ${testCase.desc}`);
        console.log(`${colors.dim}Payload: ${JSON.stringify(testCase.payload)}${colors.reset}`);
        
        const func = httpsCallable(functions, testCase.name);
        console.log(`Calling ${testCase.name}...`);
        
        // Set timeout for the function call (15 seconds)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Function call timed out after 15 seconds')), 15000)
        );
        
        // Call the function with timeout
        const result = await Promise.race([
          func(testCase.payload),
          timeoutPromise
        ]);
        
        console.log(`${colors.green}✓ Success: ${testCase.name}${colors.reset}`);
        console.log('Response:', result.data);
      } catch (error) {
        console.log(`${colors.red}✗ Error with ${testCase.name}:${colors.reset}`, error.message);
        console.log('Error details:', error.code, error.details || 'No additional details');
      }
    }
    
    console.log(`\n${colors.bright}${colors.green}Test completed${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}Fatal test error:${colors.reset}`, error);
  }
}

// Run the test
runTest().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
