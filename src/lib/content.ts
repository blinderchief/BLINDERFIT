import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { supabase as appClient } from '@/integrations/supabase/client';

// Use the existing client instead of creating a new one
export const supabase = appClient;

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

