import { useState, useEffect } from 'react';

const SplashScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [animationState, setAnimationState] = useState<'initial' | 'fadeIn' | 'fadeOut'>('initial');

  useEffect(() => {
    // Simplified animation with shorter timeouts
    // Start fade in immediately
    setAnimationState('fadeIn');
    
    // Start fade out after a shorter display time
    const fadeOutTimer = setTimeout(() => {
      setAnimationState('fadeOut');
    }, 1500); // reduced from 2500 to 1500ms

    // Complete the animation and notify parent
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 2000); // reduced from 3000 to 2000ms

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${
        animationState === 'initial' ? 'opacity-100' : 
        animationState === 'fadeIn' ? 'opacity-100' : 
        'opacity-0 pointer-events-none'
      }`}
    >
      <div className={`transition-transform duration-500 ${
        animationState === 'initial' ? 'scale-95 opacity-0' : 
        animationState === 'fadeIn' ? 'scale-100 opacity-100' : 
        'scale-105 opacity-0'
      }`}>
        <img 
          src="/lovable-uploads/5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
          alt="BlinderFit Logo" 
          className="h-32 w-auto"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = 'none';
            onFinished(); // End splash screen if image can't load
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
