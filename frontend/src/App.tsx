import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import { setTokenGetter } from './services/api';
import { AdminRoute } from './components/ProtectedRoute';
import FitMentor from './pages/FitMentor';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import PulseHub from './pages/PulseHub';
import HealthForm from './pages/HealthForm';
import AssessmentGoals from './pages/AssessmentGoals';
import FitLearn from './pages/FitLearn';
import MindShift from './pages/MindShift';
import TribeVibe from './pages/TribeVibe';
import MyZone from './pages/MyZone';
import NotFound from './pages/NotFound';
import FitLearnContent from './pages/FitLearnContent';
import FitnessPlan from './pages/FitnessPlan';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Legal from './pages/Legal';
import CookiePolicy from './pages/CookiePolicy';
import Accessibility from './pages/Accessibility';
import Contact from './pages/Contact';
import Careers from './pages/Careers';

// Bridge component to connect Clerk auth token to API service
const TokenBridge = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <TokenBridge>
        <HealthDataProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/register" element={<Layout><Register /></Layout>} />
              <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
              <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
              <Route path="/legal" element={<Layout><Legal /></Layout>} />
              <Route path="/cookie-policy" element={<Layout><CookiePolicy /></Layout>} />
              <Route path="/accessibility" element={<Layout><Accessibility /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/careers" element={<Layout><Careers /></Layout>} />

              {/* Admin-only routes — only suyashsingh.raebareli@gmail.com */}
              <Route element={<AdminRoute />}>
                <Route path="/fitmentor" element={<Layout><FitMentor /></Layout>} />
                <Route path="/pulsehub" element={<Layout><PulseHub /></Layout>} />
                <Route path="/health-form" element={<Layout><HealthForm /></Layout>} />
                <Route path="/assessment-goals" element={<Layout><AssessmentGoals /></Layout>} />
                <Route path="/fitness-plan" element={<Layout><FitnessPlan /></Layout>} />
                <Route path="/tracking" element={<Layout><Tracking /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/fitlearn" element={<Layout><FitLearn /></Layout>} />
                <Route path="/fitlearn/:contentId" element={<Layout><FitLearnContent /></Layout>} />
                <Route path="/mindshift" element={<Layout><MindShift /></Layout>} />
                <Route path="/tribevibe" element={<Layout><TribeVibe /></Layout>} />
                <Route path="/myzone" element={<Layout><MyZone /></Layout>} />
              </Route>

              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </Router>
        </HealthDataProvider>
      </TokenBridge>
    </AuthProvider>
  );
}

export default App;
