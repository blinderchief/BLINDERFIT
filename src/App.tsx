import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SimpleAuthProvider } from './SimpleAuthContext';
import FitMentor from './pages/FitMentor';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import PulseHub from './pages/PulseHub';
import FitLearn from './pages/FitLearn';
import MindShift from './pages/MindShift';
import TribeVibe from './pages/TribeVibe';
import MyZone from './pages/MyZone';
import NotFound from './pages/NotFound';
import FitLearnContent from './pages/FitLearnContent';

function App() {
  return (
    <SimpleAuthProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/fitmentor" element={<Layout><FitMentor /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
            <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
            <Route path="/pulsehub" element={<Layout><PulseHub /></Layout>} />
            <Route path="/fitlearn" element={<Layout><FitLearn /></Layout>} />
            <Route path="/fitlearn/:contentId" element={<Layout><FitLearnContent /></Layout>} />
            <Route path="/mindshift" element={<Layout><MindShift /></Layout>} />
            <Route path="/tribevibe" element={<Layout><TribeVibe /></Layout>} />
            <Route path="/myzone" element={<Layout><MyZone /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Router>
      </AuthProvider>
    </SimpleAuthProvider>
  );
}

export default App;









