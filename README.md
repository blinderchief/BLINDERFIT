# BlinderFit

BlinderFit is a comprehensive fitness application built with React, Vite, and Firebase, providing personalized fitness coaching, health tracking, and community features.

## Getting Started

### Prerequisites
- Node.js 18+ (recommended)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Authentication, Firestore, Storage, and Functions enabled

### Installation
1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create `.env` files based on `.env.example`
4. Run the development server
   ```bash
   npm run dev
   ```

## Build and Deployment

### Building for Production
```bash
npm run build
```

### Deploying to Firebase
```bash
npm run deploy
```

## Project Structure

```
BlinderFit/
├── frontend/           # React frontend application
│   ├── src/           # Application source code
│   │   ├── components/# Reusable UI components
│   │   ├── contexts/  # React context providers
│   │   ├── pages/     # Application pages/routes
│   │   ├── integrations/# External service integrations
│   │   └── services/  # Business logic and data services
│   ├── public/        # Static assets
│   ├── index.html     # Main HTML file
│   ├── vite.config.ts # Vite configuration
│   └── package.json   # Frontend dependencies
├── functions/         # Firebase cloud functions
│   ├── src/          # Function source code
│   │   └── ai/       # AI services and personalization
│   └── package.json  # Backend dependencies
├── firebase.json      # Firebase configuration
├── firestore.rules    # Database security rules
├── storage.rules      # Storage security rules
└── .env              # Environment variables
```

## Features

- **FitMentor**: AI-powered fitness coach
- **PulseHub**: Health and activity tracking dashboard
- **FitLearn**: Educational content on fitness and nutrition
- **MindShift**: Mental wellness resources
- **TribeVibe**: Social community features
- **MyZone**: Personal space for tracking progress

## Firebase Configuration

The application uses Firebase for:
- Authentication
- Firestore Database
- Cloud Storage
- Cloud Functions
- Hosting

## Development

### Frontend Development
```bash
npm run dev:frontend
```

### Backend Development
```bash
npm run dev:backend
```

### Full Stack Development
```bash
npm run serve  # Starts Firebase emulators
```
