import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { HealthDataProvider } from "./contexts/HealthDataContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import PulseHub from "./pages/PulseHub";
import HealthForm from "./pages/HealthForm";
import FitnessPlan from "./pages/FitnessPlan";
import FitLearn from "./pages/FitLearn";
import TribeVibe from "./pages/TribeVibe";
import MyZone from "./pages/MyZone";
import FitLearnContent from "./pages/FitLearnContent";
import MindShift from "./pages/MindShift";
import FitMentor from "./pages/FitMentor";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Chatbot from "./components/Chatbot";
import FirebaseTest from "./components/FirebaseTest";
import { app, analytics } from './integrations/firebase/client';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const App = () => {
  const [showSplash, setShowSplash] = useState(false); // Start with splash hidden
  const [isLoaded, setIsLoaded] = useState(false);

  // Simplified splash screen and load logic
  useEffect(() => {
    // Skip splash on development to speed up refreshes
    const isDev = import.meta.env.MODE === 'development';
    const isFirstLoad = sessionStorage.getItem('hasVisited') !== 'true';
    
    if (isDev || !isFirstLoad) {
      // Skip splash in dev mode or if not first load
      setIsLoaded(true);
    } else {
      // Show splash on first visit in production
      sessionStorage.setItem('hasVisited', 'true');
      setShowSplash(true);
      
      // Fallback timer to ensure content shows even if splash has issues
      setTimeout(() => {
        setIsLoaded(true);
      }, 1000);
    }
  }, []);

  const handleSplashFinished = () => {
    setShowSplash(false);
    setIsLoaded(true);
  };

  // Debug when loaded state changes
  useEffect(() => {
    if (isLoaded) {
      console.log('App content is loaded and ready');
    }
  }, [isLoaded]);

  useEffect(() => {
    // Initialize Firebase analytics
    if (analytics) {
      console.log('Firebase Analytics initialized');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HealthDataProvider>
          <TooltipProvider>
            {/* Only show splash screen when needed */}
            {showSplash && <SplashScreen onFinished={handleSplashFinished} />}
            
            {/* Always render content, but control opacity */}
            <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="fitlearn" element={<FitLearn />} />
                    <Route path="fitlearn-content" element={<FitLearnContent />} />
                    
                    {/* Protected routes - require authentication */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="pulsehub" element={<PulseHub />} />
                      <Route path="health-form" element={<HealthForm />} />
                      <Route path="fitness-plan" element={<FitnessPlan />} />
                      <Route path="myzone" element={<MyZone />} />
                      <Route path="mindshift" element={<MindShift />} />
                      <Route path="fitmentor" element={<FitMentor />} />
                      <Route path="tribevibe" element={<TribeVibe />} />
                      <Route path="firebase-test" element={<FirebaseTest />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="/logout" element={<Navigate to="/login" replace />} />
                </Routes>
              </BrowserRouter>
              <Chatbot />
            </div>
          </TooltipProvider>
        </HealthDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
















