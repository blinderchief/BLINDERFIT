
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, Facebook, Instagram, Linkedin, Youtube, Twitter, ChevronsUp } from 'lucide-react';
import Chatbot from './Chatbot';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
    // Navigate to login page after logout
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'bg-black/80 backdrop-blur-lg py-3' : 'bg-black/50 backdrop-blur-md py-5'
        } border-b border-white/10`}>
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Left: Menu Button (Mobile) / Menu Items (Desktop) */}
          <div className="flex items-center">
            {/* Menu Button - Now always visible per Rolls Royce style */}
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
              src="/lovable-uploads/5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
              alt="BlinderFit Logo" 
              className="h-8 w-auto mb-1"
            />
            <Link to="/" className="text-center">
              <h1 className="text-xl md:text-2xl font-light tracking-[0.3em] text-white">
                BLINDERFIT
              </h1>
            </Link>
          </div>

          {/* Right: Login/Profile */}
          <div className="flex items-center space-x-6">
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
        </div>

        {/* Full Screen Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col">
            <div className="absolute top-6 right-6">
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-white rounded-full border border-white/30 p-2 hover:border-white/60 transition-all"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex h-full">
              {/* Menu content */}
              <div 
                className="w-full h-full overflow-y-auto py-24 px-12"
                style={{ 
                  animation: 'slideInFromLeft 0.5s ease-out forwards'
                }}
              >
                <img 
                  src="/lovable-uploads/5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
                  alt="BlinderFit Logo" 
                  className="h-24 w-auto mx-auto mb-12"
                />
                <p className="text-center text-xl text-gold italic mb-8">
                  "Push past your limits and embrace the journey of transformation."
                </p>
                <nav className="text-center space-y-8">
                  <Link 
                    to="/pulsehub" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white text-xl tracking-widest uppercase"
                  >
                    PulseHub
                  </Link>
                  <Link 
                    to="/fitlearn" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white text-xl tracking-widest uppercase"
                  >
                    FitLearn
                  </Link>
                  <Link 
                    to="/mindshift" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white text-xl tracking-widest uppercase"
                  >
                    MindShift
                  </Link>
                  <Link 
                    to="/fitmentor" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white text-xl tracking-widest uppercase"
                  >
                    FitMentor
                  </Link>
                  <Link 
                    to="/tribevibe" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white text-xl tracking-widest uppercase"
                  >
                    TribeVibe
                  </Link>
                  <Link 
                    to="/myzone" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white text-xl tracking-widest uppercase"
                  >
                    MyZone
                  </Link>
                  {user ? (
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-white text-xl tracking-widest uppercase mx-auto"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-white text-xl tracking-widest uppercase"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-white text-xl tracking-widest uppercase"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content with necessary padding to accommodate the fixed header */}
      <main className="flex-grow pt-24">
        <Outlet />
      </main>

      {/* Newsletter Section */}
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

      {/* Footer */}
      <footer className="bg-[#111111] text-white pt-12 pb-6 relative">
        <div className="gofit-container">
          {/* OurVibe Section */}
          <div className="mb-12 border-b border-white/10 pb-12">
            <h3 className="text-2xl font-light text-white mb-6 text-center">OurVibe</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="aspect-video bg-black/40 relative overflow-hidden rounded-sm border border-white/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
                    alt="BlinderFit Story" 
                    className="h-16 w-auto opacity-40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gold opacity-80" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-light text-gold mb-4">Our Journey</h4>
                <p className="text-silver mb-6">
                  Founded with a vision to transform how people approach fitness, BlinderFit combines cutting-edge AI technology with proven fitness methodologies to create a truly personalized experience for every user.
                </p>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-24 text-gold border-r border-gold/30 pr-4 font-light">2020</div>
                    <div className="flex-1 pl-4">Founded with a mission to democratize fitness</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-gold border-r border-gold/30 pr-4 font-light">2022</div>
                    <div className="flex-1 pl-4">Launched AI-powered fitness recommendations</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-gold border-r border-gold/30 pr-4 font-light">2024</div>
                    <div className="flex-1 pl-4">Expanded to serve over 1 million fitness enthusiasts</div>
                  </div>
                  <div className="flex">
                    <div className="w-24 text-gold border-r border-gold/30 pr-4 font-light">2025</div>
                    <div className="flex-1 pl-4">Introduced FitMentor & voice coaching technology</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Categories */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10">
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
              src="/lovable-uploads/5f537968-f4fd-400d-9da9-a30f4127c2e6.png" 
              alt="BlinderFit Logo" 
              className="h-16 w-auto"
            />
          </div>

          {/* Social Media Links */}
          <div className="border-t border-[#333] py-8">
            <div className="flex flex-wrap justify-center gap-8">
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
            <div className="flex flex-wrap justify-center gap-6 mb-4">
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
