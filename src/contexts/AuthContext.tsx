
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

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
  logout: () => void;
  loading: boolean;
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

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('gofit_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data (in real app, this would come from backend)
      // In this demo, we'll accept any login with email containing "@" and password length >= 6
      if (email.includes('@') && password.length >= 6) {
        const userData: User = {
          id: '1',
          name: email.split('@')[0],
          email: email,
          profileComplete: true
        };
        setUser(userData);
        localStorage.setItem('gofit_user', JSON.stringify(userData));
        toast.success('Login successful');
        return true;
      } else {
        toast.error('Invalid credentials');
        return false;
      }
    } catch (error) {
      toast.error('Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mock phone login function
  const loginWithPhone = async (phone: string, verificationCode: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification - in a real app, this would verify the code with a service
      // For demo, accept any 6-digit code
      if (phone.length >= 10 && verificationCode.length === 6) {
        const userData: User = {
          id: '1',
          name: `User_${phone.slice(-4)}`,
          email: '',
          phone: phone,
          profileComplete: true
        };
        setUser(userData);
        localStorage.setItem('gofit_user', JSON.stringify(userData));
        toast.success('Phone login successful');
        return true;
      } else {
        toast.error('Invalid verification code');
        return false;
      }
    } catch (error) {
      toast.error('Phone login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Request phone verification code
  const requestPhoneVerification = async (phone: string): Promise<boolean> => {
    try {
      // Simulate sending an SMS with verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (phone.length >= 10) {
        toast.success('Verification code sent to your phone');
        return true;
      } else {
        toast.error('Invalid phone number');
        return false;
      }
    } catch (error) {
      toast.error('Failed to send verification code');
      return false;
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In this demo, we'll accept any registration with valid email and password length >= 6
      if (email.includes('@') && password.length >= 6) {
        const userData: User = {
          id: (Math.random() * 1000).toFixed(0),
          name: name,
          email: email,
          profileComplete: false
        };
        setUser(userData);
        localStorage.setItem('gofit_user', JSON.stringify(userData));
        toast.success('Registration successful');
        return true;
      } else {
        toast.error('Invalid credentials');
        return false;
      }
    } catch (error) {
      toast.error('Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mock phone registration
  const registerWithPhone = async (name: string, phone: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (name && phone.length >= 10) {
        const userData: User = {
          id: (Math.random() * 1000).toFixed(0),
          name: name,
          email: '',
          phone: phone,
          profileComplete: false
        };
        setUser(userData);
        localStorage.setItem('gofit_user', JSON.stringify(userData));
        toast.success('Phone registration successful');
        return true;
      } else {
        toast.error('Invalid information provided');
        return false;
      }
    } catch (error) {
      toast.error('Phone registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('gofit_user');
    toast.success('Logged out');
  };

  const value = {
    user,
    login,
    loginWithPhone,
    register,
    registerWithPhone,
    requestPhoneVerification,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
