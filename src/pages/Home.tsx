import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Dumbbell, CircuitBoard, ChevronRight, ArrowRight, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import { toast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../integrations/firebase/client';

const Home = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    vision: false,
    about: false,
    earlyAdopter: false,
    cta: false
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      message: "TRANSFORM YOUR PERCEPTION",
      description: "Unleash your potential with personalized fitness that adapts to your unique vision."
    },
    {
      url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      message: "SEE BEYOND LIMITS",
      description: "Our revolutionary approach redefines fitness through the power of visualization."
    },
    {
      url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      message: "CLARITY THROUGH MOTION",
      description: "Founded by Suyash Kumar Singh to bring clarity and purpose to fitness journeys."
    }
  ];

  useEffect(() => {
    // Set initial visibility for hero section
    setTimeout(() => {
      setIsVisible(prev => ({ ...prev, hero: true }));
    }, 100);
    
    // Set visibility for earlyAdopter section after a delay
    setTimeout(() => {
      setIsVisible(prev => ({ ...prev, earlyAdopter: true }));
    }, 1500);
    
    const hasCookieConsent = localStorage.getItem('cookieConsent');
    if (!hasCookieConsent) {
      setShowCookieBanner(true);
    }

    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    // Make sure to include all sections we want to observe
    const sectionsToObserve = [
      { id: 'features', ref: document.getElementById('features') },
      { id: 'earlyAdopter', ref: document.getElementById('earlyAdopter') },
      { id: 'vision', ref: document.getElementById('vision') },
      { id: 'cta', ref: document.getElementById('cta') }
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setIsVisible(prev => ({ ...prev, [sectionId]: true }));
        }
      });
    }, observerOptions);

    // Delay the observer setup to ensure DOM elements are ready
    setTimeout(() => {
      sectionsToObserve.forEach(section => {
        const element = section.ref || document.getElementById(section.id);
        if (element) {
          observer.observe(element);
        } else {
          console.warn(`Element with id ${section.id} not found`);
        }
      });
    }, 500);

    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => {
      sectionsToObserve.forEach(section => {
        const element = section.ref || document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
      clearInterval(carouselInterval);
    };
  }, [heroImages.length]);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieBanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add email to Firebase Firestore
      await addDoc(collection(db, 'earlyAdopters'), {
        email,
        createdAt: serverTimestamp()
      });
      
      setEmail('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      toast({
        title: "Success!",
        description: "You've been added to our early adopter list.",
      });
    } catch (error: any) {
      console.error("Error submitting email:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Main Hero Section */}
      <section className="relative h-screen flex items-start pt-32">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        
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
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                  style={{
                    backgroundImage: `url("${image.url}")`,
                    opacity: index === currentSlide ? 1 : 0
                  }}
                ></div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        <div className="gofit-container relative z-10">
          <div 
            className={`max-w-2xl mx-auto sm:ml-8 transition-all duration-1000 ease-out ${
              isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center justify-center mb-6 p-4 sm:p-6 rounded-full bg-black/50 border border-gold/30">
                <img 
                  src="\lovable-uploads\5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
                  alt="BlinderFit Logo" 
                  className="h-12 sm:h-16 w-auto"
                />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-[0.3em] sm:tracking-[0.5em] text-white mb-4 sm:mb-6 text-center sm:text-left">
                BLINDERFIT
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-gold font-light mb-4 tracking-[0.2em] sm:tracking-[0.3em] text-center sm:text-left">
                CLARITY THROUGH MOTION
              </p>
              <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 font-light text-center sm:text-left">
                Founded by Suyash Kumar Singh to bring clarity and purpose to fitness journeys.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/pulsehub" className="gofit-button">
                    Go to Your Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="gofit-button">
                    Begin Your Journey
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center gap-2">
          {heroImages.map((_, index) => (
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
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <a 
            href="#vision" 
            className="animate-bounce text-gold"
            aria-label="Scroll to vision"
          >
            <ChevronRight className="rotate-90 h-8 w-8" />
          </a>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 bg-black border-t border-gold/10">
        <div className="gofit-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-wider text-white mb-6">OUR VISION</h2>
            <p className="text-xl text-gold font-light max-w-3xl mx-auto mb-4 tracking-wide">
              "To transform how we perceive fitness — not just as physical activity, but as a journey of clarity and purpose."
            </p>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Founded by Suyash Kumar Singh, BlinderFit redefines fitness by focusing on the mind-body connection. 
              We believe true transformation begins with clear vision and purpose.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/60 backdrop-blur-sm p-8 border border-gold/20 transform transition-all duration-300 hover:translate-y-[-10px] hover:border-gold/40">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                <Leaf className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-xl font-light text-white mb-4">Perception Training</h3>
              <p className="text-gray-300">
                Our unique approach retrains how you perceive fitness challenges, turning obstacles into stepping stones.
              </p>
            </div>
            
            <div className="bg-black/60 backdrop-blur-sm p-8 border border-gold/20 transform transition-all duration-300 hover:translate-y-[-10px] hover:border-gold/40">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                <Dumbbell className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-xl font-light text-white mb-4">Clarity Through Motion</h3>
              <p className="text-gray-300">
                Movement isn't just physical—it's mental. We guide you to find clarity in every rep, every stride.
              </p>
            </div>
            
            <div className="bg-black/60 backdrop-blur-sm p-8 border border-gold/20 transform transition-all duration-300 hover:translate-y-[-10px] hover:border-gold/40">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                <CircuitBoard className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-xl font-light text-white mb-4">AI-Enhanced Vision</h3>
              <p className="text-gray-300">
                Our technology analyzes your unique patterns to create personalized training that evolves with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Early Adopter Section */}
      <section id="earlyAdopter" className="py-16 bg-black border-t border-b border-gold/20">
        <div className="gofit-container">
          <div 
            className={`max-w-xl mx-auto text-center transition-all duration-1000 ease-out ${
              isVisible.earlyAdopter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="border border-gold/30 rounded-full px-8 py-3 inline-block mb-8">
              <p className="text-gold text-sm sm:text-base">Be Our First 1,000!</p>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-6 leading-tight">
              <span className="block sm:inline">EARLY</span>{" "}
              <span className="block sm:inline">ADOPTER</span>{" "}
              <span className="block sm:inline">INVITE</span>
            </h2>
            
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Join our exclusive community of early adopters and get access to special features.
            </p>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-grow bg-transparent border border-white/30 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  className="gofit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join Now'}
                </button>
              </div>
            </form>
            
            {showSuccess && (
              <div className="mt-4 p-3 bg-green-900/30 border border-green-500/30 text-green-400">
                Thank you for joining! We'll be in touch soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="gofit-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
                  alt="BlinderFit Logo" 
                  className="h-8 w-auto mr-3"
                />
                <h2 className="text-xl font-light tracking-wider text-white">BLINDERFIT</h2>
              </div>
              <p className="text-sm text-gray-400 mt-2 max-w-xs">
                Redefining fitness through the power of perception and clarity
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <h3 className="text-white font-light text-sm tracking-wider mb-3">CONTACT US</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="mailto:info@blinderfit.com" className="flex items-center text-gray-400 hover:text-gold transition-colors text-sm">
                      <Mail className="h-4 w-4 mr-2" />
                      info@blinderfit.com
                    </a>
                  </li>
                  <li>
                    <button className="flex items-center text-gray-400 hover:text-gold transition-colors text-sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Live Chat
                    </button>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-light text-sm tracking-wider mb-3">EXPLORE</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/fitlearn" className="text-gray-400 hover:text-gold transition-colors text-sm">
                      FitLearn
                    </Link>
                  </li>
                  <li>
                    <Link to="/mindshift" className="text-gray-400 hover:text-gold transition-colors text-sm">
                      MindShift
                    </Link>
                  </li>
                  <li>
                    <Link to="/fitmentor" className="text-gray-400 hover:text-gold transition-colors text-sm">
                      FitMentor
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-xs mb-4 sm:mb-0">
              © {new Date().getFullYear()} BlinderFit. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-400 text-xs">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-400 text-xs">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800 py-4 px-6 z-50">
          <div className="gofit-container">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-300 text-center sm:text-left">
                This website uses cookies to ensure you get the best experience on our website.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={acceptCookies}
                  className="px-4 py-2 bg-gold text-black text-xs tracking-wider hover:bg-gold/90 transition-colors"
                >
                  Accept
                </button>
                <Link 
                  to="/privacy"
                  className="px-4 py-2 border border-gray-600 text-gray-300 text-xs tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;






































