# BlinderFit AI Integration

This document provides an overview of the AI functionality in the BlinderFit application, including setup instructions and usage for blinderfit.blinder.live.

## Overview

BlinderFit leverages state-of-the-art AI to provide:

1. **Personalized Fitness Plans** - Generate customized workout plans based on user preferences and goals
2. **AI Fitness Assistant** - Get answers to fitness and health-related questions
3. **Real-time Feedback** - Receive personalized insights and recommendations

## Setup

1. **Environment Setup**:
   ```bash
   node scripts/setup-environment.js
   ```
   This script will configure all necessary environment variables for local and Firebase environments.

2. **Install Dependencies**:
   ```bash
   cd functions
   npm install
   ```

3. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

4. **Deploy to Production**:
   For deploying to your official website (blinder.blinder.live), use:
   ```bash
   deploy-production.bat
   ```

## AI Features

### 1. Personalized Nutrition Plans

The system generates customized nutrition plans based on user:
- Physical attributes (height, weight, etc.)
- Dietary preferences and restrictions
- Health goals
- Past adherence patterns
- Food preferences

Call this function from your frontend:
```javascript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const generateNutritionPlan = httpsCallable(functions, 'generateNutritionPlan');

// Example call
generateNutritionPlan({
  weekNumber: 1,
  requestParameters: {
    calorieTarget: 2000,
    mealsPerDay: 3,
    includeSnacks: true,
    focusAreas: "protein, energy"
  }
})
.then((result) => {
  const plan = result.data.plan;
  // Use the plan in your UI
})
.catch((error) => {
  console.error("Error generating plan:", error);
});
```

### 2. Answer Health Questions

Users can ask health and fitness related questions and get personalized answers:

```javascript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const answerHealthQuestion = httpsCallable(functions, 'answerHealthQuestion');

// Example call
answerHealthQuestion({
  question: "What should I eat before my morning workout?"
})
.then((result) => {
  const answer = result.data.answer;
  // Display answer in your UI
})
.catch((error) => {
  console.error("Error getting answer:", error);
});
```

### 3. Automatic Personalization

The system runs daily to analyze user behavior and update personalization models:

- No manual action is required
- User interactions are automatically tracked
- Personalization improves over time as more data is collected

## Data Structure

- **User Profile**: Core user information and preferences
- **User Interactions**: Records of user actions in the app
- **AI Personalization**: AI-derived insights about the user
- **AI Queries**: History of AI interactions with users
- **AI Cache**: Cached responses for performance

## Security

- All AI interactions require authentication
- User data is only accessible to the user it belongs to
- AI insights are protected by Firestore security rules