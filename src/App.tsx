
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

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Track if this is the initial page load
    const isFirstLoad = sessionStorage.getItem('hasVisited') !== 'true';
    
    if (!isFirstLoad) {
      setShowSplash(false);
      setIsLoaded(true);
    } else {
      // Mark that the user has visited the site
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const handleSplashFinished = () => {
    setShowSplash(false);
    setIsLoaded(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HealthDataProvider>
          <TooltipProvider>
            {showSplash && <SplashScreen onFinished={handleSplashFinished} />}
            <div className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="fitlearn" element={<FitLearn />} />
                    <Route path="fitlearn-content" element={<FitLearnContent />} />
                    <Route path="mindshift" element={<MindShift />} />
                    <Route path="fitmentor" element={<FitMentor />} />
                    <Route path="tribevibe" element={<TribeVibe />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="pulsehub" element={<PulseHub />} />
                      <Route path="health-form" element={<HealthForm />} />
                      <Route path="fitness-plan" element={<FitnessPlan />} />
                      <Route path="myzone" element={<MyZone />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="/logout" element={<Navigate to="/login" replace />} />
                </Routes>
              </BrowserRouter>
              {/* Global Chatbot */}
              <Chatbot />
            </div>
          </TooltipProvider>
        </HealthDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
