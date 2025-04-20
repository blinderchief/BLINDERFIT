
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";

const Index = () => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Hero section images and quotes
  const heroContent = [
    {
      image: "https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      quote: "The only bad workout is the one that didn't happen.",
      description: "Discover a fitness journey tailored to your unique body and goals, powered by cutting-edge AI technology."
    },
    {
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      quote: "Your body can stand almost anything. It's your mind that you have to convince.",
      description: "Break through barriers with intelligent training that adapts to your personal fitness journey."
    },
    {
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      quote: "Strength does not come from the body. It comes from the will.",
      description: "Unleash your full potential with personalized training plans crafted by advanced AI."
    },
    {
      image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80",
      quote: "What seems impossible today will one day become your warm-up.",
      description: "Experience fitness evolution with AI that learns and grows with your achievements."
    },
    {
      image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80",
      quote: "The only limits in fitness are the ones you place on yourself.",
      description: "Redefine what's possible with personalized guidance that understands your unique physiology."
    }
  ];
  
  useEffect(() => {
    // Set initial visibility after a slight delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    
    // Play video when loaded
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay prevented by browser", error);
      });
    }
    
    // Auto-advance carousel
    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroContent.length);
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(carouselInterval);
    };
  }, [heroContent.length]);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Image Carousel */}
        <Carousel 
          className="absolute inset-0 w-full h-full" 
          opts={{ loop: true }}
          setApi={carousel => {
            if (carousel) {
              carousel.scrollTo(currentSlide);
            }
          }}
        >
          <CarouselContent className="h-full">
            {heroContent.map((content, index) => (
              <CarouselItem key={index} className="h-full">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${content.image})`,
                    opacity: index === currentSlide ? 1 : 0,
                    transition: 'opacity 1000ms ease-in-out'
                  }}
                ></div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 text-center max-w-4xl px-6">
          <div 
            className={`transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <img 
              src="/lovable-uploads/5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
              alt="BlinderFit Logo" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-widest text-white mb-8">
              BLINDERFIT
            </h1>
            <p className="text-2xl text-gold italic mb-8 max-w-3xl mx-auto font-light">
              "{heroContent[currentSlide].quote}"
            </p>
            <p className="text-xl text-white/80 font-light mb-10 max-w-2xl mx-auto">
              {heroContent[currentSlide].description}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="gofit-button group flex items-center justify-center text-base"
                >
                  Your Dashboard 
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link 
                  to="/register" 
                  className="gofit-button group flex items-center justify-center text-base"
                >
                  Start Your Journey 
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <Link 
                to="/education" 
                className="gofit-button-outline group flex items-center justify-center text-base"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Carousel indicators */}
        <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-center gap-2">
          {heroContent.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-gold' : 'w-2 bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Scroll indicator */}
        <div 
          className={`absolute bottom-10 left-0 right-0 flex justify-center transition-opacity duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <a 
            href="#content" 
            className="animate-bounce text-gold"
            aria-label="Scroll down"
          >
            <ChevronRight className="rotate-90 h-8 w-8" />
          </a>
        </div>
      </section>

      {/* Content Sections */}
      <section id="content" className="bg-gofit-charcoal py-20">
        <div className="gofit-container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="section-heading">TRANSFORM YOUR LIFE</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              At BlinderFit, we believe in the power of personalized fitness to transform lives. 
              Our AI-powered platform adapts to your unique needs and goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gofit-black/50 p-8 border border-gofit-gold/20 hover:border-gofit-gold/50 transition-all duration-500 ease-out animate-slide-up">
              <h3 className="text-2xl font-light tracking-wide text-gofit-offwhite mb-4">
                Personalized Training
              </h3>
              <p className="text-gofit-silver font-light mb-6">
                Our intelligent system creates custom workout plans tailored to your fitness level, 
                goals, and preferences. Experience training that evolves as you progress.
              </p>
              <Link to="/education" className="text-gofit-gold flex items-center group">
                Discover More <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="bg-gofit-black/50 p-8 border border-gofit-gold/20 hover:border-gofit-gold/50 transition-all duration-500 ease-out animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-2xl font-light tracking-wide text-gofit-offwhite mb-4">
                FMGuide
              </h3>
              <p className="text-gofit-silver font-light mb-6">
                Balance your training with expert nutrition advice customized to support your 
                fitness journey. Learn how to fuel your body for optimal performance and recovery.
              </p>
              <Link to="/education" className="text-gofit-gold flex items-center group">
                Learn More <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
