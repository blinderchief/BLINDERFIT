const admin = require('firebase-admin');
const serviceAccount = require('../path-to-your-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Example data
const exampleUserId = 'example-user-id';

// Set up users collection
async function setupDatabase() {
  try {
    // Create user document
    await db.collection('users').doc(exampleUserId).set({
      email: "user@example.com",
      age: 30,
      gender: "male",
      weight: 70.5,
      height: 175.0,
      allergies: ["nuts", "dairy"],
      deficiencies: ["vitamin D"],
      cuisine: ["Indian", "fusion"],
      activityLevel: "sedentary",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create user plans
    await db.collection('users').doc(exampleUserId).collection('plans').doc('plan1').set({
      weekNumber: 1,
      recipes: {
        day1: {
          breakfast: "masala oats",
          lunch: "quinoa curry"
        }
      },
      workouts: { day1: "20-min yoga" },
      sleep: { day1: "10 PM" },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create more collections as needed...
    // Progress
    await db.collection('users').doc(exampleUserId).collection('progress').doc('progress1').set({
      date: "2025-05-14",
      tasks: {
        task1: { name: "Cook dal tadka", done: true }
      },
      feedback: {
        question: "Ate junk food?",
        answer: "No"
      },
      metrics: {
        steps: 5000,
        calories: 1800
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

setupDatabase();