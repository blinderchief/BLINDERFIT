import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';

// Define a user type compatible with what the rest of the app expects
interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Define the context type
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
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
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const clerk = useClerk();

  // Map Clerk user to our AppUser interface
  const user: AppUser | null = isSignedIn && clerkUser ? {
    uid: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
    displayName: clerkUser.fullName ?? clerkUser.firstName ?? null,
    phoneNumber: clerkUser.primaryPhoneNumber?.phoneNumber ?? null,
    photoURL: clerkUser.imageUrl ?? null,
    emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
  } : null;

  const loading = !isLoaded;

  // Login - use Clerk's programmatic sign-in
  const login = async (_email: string, _password: string, _rememberMe: boolean = false): Promise<boolean> => {
    try {
      const result = await clerk.client?.signIn.create({
        identifier: _email,
        password: _password,
      });
      
      if (result?.status === 'complete' && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Login error:", err.errors?.[0]?.message || err.message);
      return false;
    }
  };

  // Signup
  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await clerk.client?.signUp.create({
        emailAddress: email,
        password: password,
      });
      
      if (result?.status === 'complete' && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        return true;
      }
      
      if (result?.status === 'missing_requirements') {
        await result.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      
      return false;
    } catch (err: any) {
      console.error("Signup error:", err.errors?.[0]?.message || err.message);
      return false;
    }
  };

  // Register with name
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const [firstName, ...lastParts] = name.split(' ');
      const lastName = lastParts.join(' ') || undefined;
      
      const result = await clerk.client?.signUp.create({
        emailAddress: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      });
      
      if (result?.status === 'complete' && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        return true;
      }
      
      if (result?.status === 'missing_requirements') {
        await result.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      
      return false;
    } catch (err: any) {
      console.error("Registration error:", err.errors?.[0]?.message || err.message);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut();
      localStorage.removeItem('blinderfit_auth_state');
      localStorage.removeItem('blinderfit_persist_auth');
    } catch (err: any) {
      console.error("Logout error:", err.message);
      throw err;
    }
  };

  // Get auth token for API calls
  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error: null,
    login,
    signup,
    register,
    logout,
    getToken: getAuthToken,
    persistAuth: true,
    setPersistAuth: () => {},
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
