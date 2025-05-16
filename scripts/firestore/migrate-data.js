/**
 * BlinderFit Database Migration Script
 * Use this script to migrate data or make schema changes
 * Run with: node scripts/firestore/migrate-data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Example migration: Add a new field to all user documents
async function addFieldToUsers(fieldName, defaultValue) {
  try {
    console.log(`Starting migration: Add "${fieldName}" field to all users`);
    
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    let count = 0;
    
    usersSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        [fieldName]: defaultValue,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      count++;
    });
    
    await batch.commit();
    console.log(`Migration completed: Added "${fieldName}" field to ${count} user documents`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Example: Change field type or structure
async function restructureField(collectionPath, oldField, newField, transformer) {
  try {
    console.log(`Starting migration: Restructure ${oldField} to ${newField} in ${collectionPath}`);
    
    const snapshot = await db.collection(collectionPath).get();
    const batch = db.batch();
    let count = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data[oldField] !== undefined) {
        const newValue = transformer(data[oldField]);
        batch.update(doc.ref, {
          [newField]: newValue,
          [oldField]: admin.firestore.FieldValue.delete()
        });
        count++;
      }
    });
    
    await batch.commit();
    console.log(`Migration completed: Restructured ${count} documents`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Main function with selectable migrations
async function runMigration(migrationName) {
  switch(migrationName) {
    case 'add-timezone':
      await addFieldToUsers('timezone', 'UTC');
      break;
    case 'restructure-metrics':
      await restructureField(
        'users', 
        'metrics', 
        'healthMetrics', 
        (oldMetrics) => ({
          ...oldMetrics,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        })
      );
      break;
    default:
      console.error(`Unknown migration: ${migrationName}`);
  }
  
  process.exit(0);
}

// Get migration name from command line
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  console.log('Example: node scripts/firestore/migrate-data.js add-timezone');
  process.exit(1);
}

runMigration(migrationName);