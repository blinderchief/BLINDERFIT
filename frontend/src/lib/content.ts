// Types for our content
export interface HeroImage {
  url: string;
  message: string;
  description: string;
}

export interface VisionFeature {
  icon: string;
  title: string;
  description: string;
}

export interface PageContent {
  heroImages: HeroImage[];
  visionText: {
    heading: string;
    quote: string;
    description: string;
  };
  visionFeatures: VisionFeature[];
}

// Static default content (no longer fetched from Firestore)
const defaultContent: PageContent = {
  heroImages: [
    {
      url: "/images/hero1.jpg",
      message: "Transform Your Fitness Journey",
      description: "Personalized workouts and nutrition plans"
    },
    {
      url: "/images/hero2.jpg",
      message: "Achieve Your Goals",
      description: "Track progress and stay motivated"
    },
    {
      url: "/images/hero3.jpg",
      message: "Join Our Community",
      description: "Connect with like-minded fitness enthusiasts"
    }
  ],
  visionText: {
    heading: "Our Vision",
    quote: "Fitness for everyone, everywhere",
    description: "We believe that fitness should be accessible to all, regardless of experience or background."
  },
  visionFeatures: [
    {
      icon: "dumbbell",
      title: "Personalized Workouts",
      description: "Get custom workout plans tailored to your goals and fitness level."
    },
    {
      icon: "apple",
      title: "Nutrition Guidance",
      description: "Receive personalized nutrition advice to fuel your workouts and recovery."
    },
    {
      icon: "users",
      title: "Community Support",
      description: "Join a community of fitness enthusiasts for motivation and accountability."
    }
  ]
};

// Get content - returns static defaults (can be extended to fetch from backend API)
export const getHomeContent = async (): Promise<PageContent> => {
  return defaultContent;
};

// Alias for backward compatibility
export const fetchPageContent = getHomeContent;
