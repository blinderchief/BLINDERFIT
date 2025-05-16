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
Use one of the following deployment scripts:
- `improved-deploy.bat` - Recommended deployment script
- `deploy-fixed-version.bat` - Alternative deployment script with detailed steps

Alternatively, follow the manual deployment steps in `MANUAL-DEPLOYMENT-GUIDE.md`.

## Project Structure

- `src/` - Application source code
  - `components/` - Reusable UI components
  - `contexts/` - React context providers
  - `pages/` - Application pages/routes
  - `integrations/` - External service integrations
  - `services/` - Business logic and data services
- `functions/` - Firebase cloud functions
- `public/` - Static assets

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

## Troubleshooting

See `DEPLOYMENT-TROUBLESHOOTING.md` for common deployment issues and solutions.

## Recent Fixes

Refer to `FIXES-SUMMARY.md` for a list of recent fixes and improvements.
