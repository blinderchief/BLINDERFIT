import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../integrations/firebase/client';

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
  // Add more content types as needed
}

// Get content from Firebase Firestore
export const getHomeContent = async (): Promise<PageContent> => {
  try {
    // Default content in case of error or empty database
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

    // Try to fetch content from Firestore
    const heroImagesQuery = query(
      collection(db, 'heroImages'),
      orderBy('order', 'asc')
    );
    const heroImagesSnapshot = await getDocs(heroImagesQuery);
    
    if (!heroImagesSnapshot.empty) {
      const heroImages = heroImagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          url: data.url,
          message: data.message,
          description: data.description
        };
      });
      defaultContent.heroImages = heroImages;
    }

    // Fetch vision text
    const visionTextQuery = query(collection(db, 'visionText'), limit(1));
    const visionTextSnapshot = await getDocs(visionTextQuery);
    
    if (!visionTextSnapshot.empty) {
      const visionTextData = visionTextSnapshot.docs[0].data();
      defaultContent.visionText = {
        heading: visionTextData.heading,
        quote: visionTextData.quote,
        description: visionTextData.description
      };
    }

    // Fetch vision features
    const visionFeaturesQuery = query(
      collection(db, 'visionFeatures'),
      orderBy('order', 'asc')
    );
    const visionFeaturesSnapshot = await getDocs(visionFeaturesQuery);
    
    if (!visionFeaturesSnapshot.empty) {
      const visionFeatures = visionFeaturesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          icon: data.icon,
          title: data.title,
          description: data.description
        };
      });
      defaultContent.visionFeatures = visionFeatures;
    }

    return defaultContent;
  } catch (error) {
    console.error('Error fetching content from Firebase:', error);
    // Return default content in case of error
    return {
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
  }

