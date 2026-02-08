import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import { useClerk } from '@clerk/clerk-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const clerk = useClerk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubmitting(true);
    try {
      await clerk.client?.signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.errors?.[0]?.message || "Failed to send reset instructions. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-black p-8 sm:p-10 border border-gold/20">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-wider text-white">
            Reset your <span className="text-gold">Password</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isSubmitted 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive password reset instructions"}
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
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
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 bg-gold text-black flex items-center justify-center ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gold/90'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 p-4 text-green-300 text-sm">
              We've sent password reset instructions to your email ({email}). 
              <br /><br />
              Please check your inbox and spam folder. The reset link will expire in 24 hours.
            </div>
            <Link 
              to="/login"
              className="w-full py-3 border border-gold/20 text-gold hover:bg-gold/10 flex items-center justify-center transition-colors duration-200 ease-in-out"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Login
            </Link>
          </div>
        )}
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Remember your password?{' '}
            <Link to="/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
