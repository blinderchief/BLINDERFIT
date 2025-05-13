import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../integrations/firebase/client';
import { Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [actionCode, setActionCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the reset token is valid on page load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');
    
    if (!oobCode) {
      setIsTokenValid(false);
      setError('Invalid or expired reset link. Please request a new password reset.');
      return;
    }
    
    setActionCode(oobCode);
    
    // Verify the password reset code
    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setIsTokenValid(true);
      })
      .catch((error) => {
        console.error('Error verifying reset code:', error);
        setIsTokenValid(false);
        setError('Invalid or expired reset link. Please request a new password reset.');
      });
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Complete password reset with Firebase
      await confirmPasswordReset(auth, actionCode, newPassword);
      
      toast.success('Password has been reset successfully');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to reset password';
      
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'Reset link has expired. Please request a new one.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Invalid reset link. Please request a new one.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
      
      setError(errorMessage);
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
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white px-4 py-2">
            {error}
          </div>
        )}

        {isTokenValid ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="sr-only">New password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="new-password"
                    name="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gold/20 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                    placeholder="New password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-white focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gold/20 bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
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
                {isSubmitting ? 'Resetting password...' : 'Reset password'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-300 text-sm">
              {error || 'Invalid or expired reset link. Please request a new password reset.'}
            </div>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full py-3 bg-gold text-black flex items-center justify-center hover:bg-gold/90"
            >
              Request new reset link
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

