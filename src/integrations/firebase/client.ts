import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQlnFdox_u6NAz6PeeN-82Dk9lKI_bBbA",
  authDomain: "blinderfit.firebaseapp.com",
  projectId: "blinderfit",
  storageBucket: "blinderfit.appspot.com",
  messagingSenderId: "621758849500",
  appId: "1:621758849500:web:ddd64531e9d4968d9a6f19",
  measurementId: "G-QT22TXQ9VD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    // Simple test to check if Firebase is initialized
    if (app && auth && db && storage) {
      return {
        success: true,
        message: 'Firebase connection successful'
      };
    } else {
      return {
        success: false,
        message: 'Firebase initialization failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Firebase connection error: ${error}`
    };
  }
};




