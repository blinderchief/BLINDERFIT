import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

// Define the context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  persistAuth: boolean;
  setPersistAuth: (persist: boolean) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persistAuth, setPersistAuth] = useState<boolean>(() => {
    // Check if user has opted to persist authentication previously
    const savedPersistence = localStorage.getItem('blinderfit_persist_auth');
    return savedPersistence === 'true';
  });    // Listen for auth state changes
  useEffect(() => {
    let tempUser = null;
    // Try to get cached user data during loading
    const cachedAuthState = localStorage.getItem('blinderfit_auth_state');
    if (cachedAuthState) {
      try {
        const parsed = JSON.parse(cachedAuthState);
        // Check if the cached auth state is recent (within the last hour)
        const isRecent = Date.now() - parsed.timestamp < 60 * 60 * 1000;
        if (isRecent && parsed.isAuthenticated) {
          // This doesn't fully authenticate the user but helps prevent the flash
          // of unauthenticated state during refresh
          console.log('Using cached authentication state while loading');
          // Create a temporary user object from cache to prevent UI flashing
          if (!user) {
            tempUser = {
              uid: parsed.userId,
              email: parsed.email,
              displayName: parsed.displayName,
              // Add other necessary properties
              emailVerified: true,
              isAnonymous: false,
              // These are needed to make TypeScript happy
              delete: () => Promise.resolve(),
              getIdToken: () => Promise.resolve(''),
              getIdTokenResult: () => Promise.resolve({ token: '' } as any),
              reload: () => Promise.resolve(),
              toJSON: () => ({})
            } as User;
            // Don't set in state yet, just use for temporary UI
          }
        }
      } catch (e) {
        console.error('Error parsing cached auth state:', e);
      }
    }
    
    // Use a small timeout to allow components to initialize with the cached user
    const initialTimeout = setTimeout(() => {
      // If no Firebase user has been detected yet, use the temporary user from cache
      if (loading && tempUser && !user) {
        console.log('Using temporary user from cache');
        // This helps prevent the auth required flash
        setUser(tempUser);
      }
    }, 100);
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Clear the temporary user if it exists
      clearTimeout(initialTimeout);
      
      setUser(firebaseUser);
      setLoading(false);
      
      if (firebaseUser) {
        // Extract needed user properties
        const { uid, displayName, email, phoneNumber, photoURL, emailVerified } = firebaseUser;
        
        // Update the cached auth state with fresh data
        localStorage.setItem('blinderfit_auth_state', JSON.stringify({
          isAuthenticated: true,
          userId: uid,
          displayName,
          email,
          phoneNumber,
          photoURL,
          emailVerified,
          timestamp: Date.now()
        }));
      } else if (persistAuth === false) {
        // Only clear cached auth state if user has not selected "Remember Me"
        localStorage.removeItem('blinderfit_auth_state');
      }
    });

    return () => {
      clearTimeout(initialTimeout);
      unsubscribe();
    };
  }, [persistAuth, user, loading]);

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      // Update persistence preference
      setPersistAuth(rememberMe);
      localStorage.setItem('blinderfit_persist_auth', rememberMe.toString());
      
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("Login error:", err.message);
      return false;
    }
  };

  // Signup function
  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("Signup error:", err.message);
      return false;
    }
  };
  
  // Register function (includes name)
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("Registration error:", err.message);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    register,
    logout,
    persistAuth,
    setPersistAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create the custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

