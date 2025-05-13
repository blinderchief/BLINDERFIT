
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../integrations/firebase/client';

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileComplete: boolean;
}

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
  const [phoneAuthAvailable, setPhoneAuthAvailable] = useState(true);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // Initialize auth state from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || userData.name || 'User',
              email: firebaseUser.email || userData.email || '',
              phone: firebaseUser.phoneNumber || userData.phone || '',
              profileComplete: userData.profileComplete || false
            });
          } else {
            // If user document doesn't exist, create one with basic info
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              profileComplete: false
            });
            
            // Create user document in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              profileComplete: false,
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          // Fallback to basic Firebase user info
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            profileComplete: false
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Firebase email/password login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Firebase phone login
  const loginWithPhone = async (phone: string, verificationCode: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!verificationId) {
        toast.error('Please request a verification code first');
        return false;
      }
      
      // Create credential with verification ID and code
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      
      toast.success('Login successful');
      return true;
    } catch (error: any) {
      console.error('Phone login error:', error);
      let errorMessage = 'Phone login failed';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Firebase email/password registration
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        profileComplete: false,
        createdAt: serverTimestamp()
      });
      
      toast.success('Registration successful. Please verify your email.');
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Firebase phone registration
  const registerWithPhone = async (name: string, phone: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Request phone verification first
      const success = await requestPhoneVerification(phone);
      
      if (success) {
        // Store name to use when verification is complete
        localStorage.setItem('pendingUserName', name);
        toast.success('Verification code sent to your phone');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Phone registration error:', error);
      toast.error(error.message || 'Phone registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Firebase phone verification request
  const requestPhoneVerification = async (phone: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Create a reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      
      // Request verification code
      const provider = new PhoneAuthProvider(auth);
      const verificationIdResult = await provider.verifyPhoneNumber(phone, recaptchaVerifier);
      
      // Store verification ID
      setVerificationId(verificationIdResult);
      
      toast.success('Verification code sent to your phone');
      return true;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      let errorMessage = 'Failed to send verification code';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Firebase logout
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Force reconnect function
  const forceReconnect = async (): Promise<boolean> => {
    // No need to reconnect with Firebase, it handles this automatically
    toast.success('Authentication system reconnected');
    return true;
  };

  // Firebase password reset
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      await sendPasswordResetEmail(auth, email);
      
      toast.success('Password reset instructions sent to your email');
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset instructions';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      toast.error(errorMessage);
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

  return (
    <AuthContext.Provider value={value}>
      {/* Invisible reCAPTCHA container for phone auth */}
      <div id="recaptcha-container"></div>
      {children}
    </AuthContext.Provider>
  );
};




























