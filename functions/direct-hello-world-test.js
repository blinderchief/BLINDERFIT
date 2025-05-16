// direct-hello-world-test.js
// A simple script to directly test the helloWorld function with detailed diagnostics
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
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

async function testHelloWorld() {
  console.log(`${colors.bright}${colors.blue}=== HELLO WORLD FUNCTION TEST ===${colors.reset}`);
  console.log(`Started at: ${new Date().toISOString()}`);
  
  try {
    // Initialize Firebase
    console.log(`${colors.bright}1. Initializing Firebase${colors.reset}`);
    const app = initializeApp(firebaseConfig, 'hello-world-test');
    
    // Get Functions instance
    console.log(`${colors.bright}2. Getting Functions instance${colors.reset}`);
    const functions = getFunctions(app, 'us-central1');
    
    // Check if we should use the emulator
    const useEmulator = process.argv.includes('--emulator');
    if (useEmulator) {
      console.log(`${colors.yellow}Using emulator on localhost:5001${colors.reset}`);
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
    
    // Test the function with different approaches
    console.log(`${colors.bright}3. Testing helloWorld with httpsCallable${colors.reset}`);
    
    // First approach: standard httpsCallable
    try {
      console.log('Standard approach: httpsCallable with empty data');
      const helloWorld = httpsCallable(functions, 'helloWorld');
      const result = await helloWorld({});
      console.log(`${colors.green}Success!${colors.reset} Response:`, result.data);
    } catch (error) {
      console.log(`${colors.red}Error:${colors.reset}`, error);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
    }
    
    // Second approach: with a timeout promise
    console.log(`\n${colors.bright}4. Testing with timeout control${colors.reset}`);
    try {
      console.log('Adding a 10-second timeout wrapper');
      const helloWorldWithTimeout = httpsCallable(functions, 'helloWorld');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Function call timed out after 10 seconds')), 10000)
      );
      
      const result = await Promise.race([
        helloWorldWithTimeout({}),
        timeoutPromise
      ]);
      
      console.log(`${colors.green}Success with timeout approach!${colors.reset} Response:`, result.data);
    } catch (error) {
      console.log(`${colors.red}Error with timeout approach:${colors.reset}`, error.message);
    }
    
    // Third approach: testing with testPing
    console.log(`\n${colors.bright}5. Testing testPing function${colors.reset}`);
    try {
      console.log('Trying the testPing function');
      const testPing = httpsCallable(functions, 'testPing');
      const pingResult = await testPing({ testId: 'direct-test', timestamp: Date.now() });
      console.log(`${colors.green}Success with testPing!${colors.reset} Response:`, pingResult.data);
    } catch (error) {
      console.log(`${colors.red}Error with testPing:${colors.reset}`, error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
    }
    
    console.log(`\n${colors.bright}${colors.green}Test complete!${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  }
}

// Execute the test
testHelloWorld().catch(err => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  process.exit(1);
});
