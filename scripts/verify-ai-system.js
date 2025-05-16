/**
 * AI System Verification Script
 * 
 * This script tests the AI functionality of the BlinderFit system.
 * It verifies both the Firebase Functions and HTTP API endpoints.
 */

// Import required modules
const axios = require('axios');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFunctions, httpsCallable } = require('firebase/functions');
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.GOOGLE_API_KEY || "AIzaSyAmQuXdNIb1SZvt-zhPf9VMbC6FtMCk0JE",
  authDomain: "blinderfit.firebaseapp.com",
  projectId: "blinderfit",
  storageBucket: "blinderfit.appspot.com",
  messagingSenderId: "621758849500",
  appId: "1:621758849500:web:ddd64531e9d4968d9a6f19",
  measurementId: "G-QT22TXQ9VD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// API endpoints
const API_URL = process.env.API_URL || "https://us-central1-blinderfit.cloudfunctions.net/app";

// Test user credentials - replace with test user credentials
const TEST_EMAIL = process.env.TEST_EMAIL || "test@example.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "testPassword123";

// Test functions
async function runTests() {
  console.log("📋 BLINDERFIT AI VERIFICATION");
  console.log("=============================");
  console.log("\nStarting tests...");
  
  try {
    // Get auth token
    console.log("\n🔑 Testing Authentication...");
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const token = await userCredential.user.getIdToken();
    console.log("✅ Authentication successful");
    
    // Test health endpoint
    console.log("\n💓 Testing Health Endpoint...");
    const healthResponse = await axios.get(`${API_URL}/health`);
    if (healthResponse.data.status === 'ok') {
      console.log("✅ Health endpoint working");
    } else {
      console.log("❌ Health endpoint returned unexpected response:", healthResponse.data);
    }
    
    // Test askAI function directly
    console.log("\n🧠 Testing askAI Firebase Function...");
    const askAIFunction = httpsCallable(functions, 'askAI');
    const functionResponse = await askAIFunction({
      question: "What are the benefits of regular exercise?"
    });
    
    if (functionResponse.data && functionResponse.data.answer) {
      console.log("✅ askAI function working");
      console.log("Sample response:", functionResponse.data.answer.substring(0, 100) + "...");
    } else {
      console.log("❌ askAI function returned unexpected response:", functionResponse.data);
    }
    
    // Test API endpoints with auth token
    console.log("\n🌐 Testing AI API endpoints...");
    
    // Test askAI API endpoint
    const askResponse = await axios.post(`${API_URL}/ask`, 
      { question: "What are three simple exercises for beginners?" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (askResponse.data && askResponse.data.answer) {
      console.log("✅ askAI API endpoint working");
      console.log("Sample response:", askResponse.data.answer.substring(0, 100) + "...");
    } else {
      console.log("❌ askAI API endpoint returned unexpected response:", askResponse.data);
    }
    
    // Test plan generation
    console.log("\n📋 Testing Plan Generation API...");
    const planResponse = await axios.post(`${API_URL}/generate-plan`, 
      { 
        userProfile: {
          preferences: {
            focusArea: "weight loss",
            duration: "4 weeks",
            daysPerWeek: 3
          },
          userId: userCredential.user.uid
        }
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (planResponse.data) {
      console.log("✅ Plan generation API working");
    } else {
      console.log("❌ Plan generation API returned unexpected response");
    }
    
    console.log("\n✨ All tests completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
}

// Run the tests
runTests();
