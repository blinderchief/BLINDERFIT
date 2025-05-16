// verify-functions.js
// This script verifies that the Firebase Functions are properly configured

const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable, connectFunctionsEmulator } = require('firebase/functions');

// Print diagnostic information
console.log('Node version:', process.version);
console.log('Firebase Functions verification starting...\n');

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

async function verifyFunctions() {
  try {
    console.log('Step 1: Initializing Firebase');
    const app = initializeApp(firebaseConfig, 'verification');
    
    console.log('Step 2: Getting Functions instance');
    const functions = getFunctions(app, 'us-central1');
    
    // Check if we should use the emulator
    const useEmulator = process.argv.includes('--emulator');
    if (useEmulator) {
      console.log('Using Functions emulator on localhost:5001');
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }

    console.log('Step 3: Testing if functions exist and respond');
    
    // List of functions to test
    const functionList = [
      { name: 'helloWorld', payload: {} },
      { name: 'askAI', payload: { question: 'What are the benefits of regular exercise?' } }
    ];
    
    for (const funcInfo of functionList) {
      try {
        console.log(`Testing function: ${funcInfo.name}...`);
        const func = httpsCallable(functions, funcInfo.name);
        const result = await func(funcInfo.payload);
        console.log(`✅ Function ${funcInfo.name} worked! Response:`, result.data);
      } catch (error) {
        console.error(`❌ Function ${funcInfo.name} failed:`, error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
      }
    }
    
    console.log('\nVerification completed.');
    
  } catch (error) {
    console.error('Fatal error during verification:', error);
  }
}

// Run the verification
verifyFunctions().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
