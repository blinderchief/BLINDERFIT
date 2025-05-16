/**
 * BlinderFit Database Backup Script
 * Creates JSON backups of Firestore collections
 * Run with: node scripts/firestore/backup-data.js [collection]
 */

const admin = require('firebase-admin');
const serviceAccount = require('../../service-account-key.json');
const fs = require('fs');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Function to backup a specific collection
async function backupCollection(collectionName) {
  try {
    console.log(`Starting backup of collection: ${collectionName}`);
    
    const snapshot = await db.collection(collectionName).get();
    const data = [];
    
    snapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${collectionName}_${timestamp}.json`);
    
    // Convert Firebase timestamps to ISO strings
    const jsonData = JSON.stringify(data, (key, value) => {
      // Check if value is a Firebase Timestamp
      if (value && typeof value === 'object' && value._seconds !== undefined) {
        return new Date(value._seconds * 1000).toISOString();
      }
      return value;
    }, 2);
    
    fs.writeFileSync(backupPath, jsonData);
    console.log(`Backup completed: ${backupPath}`);
  } catch (error) {
    console.error(`Backup failed for ${collectionName}:`, error);
  }
}

// Function to backup all collections
async function backupAllCollections() {
  try {
    console.log('Starting backup of all collections');
    
    const collections = await db.listCollections();
    
    for (const collection of collections) {
      await backupCollection(collection.id);
    }
    
    console.log('All collections backed up successfully');
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

// Get collection name from command line args
const collectionName = process.argv[2];

if (collectionName) {
  backupCollection(collectionName)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} else {
  backupAllCollections()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}