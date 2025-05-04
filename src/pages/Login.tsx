
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import PhoneInput from '@/components/PhoneInput';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const { login, loginWithPhone, requestPhoneVerification, phoneAuthAvailable, forceReconnect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/pulsehub";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await login(email, password);
    
    if (success) {
      navigate(from, { replace: true });
    }
    
    setIsSubmitting(false);
  };

  const validatePhone = (phoneNumber: string) => {
    // If empty, return false
    if (!phoneNumber) return false;
    
    // If it has a + sign, use international format validation
    if (phoneNumber.startsWith('+')) {
      // International format: +[country code][number]
      const phoneRegex = /^\+[1-9]\d{6,14}$/;
      return phoneRegex.test(phoneNumber);
    } else {
      // For Indian numbers without country code, should be 10 digits
      const indianPhoneRegex = /^[6-9]\d{9}$/;
      return indianPhoneRegex.test(phoneNumber);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    
    if (!phone) {
      setPhoneError("Please enter your phone number");
      return;
    }
    
    if (!validatePhone(phone)) {
      setPhoneError("Please enter a valid Indian phone number (10 digits)");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await requestPhoneVerification(phone);
      
      if (success) {
        setCodeRequested(true);
        toast.success("Verification code sent to your phone");
      } else {
        // Check if we got the unsupported provider error
        // This is a bit of a hack since we can't directly access the error type
        // We're checking if the phone auth is still available after the request
        const testPhoneAuth = async () => {
          try {
            // Try a test request with a valid phone number format
            const { error } = await supabase.auth.signInWithOtp({
              phone: "+919999999999" // Test number
            });
            
            if (error && error.message.includes('unsupported phone provider')) {
              // Can't directly modify phoneAuthAvailable as it's a constant
              // We'll need to rely on the forceReconnect function to update it
              await forceReconnect();
              // Switch to email tab
              (document.querySelector('[data-state="inactive"][value="email"]') as HTMLElement)?.click();
            }
          } catch (err) {
            console.error("Phone auth test failed:", err);
          }
        };
        
        testPhoneAuth();
      }
    } catch (error: any) {
      console.error("Phone verification request error:", error);
      if (error.message && error.message.includes('unsupported phone provider')) {
        // Can't directly modify phoneAuthAvailable as it's a constant
        // We'll need to rely on the forceReconnect function to update it
        await forceReconnect();
        // Switch to email tab
        (document.querySelector('[data-state="inactive"][value="email"]') as HTMLElement)?.click();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !verificationCode) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await loginWithPhone(phone, verificationCode);
    
    if (success) {
      navigate(from, { replace: true });
    }
    
    setIsSubmitting(false);
  };

  const handleOTPChange = (value: string) => {
    setVerificationCode(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (phoneError) setPhoneError('');
  };

  const handleReconnect = async () => {
    setIsSubmitting(true);
    await forceReconnect();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-black p-8 sm:p-10 border border-gold/20">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-wider text-white">
            Sign In to <span className="text-gold">BLINDERFIT</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your credentials to access your account
          </p>
        </div>
        
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            disabled={isSubmitting}
            className="text-xs border-gold/20 hover:bg-gold/10 text-gold"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        </div>

        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-gold/20">
            <TabsTrigger value="email" className="data-[state=active]:bg-gold data-[state=active]:text-black">Email</TabsTrigger>
            <TabsTrigger 
              value="phone" 
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
              disabled={!phoneAuthAvailable}
            >
              Phone {!phoneAuthAvailable && '(Unavailable)'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
              <div className="space-y-4">
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
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
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
                        className="text-gray-400 hover:text-gold"
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
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 bg-gold text-black flex items-center justify-center ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gold/90'
                  }`}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="phone">
            {!codeRequested ? (
              <form className="mt-8 space-y-6" onSubmit={handleRequestCode}>
                <div>
                  <label htmlFor="phone" className="sr-only">Phone number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${phoneError ? 'border-red-500' : 'border-gold/20'} bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-gold/50 focus:border-transparent`}
                      placeholder="Phone number (e.g. +1234567890)"
                    />
                  </div>
                  {phoneError && <p className="mt-1 text-sm text-red-500">{phoneError}</p>}
                  <p className="mt-2 text-xs text-gray-400">Enter your phone number with country code (e.g. +1 for US)</p>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 bg-gold text-black flex items-center justify-center ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gold/90'
                    }`}
                  >
                    {isSubmitting ? 'Sending code...' : 'Request verification code'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handlePhoneLogin}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone-display" className="sr-only">Phone number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone-display"
                        type="tel"
                        value={phone}
                        disabled
                        className="block w-full pl-10 pr-3 py-3 border border-gold/20 bg-black/60 text-gray-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Verification Code</label>
                    <InputOTP maxLength={6} value={verificationCode} onChange={handleOTPChange}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="mt-2 text-xs text-gray-400">Enter the 6-digit code sent to your phone</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setCodeRequested(false)}
                    className="py-3 px-4 border border-gold text-gold bg-transparent flex items-center justify-center hover:bg-gold/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || verificationCode.length < 6}
                    className={`flex-1 py-3 bg-gold text-black flex items-center justify-center ${
                      isSubmitting || verificationCode.length < 6 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gold/90'
                    }`}
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify & Sign in'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;












