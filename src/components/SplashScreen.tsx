
import { useState, useEffect } from 'react';

const SplashScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [animationState, setAnimationState] = useState<'initial' | 'fadeIn' | 'fadeOut'>('initial');

  useEffect(() => {
    // Start fade in animation
    const fadeInTimer = setTimeout(() => {
      setAnimationState('fadeIn');
    }, 300);

    // Start fade out after showing logo for a while
    const fadeOutTimer = setTimeout(() => {
      setAnimationState('fadeOut');
    }, 2500);

    // Complete the animation and notify parent
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-1000 ${
        animationState === 'initial' ? 'opacity-100' : 
        animationState === 'fadeIn' ? 'opacity-100' : 
        'opacity-0 pointer-events-none'
      }`}
    >
      <div className={`transition-transform duration-700 ${
        animationState === 'initial' ? 'scale-90 opacity-0' : 
        animationState === 'fadeIn' ? 'scale-100 opacity-100' : 
        'scale-110 opacity-0'
      }`}>
        <img 
          src="/lovable-uploads/5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
          alt="BlinderFit Logo" 
          className="h-32 w-auto"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
