import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQlnFdox_u6NAz6PeeN-82Dk9lKI_bBbA",
  authDomain: "blinderfit.firebaseapp.com",
  projectId: "blinderfit",
  storageBucket: "blinderfit.firebasestorage.app",
  messagingSenderId: "621758849500",
  appId: "1:621758849500:web:6c74cb251f68c73c9a6f19",
  measurementId: "G-1S48HDESZN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Initialize App Check (for development and testing)
if (typeof window !== 'undefined') {
  // For development only, we'll use debug tokens
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Using AppCheck debug token for local development');
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
}

// Initialize AppCheck differently based on environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
let appCheck;

if (isProduction) {
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LcLKjkrAAAAACnqOSrr2K3LlfBABt-28o1kQohS'),
      isTokenAutoRefreshEnabled: true
    });
    console.log('AppCheck initialized in production mode');
  } catch (error) {
    console.error('Failed to initialize AppCheck:', error);
  }
} else {
  try {
    // In development, we'll still initialize AppCheck but with debug tokens enabled
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LcLKjkrAAAAACnqOSrr2K3LlfBABt-28o1kQohS'),
      isTokenAutoRefreshEnabled: true
    });
    console.log('AppCheck initialized in development mode with debug tokens');
  } catch (error) {
    console.error('Failed to initialize AppCheck in development:', error);
  }
}

export { appCheck };





