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
  const [rememberMe, setRememberMe] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const _from = location.state?.from?.pathname || "/pulsehub";

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

    const success = await login(email, password, rememberMe);

    if (success) {
      navigate("/pulsehub", { replace: true });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-black p-8 sm:p-10 border border-gold/20">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-wider text-white">
            Welcome back to <span className="text-gold">BLINDERFIT</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gold/20 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gold/20 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Remember me / Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-black text-gold focus:ring-gold/50"
              />
              <span className="text-sm text-gray-400">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-gold transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 bg-gold text-black font-medium flex items-center justify-center transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gold/90'
            }`}
          >
            {isSubmitting ? (
              <>
                Signing in…
                <div className="ml-2 h-4 w-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;





















