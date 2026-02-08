
import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, Facebook, Instagram, Linkedin, Youtube, Twitter, ChevronsUp } from 'lucide-react';
import Chatbot from './Chatbot';

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current page is home
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLogout = async () => {
    await logout();
    // Navigate to home page after logout instead of login
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled ? 'bg-black/80 backdrop-blur-lg py-2 sm:py-3' : 'bg-black/50 backdrop-blur-md py-3 sm:py-5'
      } border-b border-white/10`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-12 sm:h-16">
          {/* Left: Menu Button (Mobile) / Menu Items (Desktop) */}
          <div className="flex items-center">
            {/* Menu Button */}
            <button 
              className="text-white mr-4 p-2 flex items-center rounded-full border border-white/30 hover:border-white/60 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Center: Logo and Company Name */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center">
            <img 
              src="/images/blinderfit-logo.png" 
              alt="BlinderFit Logo" 
              className="h-8 w-auto mb-1"
            />
            <Link to="/" className="text-center">
              <h1 className="text-xl md:text-2xl font-light tracking-[0.3em] text-white">
                BLINDERFIT
              </h1>
            </Link>
          </div>

          {/* Right: Login/Profile - Hide on mobile, show on desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div 
                onClick={() => navigate('/myzone')}
                className="text-white hover:text-gray-200 flex items-center cursor-pointer transition-colors"
              >
                <User size={20} />
                <span className="ml-2 text-xs hidden md:inline tracking-widest uppercase">Profile</span>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-300 hover:text-white text-xs tracking-widest uppercase transition-colors">
                  Login
                </Link>
                <Link to="/register" className="text-gray-300 hover:text-white border border-white/30 px-4 py-2 text-xs tracking-widest uppercase transition-colors hover:bg-white/10">
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile profile icon - only show on mobile */}
          <div className="flex md:hidden items-center">
            {user && (
              <div 
                onClick={() => navigate('/myzone')}
                className="text-white hover:text-gray-200 flex items-center cursor-pointer transition-colors"
              >
                <User size={20} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      <div 
        className={`fixed inset-y-0 left-0 w-full sm:w-[400px] max-w-full bg-gradient-to-b from-black/95 via-black/90 to-black/85 backdrop-blur-2xl z-50 transform 
          transition-transform duration-500 ease-in-out overflow-y-auto ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="container mx-auto px-4 py-6 min-h-full flex flex-col justify-center">
          {/* Close Button - Moved to top right corner */}
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 text-white rounded-full border border-white/30 p-2 hover:border-white/60 transition-all"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

          {/* Logo and Brand Section - Centered */}
          <div className="flex flex-col items-center mb-16">
            <img 
              src="/images/blinderfit-logo.png" 
              alt="BlinderFit Logo" 
              className="h-16 w-auto mb-4"
            />
            <h2 className="text-2xl font-light tracking-[0.5em] text-white/90">
              BLINDERFIT
            </h2>
          </div>

          {/* Navigation - Centered with increased spacing */}
          <nav className="flex flex-col items-center space-y-8">
            {[
              { to: "/pulsehub", label: "PULSEHUB" },
              { to: "/tracking", label: "TRACKING" },
              { to: "/fitness-plan", label: "FITNESS PLAN" },
              { to: "/fitlearn", label: "FITLEARN" },
              { to: "/mindshift", label: "MINDSHIFT" },
              { to: "/fitmentor", label: "FITMENTOR" },
              { to: "/tribevibe", label: "TRIBEVIBE" },
              { to: "/myzone", label: "MYZONE" },
            ].map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                onClick={() => setIsMenuOpen(false)}
                className="text-white/70 text-xl tracking-[0.4em] uppercase transition-all duration-500 px-4 py-2
                  hover:text-white hover:bg-white/5 hover:pl-6 backdrop-blur-sm w-full text-center"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Add Login/Register/Logout buttons for mobile */}
            <div className="flex flex-col space-y-4 w-full mt-6 pt-6 border-t border-white/10">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="text-white/70 text-xl tracking-[0.4em] uppercase transition-all duration-500 px-4 py-2
                    hover:text-white hover:bg-white/5 hover:pl-6 backdrop-blur-sm w-full text-center"
                >
                  LOGOUT
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/70 text-xl tracking-[0.4em] uppercase transition-all duration-500 px-4 py-2
                      hover:text-white hover:bg-white/5 hover:pl-6 backdrop-blur-sm w-full text-center"
                  >
                    LOGIN
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/70 text-xl tracking-[0.4em] uppercase transition-all duration-500 px-4 py-2
                      hover:text-white hover:bg-white/5 hover:pl-6 backdrop-blur-sm w-full text-center"
                  >
                    REGISTER
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow pt-24">
        {children}
      </main>

      {/* Newsletter Section - Only show on home page */}
      {isHomePage && (
        <section className="bg-[#222222] py-12">
          <div className="gofit-container text-center">
            <h2 className="text-2xl font-light tracking-wider text-white mb-4">Newsletter</h2>
            <p className="text-[#E8E8E8] mb-6 max-w-2xl mx-auto">
              "Success isn't just about achieving goals, it's about consistently pushing boundaries and embracing the journey."
            </p>
            <div className="flex justify-center">
              <button className="bg-[#E63946] hover:bg-[#E63946]/90 text-white py-3 px-12 transition-colors">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#111111] text-white pt-12 pb-6 relative">
        <div className="gofit-container">
          {/* OurVibe Section - Only show on home page */}
          {isHomePage && (
            <div className="mb-12 border-b border-white/10 pb-12">
              <h3 className="text-2xl font-light text-white mb-6 text-center">OurVibe</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="aspect-video bg-black/40 relative overflow-hidden rounded-sm border border-white/10">
                  <video 
                    className="w-full h-full object-cover"
                    controls
                    poster="/images/blinderfit-logo.png"
                    preload="metadata"
                  >
                    <source src="/videos/blinderfitvideo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 text-center">
                    <p className="text-gold text-sm font-light italic">
                      "Imagine a fitness journey where every movement brings clarity, every challenge reveals strength, and technology adapts to your unique potential."
                    </p>
                    <p className="text-white/70 text-xs mt-2">
                      — Founder's Vision
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-light text-gold mb-4">Our Vision</h4>
                  <p className="text-silver mb-6">
                    Currently in the idea stage, BlinderFit is being built with a revolutionary vision to transform how people approach fitness. The founder's bold mission is to create a platform that treats fitness not just as physical activity, but as a holistic journey of clarity and purpose.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                      </div>
                      <div>Personalized AI-driven fitness experiences for every individual</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                      </div>
                      <div>Mind-body connection that transforms obstacles into stepping stones</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4"></path>
                          <path d="M12 16h.01"></path>
                        </svg>
                      </div>
                      <div>Community-driven approach to health and fitness transformation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Footer Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-10">
            {/* Column 1: TRAINING */}
            <div>
              <h3 className="text-white uppercase text-sm tracking-wider mb-6">Training</h3>
              <ul className="space-y-3">
                <li><Link to="/beginner-plans" className="text-[#999] hover:text-gold text-xs transition-colors">Beginner Plans</Link></li>
                <li><Link to="/advanced-plans" className="text-[#999] hover:text-gold text-xs transition-colors">Advanced Plans</Link></li>
                <li><Link to="/celebrity-routines" className="text-[#999] hover:text-gold text-xs transition-colors">Celebrity Routines</Link></li>
                <li><Link to="/personal-trainers" className="text-[#999] hover:text-gold text-xs transition-colors">Personal Trainers</Link></li>
                <li><Link to="/workout-series" className="text-[#999] hover:text-gold text-xs transition-colors">Workout Series</Link></li>
              </ul>
            </div>

            {/* Column 2: NUTRITION */}
            <div>
              <h3 className="text-white uppercase text-sm tracking-wider mb-6">Nutrition</h3>
              <ul className="space-y-3">
                <li><Link to="/meal-plans" className="text-[#999] hover:text-gold text-xs transition-colors">Meal Plans</Link></li>
                <li><Link to="/recipes" className="text-[#999] hover:text-gold text-xs transition-colors">Healthy Recipes</Link></li>
                <li><Link to="/supplements" className="text-[#999] hover:text-gold text-xs transition-colors">Supplements</Link></li>
                <li><Link to="/nutrition-guides" className="text-[#999] hover:text-gold text-xs transition-colors">Nutrition Guides</Link></li>
                <li><Link to="/macro-calculator" className="text-[#999] hover:text-gold text-xs transition-colors">Macro Calculator</Link></li>
              </ul>
            </div>

            {/* Column 3: COMMUNITY */}
            <div>
              <h3 className="text-white uppercase text-sm tracking-wider mb-6">Community</h3>
              <ul className="space-y-3">
                <li><Link to="/tribevibe" className="text-[#999] hover:text-gold text-xs transition-colors">TribeVibe</Link></li>
                <li><Link to="/men" className="text-[#999] hover:text-gold text-xs transition-colors">Men</Link></li>
                <li><Link to="/women" className="text-[#999] hover:text-gold text-xs transition-colors">Women</Link></li>
                <li><Link to="/seniors" className="text-[#999] hover:text-gold text-xs transition-colors">Seniors</Link></li>
                <li><Link to="/athletes" className="text-[#999] hover:text-gold text-xs transition-colors">Athletes</Link></li>
              </ul>
            </div>

            {/* Column 4: PROGRAMS */}
            <div>
              <h3 className="text-white uppercase text-sm tracking-wider mb-6">Programs</h3>
              <ul className="space-y-3">
                <li><Link to="/group-classes" className="text-[#999] hover:text-gold text-xs transition-colors">Group Classes</Link></li>
                <li><Link to="/wellness-retreats" className="text-[#999] hover:text-gold text-xs transition-colors">Wellness Retreats</Link></li>
                <li><Link to="/fitness-challenges" className="text-[#999] hover:text-gold text-xs transition-colors">Fitness Challenges</Link></li>
                <li><Link to="/virtual-coaching" className="text-[#999] hover:text-gold text-xs transition-colors">Virtual Coaching</Link></li>
                <li><Link to="/personal-assessment" className="text-[#999] hover:text-gold text-xs transition-colors">Personal Assessment</Link></li>
              </ul>
            </div>

            {/* Column 5: RESOURCES */}
            <div>
              <h3 className="text-white uppercase text-sm tracking-wider mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><Link to="/fitlearn" className="text-[#999] hover:text-gold text-xs transition-colors">FitLearn</Link></li>
                <li><Link to="/fitmentor" className="text-[#999] hover:text-gold text-xs transition-colors">FitMentor</Link></li>
                <li><Link to="/mindshift" className="text-[#999] hover:text-gold text-xs transition-colors">MindShift</Link></li>
                <li><Link to="/careers" className="text-[#999] hover:text-gold text-xs transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-[#999] hover:text-gold text-xs transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          {/* Logo in footer */}
          <div className="flex justify-center mb-8">
            <img 
              src="/images/blinderfit-logo.png" 
              alt="BlinderFit Logo" 
              className="h-16 w-auto"
            />
          </div>

          {/* Social Media Links */}
          <div className="border-t border-[#333] py-8">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <a href="https://facebook.com" className="flex items-center gap-2 text-[#999] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <Facebook size={18} />
                <span className="text-xs uppercase tracking-wider">Facebook</span>
              </a>
              <a href="https://instagram.com" className="flex items-center gap-2 text-[#999] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <Instagram size={18} />
                <span className="text-xs uppercase tracking-wider">Instagram</span>
              </a>
              <a href="https://linkedin.com" className="flex items-center gap-2 text-[#999] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <Linkedin size={18} />
                <span className="text-xs uppercase tracking-wider">LinkedIn</span>
              </a>
              <a href="https://youtube.com" className="flex items-center gap-2 text-[#999] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <Youtube size={18} />
                <span className="text-xs uppercase tracking-wider">YouTube</span>
              </a>
              <a href="https://twitter.com" className="flex items-center gap-2 text-[#999] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                <Twitter size={18} />
                <span className="text-xs uppercase tracking-wider">X</span>
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-[#333] pt-8 mt-4">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-4">
              <Link to="/legal" className="text-[#999] hover:text-white text-xs transition-colors">Legal</Link>
              <Link to="/privacy-policy" className="text-[#999] hover:text-white text-xs transition-colors">Privacy Policy</Link>
              <Link to="/cookie-policy" className="text-[#999] hover:text-white text-xs transition-colors">Cookie Policy</Link>
              <Link to="/accessibility" className="text-[#999] hover:text-white text-xs transition-colors">Accessibility</Link>
              <Link to="/privacy-requests" className="text-[#999] hover:text-white text-xs transition-colors">Submit your privacy request</Link>
              <Link to="/contacts" className="text-[#999] hover:text-white text-xs transition-colors">Contacts</Link>
            </div>
            <p className="text-center text-[#666] text-xs mt-6">
              © {new Date().getFullYear()} BLINDERFIT. All rights reserved.
            </p>
          </div>
        </div>

        {/* Scroll to top button - Centered at the bottom */}
        <button 
          onClick={scrollToTop} 
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gold/20 hover:bg-gold/30 p-3 rounded-full transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ChevronsUp className="text-gold" size={24} />
        </button>
      </footer>

      {/* Add Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Layout;































