# BlinderFit Database Scripts

This directory contains scripts for managing the BlinderFit Firestore database.

## Prerequisites

Before running these scripts:

1. Generate a Firebase Admin SDK service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the file as `service-account-key.json` in the project root directory

2. Install dependencies:
   ```
   npm install firebase-admin
   ```

## Available Scripts

### Initialize Database

Populates the database with initial schema and demo data.

```
npm run db:init
```

### Migrate Data

Performs data migrations or schema updates.

```
npm run db:migrate <migration-name>
```

Available migrations:
- `add-timezone`: Adds timezone field to users
- `restructure-metrics`: Restructures metrics data format

### Backup Data

Creates JSON backups of Firestore collections.

Backup a specific collection:
```
npm run db:backup <collection-name>
```

Backup all collections:
```
npm run db:backup-all
```

Backups are stored in the `/backups` directory.

## Security Considerations

- Keep your service account key secure and never commit it to version control
- Run these scripts in controlled environments (not production) when possible
- Consider using Firebase security rules alongside these scripts

## Best Practices

- Always back up data before migrations
- Test migrations on development/staging environments first
- Break large migrations into smaller, atomic changes
- Document schema changes in a schema changelog