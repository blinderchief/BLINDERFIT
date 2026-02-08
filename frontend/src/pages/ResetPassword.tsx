import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-black p-8 sm:p-10 border border-gold/20">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-wider text-white">
            Reset your <span className="text-gold">Password</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Password reset is handled through Clerk's secure email verification.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 text-blue-300 text-sm">
            Password reset emails are sent by our authentication provider (Clerk). 
            Please check your email and follow the instructions in the reset email.
          </div>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full py-3 bg-gold text-black flex items-center justify-center hover:bg-gold/90"
          >
            Request Password Reset
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 border border-gold/20 text-gold hover:bg-gold/10 flex items-center justify-center transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
