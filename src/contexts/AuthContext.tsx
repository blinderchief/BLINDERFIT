
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase, checkSupabaseConnection, isPhoneAuthAvailable } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileComplete: boolean;
}

// Define context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithPhone: (phone: string, verificationCode: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  registerWithPhone: (name: string, phone: string) => Promise<boolean>;
  requestPhoneVerification: (phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  phoneAuthAvailable: boolean;
  forceReconnect: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [phoneAuthAvailable, setPhoneAuthAvailable] = useState(true);

  // Check Supabase connection
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionChecked(true);
      
      if (!isConnected) {
        console.error('Unable to connect to Supabase');
        toast.error('Database connection failed. Some features may not work properly.');
      } else {
        // Check if phone auth is available
        const phoneAuthEnabled = await isPhoneAuthAvailable();
        setPhoneAuthAvailable(phoneAuthEnabled);
        
        if (!phoneAuthEnabled) {
          console.warn('Phone authentication is not available');
          // We don't show a toast here to avoid confusing users who don't need phone auth
        }
      }
    };
    
    checkConnection();
  }, []);

  // Initialize auth state from Supabase
  useEffect(() => {
    if (!connectionChecked) return;
    
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setLoading(false);
          return;
        }
        
        setSession(currentSession);
        
        if (currentSession) {
          // Get user profile from database
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('auth_id', currentSession.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }
          
          if (profileData) {
            const userData: User = {
              id: currentSession.user.id,
              name: profileData.name || 'User',
              email: profileData.email || currentSession.user.email || '',
              phone: profileData.phone || currentSession.user.phone || '',
              profileComplete: !!profileData.profileComplete
            };
            setUser(userData);
            localStorage.setItem('gofit_user', JSON.stringify(userData));
          } else {
            // If no profile exists but user is authenticated, create minimal user object
            const userData: User = {
              id: currentSession.user.id,
              name: currentSession.user.email ? currentSession.user.email.split('@')[0] : 'User',
              email: currentSession.user.email || '',
              phone: currentSession.user.phone || '',
              profileComplete: false
            };
            setUser(userData);
            localStorage.setItem('gofit_user', JSON.stringify(userData));
            
            // Try to create a profile for this user
            try {
              await supabase.from('user_profiles').insert([
                {
                  auth_id: currentSession.user.id,
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  created_at: new Date().toISOString(),
                  profileComplete: false
                }
              ]);
            } catch (error) {
              console.error('Error creating profile for existing user:', error);
            }
          }
        } else {
          // Check if user is stored in localStorage as fallback
          const storedUser = localStorage.getItem('gofit_user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.error('Error parsing stored user:', e);
              localStorage.removeItem('gofit_user');
            }
          }
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event);
            setSession(newSession);
            
            if (event === 'SIGNED_IN' && newSession) {
              // Get user profile from database
              const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('auth_id', newSession.user.id)
                .single();
              
              if (profileError && profileError.code !== 'PGRST116') {
                console.error('Error fetching profile on auth change:', profileError);
              }
              
              if (profileData) {
                const userData: User = {
                  id: newSession.user.id,
                  name: profileData.name || 'User',
                  email: profileData.email || newSession.user.email || '',
                  phone: profileData.phone || newSession.user.phone || '',
                  profileComplete: !!profileData.profileComplete
                };
                setUser(userData);
                localStorage.setItem('gofit_user', JSON.stringify(userData));
              } else {
                // If no profile exists but user is authenticated, create minimal user object
                const userData: User = {
                  id: newSession.user.id,
                  name: newSession.user.email ? newSession.user.email.split('@')[0] : 'User',
                  email: newSession.user.email || '',
                  phone: newSession.user.phone || '',
                  profileComplete: false
                };
                setUser(userData);
                localStorage.setItem('gofit_user', JSON.stringify(userData));
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              localStorage.removeItem('gofit_user');
            }
          }
        );
        
        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [connectionChecked]);

  // Email/password login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (!data.user) {
        toast.error('Login failed');
        return false;
      }
      
      toast.success('Login successful');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Phone login
  const loginWithPhone = async (phone: string, verificationCode: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Format phone number with India (+91) as default
      let formattedPhone = phone;
      
      if (!phone.startsWith('+')) {
        const cleanPhone = phone.replace(/^0+/, '');
        
        if (cleanPhone.startsWith('91') && cleanPhone.length >= 12) {
          formattedPhone = '+' + cleanPhone;
        } else {
          formattedPhone = '+91' + cleanPhone;
        }
      }
      
      // Verify the phone number with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: 'sms'
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (!data.user) {
        toast.error('Authentication failed');
        return false;
      }
      
      toast.success('Phone login successful');
      return true;
    } catch (error: any) {
      console.error('Phone login error:', error);
      toast.error(error.message || 'Phone login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Request phone verification
  const requestPhoneVerification = async (phone: string): Promise<boolean> => {
    try {
      if (!phone) {
        toast.error('Please enter a phone number');
        return false;
      }
      
      // Format phone number with India (+91) as default if no country code
      let formattedPhone = phone;
      
      // If it doesn't start with +, add the India country code
      if (!phone.startsWith('+')) {
        // Remove any leading zeros
        const cleanPhone = phone.replace(/^0+/, '');
        
        // If it already has 91 prefix, add just the +
        if (cleanPhone.startsWith('91') && cleanPhone.length >= 12) {
          formattedPhone = '+' + cleanPhone;
        } else {
          // Otherwise add +91
          formattedPhone = '+91' + cleanPhone;
        }
      }
      
      // Validate phone number format (basic validation)
      const phoneRegex = /^\+[1-9]\d{6,14}$/;
      if (!phoneRegex.test(formattedPhone)) {
        toast.error('Invalid phone number format. Please include country code.');
        return false;
      }
      
      console.log('Requesting OTP for phone:', formattedPhone);
      
      try {
        // Send OTP via Supabase
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone
        });
        
        if (error) {
          console.error('OTP request error:', error);
          
          // Handle specific error for unsupported phone provider
          if (error.message.includes('unsupported phone provider')) {
            toast.error('Phone authentication is not available. Please use email login instead.');
            // You might want to redirect to email login tab here
            return false;
          }
          
          toast.error(error.message);
          return false;
        }
        
        toast.success('Verification code sent to your phone');
        return true;
      } catch (innerError: any) {
        console.error('Inner OTP request error:', innerError);
        
        // Check for unsupported phone provider error
        if (innerError.message && innerError.message.includes('unsupported phone provider')) {
          toast.error('Phone authentication is not available. Please use email login instead.');
          return false;
        }
        
        throw innerError; // Re-throw for outer catch
      }
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast.error(error.message || 'Failed to send verification code');
      return false;
    }
  };

  // Email/password registration
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        return false;
      }
      
      if (!data.user) {
        toast.error('Registration failed');
        return false;
      }
      
      toast.success('Registration successful! Please check your email for verification.');
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Phone registration
  const registerWithPhone = async (name: string, phone: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Format phone number with India (+91) as default
      let formattedPhone = phone;
      
      if (!phone.startsWith('+')) {
        const cleanPhone = phone.replace(/^0+/, '');
        
        if (cleanPhone.startsWith('91') && cleanPhone.length >= 12) {
          formattedPhone = '+' + cleanPhone;
        } else {
          formattedPhone = '+91' + cleanPhone;
        }
      }
      
      // Check if user already exists with this phone
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('phone', formattedPhone)
        .single();
      
      if (existingUser) {
        toast.error('An account with this phone number already exists');
        return false;
      }
      
      // Get current session (should be set after OTP verification)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession || !currentSession.user) {
        toast.error('Please verify your phone number first');
        return false;
      }
      
      // Create user profile in database
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert([
          {
            auth_id: currentSession.user.id,
            name,
            phone: formattedPhone,
            created_at: new Date().toISOString(),
            profileComplete: false
          }
        ]);
      
      if (createError) {
        toast.error(createError.message);
        return false;
      }
      
      toast.success('Phone registration successful');
      return true;
    } catch (error: any) {
      console.error('Phone registration error:', error);
      toast.error(error.message || 'Phone registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error(error.message);
      } else {
        setUser(null);
        localStorage.removeItem('gofit_user');
        toast.success('Logged out successfully');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Add a function to force reconnect to Supabase
  const forceReconnect = async (): Promise<boolean> => {
    try {
      console.log('Forcing reconnection to Supabase...');
      
      // Clear any existing sessions
      await supabase.auth.signOut();
      
      // Check connection
      const isConnected = await checkSupabaseConnection();
      
      if (!isConnected) {
        toast.error('Failed to reconnect to Supabase');
        return false;
      }
      
      // Check if phone auth is available
      const phoneAuthEnabled = await isPhoneAuthAvailable();
      setPhoneAuthAvailable(phoneAuthEnabled);
      
      toast.success('Successfully reconnected to Supabase');
      return true;
    } catch (error: any) {
      console.error('Reconnection error:', error);
      toast.error(error.message || 'Failed to reconnect');
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Use the allowed redirect URL from Supabase settings
      const redirectUrl = "https://blinderfit.vercel.app/reset-password";
      console.log('Reset password redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        toast.error(error.message || 'Failed to send reset instructions');
        return false;
      }
      
      toast.success('Password reset instructions sent to your email');
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset instructions');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    loginWithPhone,
    register,
    registerWithPhone,
    requestPhoneVerification,
    logout,
    loading,
    phoneAuthAvailable,
    forceReconnect,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



















