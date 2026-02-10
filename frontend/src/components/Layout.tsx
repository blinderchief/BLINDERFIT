
import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, Facebook, Instagram, Linkedin, Youtube, Twitter, ChevronsUp } from 'lucide-react';
import Chatbot from './Chatbot';

interface LayoutProps {
  children?: ReactNode;
}

const ADMIN_EMAIL = 'suyashsingh.raebareli@gmail.com';

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.email === ADMIN_EMAIL;

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
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/images/blinderfit-logo.svg" 
                alt="BlinderFit" 
                className="h-7 w-auto"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-lg md:text-xl font-light tracking-[0.3em] text-white">
                BLINDERFIT
              </span>
            </Link>
            <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded border border-gold/40 text-gold bg-gold/5 font-medium leading-none">
              Beta
            </span>
          </div>

          {/* Right: Login/Profile - Hide on mobile, show on desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <div 
                onClick={() => navigate('/myzone')}
                className="text-white hover:text-gray-200 flex items-center cursor-pointer transition-colors"
              >
                <User size={20} />
                <span className="ml-2 text-xs hidden md:inline tracking-widest uppercase">Profile</span>
              </div>
            ) : user ? (
              <button onClick={handleLogout} className="text-gray-300 hover:text-white text-xs tracking-widest uppercase transition-colors">
                Logout
              </button>
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
          
          {/* Mobile profile icon - only show on mobile for admin */}
          <div className="flex md:hidden items-center">
            {isAdmin && (
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
          transition-transform duration-500 ease-in-out overflow-y-auto hide-scrollbar ${
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
              src="/images/blinderfit-logo.svg" 
              alt="BlinderFit" 
              className="h-16 w-auto mb-4"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <h2 className="text-2xl font-light tracking-[0.5em] text-white/90">
              BLINDERFIT
            </h2>
          </div>

          {/* Navigation - Centered with increased spacing */}
          <nav className="flex flex-col items-center space-y-8">
            {isAdmin && [
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

      {/* Footer */}
      <footer className="bg-[#111111] text-white pt-12 pb-6 relative">
        <div className="gofit-container">
          {/* Full footer with categories — homepage only */}
          {isHomePage && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-10">
                {/* Column 1: PLATFORM */}
                <div>
                  <h3 className="text-white uppercase text-sm tracking-wider mb-6">Platform</h3>
                  <ul className="space-y-3">
                    <li><Link to="/pulsehub" className="text-[#999] hover:text-gold text-xs transition-colors">PulseHub Dashboard</Link></li>
                    <li><Link to="/fitmentor" className="text-[#999] hover:text-gold text-xs transition-colors">FitMentor AI Coach</Link></li>
                    <li><Link to="/fitness-plan" className="text-[#999] hover:text-gold text-xs transition-colors">Fitness Plans</Link></li>
                    <li><Link to="/tracking" className="text-[#999] hover:text-gold text-xs transition-colors">Health Tracking</Link></li>
                  </ul>
                </div>

                {/* Column 2: LEARN & GROW */}
                <div>
                  <h3 className="text-white uppercase text-sm tracking-wider mb-6">Learn & Grow</h3>
                  <ul className="space-y-3">
                    <li><Link to="/fitlearn" className="text-[#999] hover:text-gold text-xs transition-colors">FitLearn</Link></li>
                    <li><Link to="/mindshift" className="text-[#999] hover:text-gold text-xs transition-colors">MindShift</Link></li>
                    <li><Link to="/tribevibe" className="text-[#999] hover:text-gold text-xs transition-colors">TribeVibe Community</Link></li>
                    <li><Link to="/myzone" className="text-[#999] hover:text-gold text-xs transition-colors">MyZone</Link></li>
                  </ul>
                </div>

                {/* Column 3: COMPANY */}
                <div>
                  <h3 className="text-white uppercase text-sm tracking-wider mb-6">Company</h3>
                  <ul className="space-y-3">
                    <li><Link to="/about" className="text-[#999] hover:text-gold text-xs transition-colors">About Us</Link></li>
                    <li><Link to="/contact" className="text-[#999] hover:text-gold text-xs transition-colors">Contact</Link></li>
                    <li><Link to="/careers" className="text-[#999] hover:text-gold text-xs transition-colors">Careers</Link></li>
                  </ul>
                </div>

                {/* Column 4: LEGAL */}
                <div>
                  <h3 className="text-white uppercase text-sm tracking-wider mb-6">Legal</h3>
                  <ul className="space-y-3">
                    <li><Link to="/privacy-policy" className="text-[#999] hover:text-gold text-xs transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/legal" className="text-[#999] hover:text-gold text-xs transition-colors">Terms of Service</Link></li>
                    <li><Link to="/cookie-policy" className="text-[#999] hover:text-gold text-xs transition-colors">Cookie Policy</Link></li>
                    <li><Link to="/accessibility" className="text-[#999] hover:text-gold text-xs transition-colors">Accessibility</Link></li>
                  </ul>
                </div>
              </div>

              {/* Logo in footer */}
              <div className="flex justify-center mb-8">
                <img 
                  src="/images/blinderfit-logo.svg" 
                  alt="BlinderFit" 
                  className="h-16 w-auto"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
            </>
          )}

          {/* Legal Links — shown on all pages */}
          <div className={`${isHomePage ? 'border-t border-[#333] pt-8 mt-4' : ''}`}>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-4">
              <Link to="/legal" className="text-[#999] hover:text-white text-xs transition-colors">Terms</Link>
              <Link to="/privacy-policy" className="text-[#999] hover:text-white text-xs transition-colors">Privacy</Link>
              <Link to="/cookie-policy" className="text-[#999] hover:text-white text-xs transition-colors">Cookies</Link>
              <Link to="/accessibility" className="text-[#999] hover:text-white text-xs transition-colors">Accessibility</Link>
              <Link to="/contact" className="text-[#999] hover:text-white text-xs transition-colors">Contact</Link>
            </div>
            <p className="text-center text-[#666] text-xs mt-6">
              © {new Date().getFullYear()} BLINDERFIT. All rights reserved.
            </p>
          </div>
        </div>

        {/* Scroll to top button — homepage only */}
        {isHomePage && (
          <button 
            onClick={scrollToTop} 
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gold/20 hover:bg-gold/30 p-3 rounded-full transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ChevronsUp className="text-gold" size={24} />
          </button>
        )}
      </footer>

      {/* Add Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Layout;































