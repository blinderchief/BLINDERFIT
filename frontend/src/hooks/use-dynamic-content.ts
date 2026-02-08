import { useState, useEffect } from 'react';
import { fetchPageContent, PageContent } from '@/lib/content';

// Fallback content if the API fails
const fallbackContent: PageContent = {
  heroImages: [
    {
      url: "https://images.unsplash.com/photo-1549476464-37392f717541",
      message: "TRANSFORM YOUR PERCEPTION",
      description: "Unleash your potential with personalized fitness."
    },
    // Add more fallback content
  ],
  visionText: {
    heading: "OUR VISION",
    quote: "To transform how we perceive fitness...",
    description: "Founded by Suyash Kumar Singh, BlinderFit redefines fitness..."
  },
  visionFeatures: [
    {
      icon: "Leaf",
      title: "Perception Training",
      description: "Our unique approach retrains how you perceive fitness challenges."
    },
    // Add more features
  ]
};

export function useDynamicContent() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadContent() {
      try {
        setIsLoading(true);
        const data = await fetchPageContent();
        setContent(data || fallbackContent);
      } catch (err) {
        console.error("Failed to load content:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setContent(fallbackContent);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  return { content, isLoading, error };
}