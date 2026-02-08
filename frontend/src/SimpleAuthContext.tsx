import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define a simple context type
interface SimpleAuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

// Create the context
const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null);

// Create a provider component
interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  const value = {
    isLoggedIn,
    login,
    logout
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

// Create a custom hook
export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  
  if (context === null) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  
  return context;
};