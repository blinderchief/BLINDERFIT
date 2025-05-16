/**
 * BlinderFit Database Initialization Script
 * This script initializes the Firestore database structure for the BlinderFit application
 * Run with: node scripts/firestore/init-database.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../../service-account-key.json');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const batch = db.batch();
let operationCount = 0;
const MAX_BATCH_SIZE = 500; // Firestore batch limit

// Helper function to execute batch when it reaches limit
async function commitBatchIfNeeded() {
  if (operationCount >= MAX_BATCH_SIZE) {
    console.log(`Committing batch of ${operationCount} operations...`);
    await batch.commit();
    operationCount = 0;
    return db.batch(); // Create new batch
  }
  return batch;
}

// Create demo users
async function createUsers() {
  console.log('Creating demo users...');
  
  // Demo user 1
  const userId1 = 'demo-user-1';
  const userRef1 = db.collection('users').doc(userId1);
  batch.set(userRef1, {
    email: "user1@example.com",
    age: 30,
    gender: "female",
    weight: 65.5,
    height: 168.0,
    allergies: ["nuts", "shellfish"],
    deficiencies: ["vitamin D", "iron"],
    cuisine: ["Indian", "Mediterranean"],
    activityLevel: "moderate",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  operationCount++;
  
  // Demo user 2
  const userId2 = 'demo-user-2';
  const userRef2 = db.collection('users').doc(userId2);
  batch.set(userRef2, {
    email: "user2@example.com",
    age: 25,
    gender: "male",
    weight: 78.2,
    height: 182.0,
    allergies: ["dairy"],
    deficiencies: ["vitamin B12"],
    cuisine: ["Japanese", "Italian"],
    activityLevel: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  operationCount++;
  
  return [userId1, userId2];
}

// Create plans for users
async function createPlans(userIds) {
  console.log('Creating user plans...');
  
  for (const userId of userIds) {
    // Week 1 plan
    const planRef1 = db.collection('users').doc(userId).collection('plans').doc('plan-week-1');
    batch.set(planRef1, {
      weekNumber: 1,
      recipes: {
        day1: {
          breakfast: "overnight oats with berries",
          lunch: "quinoa salad with chickpeas",
          dinner: "grilled salmon with steamed vegetables"
        },
        day2: {
          breakfast: "veggie omelette with whole grain toast",
          lunch: "lentil soup with fresh herbs",
          dinner: "baked chicken with sweet potatoes"
        }
        // Add more days as needed
      },
      workouts: { 
        day1: "30-min cardio",
        day2: "20-min strength training"
      },
      sleep: { 
        day1: "10 PM - 6 AM",
        day2: "10:30 PM - 6:30 AM"
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    operationCount++;
    
    // Week 2 plan
    const planRef2 = db.collection('users').doc(userId).collection('plans').doc('plan-week-2');
    batch.set(planRef2, {
      weekNumber: 2,
      recipes: {
        day1: {
          breakfast: "smoothie bowl with granola",
          lunch: "mediterranean wrap with hummus",
          dinner: "stir-fry vegetables with tofu"
        },
        day2: {
          breakfast: "chia seed pudding with fruit",
          lunch: "buddha bowl with tahini dressing",
          dinner: "grilled vegetable pasta"
        }
      },
      workouts: { 
        day1: "45-min yoga",
        day2: "25-min HIIT workout"
      },
      sleep: { 
        day1: "9:30 PM - 5:30 AM",
        day2: "10 PM - 6 AM"
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    operationCount++;
  }
}

// Create progress entries
async function createProgress(userIds) {
  console.log('Creating progress entries...');
  
  for (const userId of userIds) {
    // Progress entry 1
    const progressRef1 = db.collection('users').doc(userId).collection('progress').doc('progress-day-1');
    batch.set(progressRef1, {
      date: "2025-05-14",
      tasks: {
        task1: { name: "Morning meditation", done: true },
        task2: { name: "Prepare lunch", done: true },
        task3: { name: "Evening walk", done: false }
      },
      feedback: {
        question: "Did you feel energized today?",
        answer: "Yes, especially in the morning"
      },
      metrics: {
        steps: 8500,
        calories: 1950,
        waterIntake: 2000 // ml
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    operationCount++;
    
    // Progress entry 2
    const progressRef2 = db.collection('users').doc(userId).collection('progress').doc('progress-day-2');
    batch.set(progressRef2, {
      date: "2025-05-15",
      tasks: {
        task1: { name: "Morning stretching", done: true },
        task2: { name: "Cook dinner at home", done: true },
        task3: { name: "Read before bed", done: true }
      },
      feedback: {
        question: "How was your sleep quality?",
        answer: "Better than usual, slept through the night"
      },
      metrics: {
        steps: 7200,
        calories: 1850,
        waterIntake: 2200 // ml
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    operationCount++;
  }
}

// Create mood logs
async function createMoodLogs(userIds) {
  console.log('Creating mood logs...');
  
  for (const userId of userIds) {
    // Mood log 1
    const moodRef1 = db.collection('users').doc(userId).collection('mood_logs').doc('mood-day-1');
    batch.set(moodRef1, {
      date: "2025-05-14",
      mood: "Energized",
      mindfulness: "10-min guided meditation",
      sustainability: {
        action: "Used reusable water bottle",
        carbon: 0.5 // kg saved
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    operationCount++;
    
    // Mood log 2
    const moodRef2 = db.collection('users').doc(userId).collection('mood_logs').doc('mood-day-2');
    batch.set(moodRef2, {
      date: "2025-05-15",
      mood: "Calm",
      mindfulness: "15-min yoga session",
      sustainability: {
        action: "Plant-based meal day",
        carbon: 1.2 // kg saved
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    operationCount++;
  }
}

// Create community posts
async function createCommunityPosts(userIds) {
  console.log('Creating community posts...');
  
  // Community post 1
  const postRef1 = db.collection('community').doc('post-1');
  batch.set(postRef1, {
    userId: userIds[0],
    type: "post",
    content: "Anyone has a good recipe for protein-rich breakfast?",
    likes: 5,
    comments: 3,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  operationCount++;
  
  // Community post 2
  const postRef2 = db.collection('community').doc('post-2');
  batch.set(postRef2, {
    userId: userIds[1],
    type: "achievement",
    content: "Completed my first week of consistent workouts!",
    likes: 12,
    comments: 7,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  operationCount++;
}

// Create beta users
async function createBetaUsers() {
  console.log('Creating beta users...');
  
  // Beta user 1
  const betaRef1 = db.collection('beta_users').doc('beta1@example.com');
  batch.set(betaRef1, {
    email: "beta1@example.com",
    inviteSent: true,
    status: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  operationCount++;
  
  // Beta user 2
  const betaRef2 = db.collection('beta_users').doc('beta2@example.com');
  batch.set(betaRef2, {
    email: "beta2@example.com",
    inviteSent: true,
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  operationCount++;
}

// Create interactions
async function createInteractions(userIds) {
  console.log('Creating user interactions...');
  
  // Interaction 1
  const interactionRef1 = db.collection('interactions').doc('interaction-1');
  batch.set(interactionRef1, {
    userId: userIds[0],
    type: "achievement_unlocked",
    details: {
      achievement: "First Week Completed",
      points: 50
    },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  operationCount++;
  
  // Interaction 2
  const interactionRef2 = db.collection('interactions').doc('interaction-2');
  batch.set(interactionRef2, {
    userId: userIds[1],
    type: "recipe_favorite",
    details: {
      recipeId: "quinoa-salad-122",
      recipeName: "Mediterranean Quinoa Salad"
    },
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  operationCount++;
}

// Create AI cache entries
async function createAICache() {
  console.log('Creating AI cache entries...');
  
  // AI Cache 1
  const cacheRef1 = db.collection('ai_cache').doc('cache-1');
  batch.set(cacheRef1, {
    queryHash: "md5-recipe-substitution-query-1",
    response: JSON.stringify({
      substitution: "spinach",
      reasoning: "Similar nutritional profile to kale but milder taste",
      alternatives: ["swiss chard", "collard greens"]
    }),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days
  });
  operationCount++;
  
  // AI Cache 2
  const cacheRef2 = db.collection('ai_cache').doc('cache-2');
  batch.set(cacheRef2, {
    queryHash: "md5-meal-plan-modification-query-1",
    response: JSON.stringify({
      modifiedPlan: {
        breakfast: "Oatmeal with almond milk",
        lunch: "Chickpea salad",
        dinner: "Tofu stir fry"
      },
      macros: {
        protein: "65g",
        carbs: "220g",
        fat: "55g"
      }
    }),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days
  });
  operationCount++;
}

// Main function to orchestrate the database initialization
async function initializeDatabase() {
  try {
    console.log('Starting BlinderFit database initialization...');
    
    // Step 1: Create users
    const userIds = await createUsers();
    
    // Step 2: Create user-specific collections
    await createPlans(userIds);
    await createProgress(userIds);
    await createMoodLogs(userIds);
    
    // Step 3: Create shared collections
    await createCommunityPosts(userIds);
    await createBetaUsers();
    await createInteractions(userIds);
    await createAICache();
    
    // Commit any remaining operations
    if (operationCount > 0) {
      console.log(`Committing final batch of ${operationCount} operations...`);
      await batch.commit();
    }
    
    console.log('Database initialization completed successfully ✅');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Execute the initialization
initializeDatabase();