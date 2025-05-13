
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state, or default to pulsehub
  const from = location.state?.from?.pathname || "/pulsehub";

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/pulsehub', { replace: true });
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await login(email, password);
    
    if (success) {
      // Redirect to PulseHub after successful login
      navigate("/pulsehub", { replace: true });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-light mb-2">LOGIN</h1>
        <p className="text-gray-400">Welcome back to BlinderFit</p>
      </div>
      
      <form onSubmit={handleEmailLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="email" className="block text-xs uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-black/20 border border-white/20 rounded-md pl-10 focus:outline-none focus:ring-1 focus:ring-white/30"
                placeholder="Enter your email"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="password" className="block text-xs uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-black/20 border border-white/20 rounded-md pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-white/30"
                placeholder="Enter your password"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-white">
            Forgot password?
          </Link>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Login</span>
          {isSubmitting ? (
            <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
          ) : (
            <ArrowRight size={18} />
          )}
        </button>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-white hover:underline">
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;





















