/**
 * Centralized Firebase initialization for functions
 * This file helps prevent the "FirebaseAppError: The default Firebase app does not exist" error
 * It ensures Firebase is properly initialized before any services are used
 */
const admin = require('firebase-admin');

// Initialize Firebase if it hasn't been already
const initializeFirebase = () => {
  try {
    return admin.app();
  } catch (e) {
    return admin.initializeApp();
  }
};

// Initialize Firebase immediately when this module is imported
const app = initializeFirebase();

// Export initialized services
module.exports = {
  app,
  admin,
  db: admin.firestore(),
  auth: admin.auth(),
  storage: admin.storage(),
  messaging: admin.messaging()
};
