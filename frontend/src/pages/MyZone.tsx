import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Crown, 
  Edit, 
  Settings, 
  LogOut, 
  Shield, 
  Bell, 
  Key, 
  ChevronRight, 
  Activity,
  Heart,
  Target,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { updateUserProfile } from '@/integrations/firebase/db';

const MyZone = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    location: 'New York, USA' // Default or from user data if available
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: profileData.name,
        // Only include other fields if they've changed
        ...(profileData.phone !== user.phoneNumber && { phone: profileData.phone })
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile' + (error?.message ? `: ${error.message}` : ''));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true }); // Navigate to home page instead of login
    toast.success('Logged out successfully');
  };
  
  // Check authentication status on initial render
  useEffect(() => {
    // Try to check cached auth first
    const cachedAuthState = localStorage.getItem('blinderfit_auth_state');
    let cachedAuth = null;
    
    if (cachedAuthState) {
      try {
        cachedAuth = JSON.parse(cachedAuthState);
        const isRecent = Date.now() - cachedAuth.timestamp < 60 * 60 * 1000; // Within the last hour
        
        if (isRecent && cachedAuth.isAuthenticated) {
          console.log('Using cached authentication state in MyZone while checking auth');
          // Don't set isAuthChecking to false immediately as we still need to wait for Firebase
        }
      } catch (e) {
        console.error('Error parsing cached auth state:', e);
      }
    }

    const checkAuth = setTimeout(() => {
      // If we have both cached auth and Firebase user, or just Firebase user
      if ((cachedAuth && user) || user) {
        setIsAuthChecking(false);
        setAuthCheckDone(true);
        
        // Update profile data when user is available
        if (user) {
          setProfileData(prevData => ({
            ...prevData,
            name: user.displayName || '',
            email: user.email || '',
            phone: user.phoneNumber || ''
          }));
        }
      } 
      // If we have cached auth but no Firebase user yet (still loading)
      else if (cachedAuth && !user) {
        // Keep waiting for Firebase, but with a longer timeout
        setTimeout(() => {
          setIsAuthChecking(false);
          setAuthCheckDone(true);
        }, 2000);
      } 
      // No auth at all
      else {
        setIsAuthChecking(false);
        setAuthCheckDone(true);
      }
    }, 1000); // Give Firebase auth a moment to initialize
    
    return () => clearTimeout(checkAuth);
  }, [user]);
  
  // Store authentication status in localStorage to persist across refreshes
  useEffect(() => {
    if (user) {
      // Save auth state to localStorage
      localStorage.setItem('blinderfit_auth_state', JSON.stringify({
        isAuthenticated: true,
        userId: user.uid,
        timestamp: Date.now()
      }));
      
      // Update profile data when user changes
      setProfileData(prevData => ({
        ...prevData,
        name: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || ''
      }));
    }
  }, [user]);

  // Show loading while checking auth - prevents flash of login screen on refresh
  if (isAuthChecking) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-black">
        <div className="animate-pulse text-gold text-xl">Loading your profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="gofit-container py-20 text-center">
        <h1 className="text-2xl font-light mb-4">Account Access Required</h1>
        <p className="text-silver mb-8">Please login to access your profile settings.</p>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-gold text-black hover:bg-gold/90 transition-colors"
        >
          Login to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="gofit-container py-12 min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-2xl md:text-3xl font-light tracking-wider">
          My <span className="text-gold">Zone</span>
        </h1>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-black border border-white/10 p-6 space-y-3">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left py-3 px-4 flex items-center ${activeTab === 'profile' ? 'bg-gold/20 text-gold' : 'hover:bg-white/5'}`}
            >
              <User size={18} className="mr-3" />
              <span>Profile</span>
              {activeTab === 'profile' && <ChevronRight size={16} className="ml-auto" />}
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left py-3 px-4 flex items-center ${activeTab === 'settings' ? 'bg-gold/20 text-gold' : 'hover:bg-white/5'}`}
            >
              <Settings size={18} className="mr-3" />
              <span>Settings</span>
              {activeTab === 'settings' && <ChevronRight size={16} className="ml-auto" />}
            </button>
            
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`w-full text-left py-3 px-4 flex items-center ${activeTab === 'privacy' ? 'bg-gold/20 text-gold' : 'hover:bg-white/5'}`}
            >
              <Shield size={18} className="mr-3" />
              <span>Privacy</span>
              {activeTab === 'privacy' && <ChevronRight size={16} className="ml-auto" />}
            </button>
            
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left py-3 px-4 flex items-center ${activeTab === 'notifications' ? 'bg-gold/20 text-gold' : 'hover:bg-white/5'}`}
            >
              <Bell size={18} className="mr-3" />
              <span>Notifications</span>
              {activeTab === 'notifications' && <ChevronRight size={16} className="ml-auto" />}
            </button>
            
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full text-left py-3 px-4 flex items-center ${activeTab === 'history' ? 'bg-gold/20 text-gold' : 'hover:bg-white/5'}`}
            >
              <Clock size={18} className="mr-3" />
              <span>History</span>
              {activeTab === 'history' && <ChevronRight size={16} className="ml-auto" />}
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 bg-black border border-white/10 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-white/10">
                <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center relative group">
                  <User size={40} className="text-gold" />
                  <button 
                    className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit size={20} className="text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-medium mb-2">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={profileData.name} 
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="bg-black border border-white/20 text-white px-2 py-1 w-full"
                      />
                    ) : (
                      profileData.name || 'Your Name'
                    )}
                  </h2>
                  <div className="flex items-center gap-2 text-silver">
                    <Crown size={16} className="text-gold" />
                    <span>Premium Member</span>
                  </div>
                  <p className="text-silver mt-1">Member since April 2024</p>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={isSaving}
                      className="px-6 py-2 bg-gold text-black hover:bg-gold/90 transition-colors"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-white/20 text-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 border border-gold text-gold hover:bg-gold hover:text-black transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-silver mb-2">Email</label>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <Mail size={16} className="text-silver" />
                      <span className="text-white">{user?.email}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-silver mb-2">Phone Number</label>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <Phone size={16} className="text-silver" />
                      {isEditing ? (
                        <input 
                          type="tel" 
                          value={profileData.phone} 
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="bg-transparent border-none text-white w-full focus:outline-none"
                          placeholder="+1 (555) 000-0000"
                        />
                      ) : (
                        <span className="text-white">{profileData.phone || '+1 (555) 000-0000'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-silver mb-2">Location</label>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <MapPin size={16} className="text-silver" />
                      <span className="text-white">New York, USA</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-silver mb-2">Join Date</label>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <Calendar size={16} className="text-silver" />
                      <span className="text-white">April 16, 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-xl font-light mb-6">Fitness Stats Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-md">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity size={20} className="text-gold" />
                      <h4 className="text-white">Activity Score</h4>
                    </div>
                    <p className="text-3xl font-light text-gold">87<span className="text-sm text-silver">/100</span></p>
                    <p className="text-xs text-silver mt-2">+12% from last month</p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-md">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart size={20} className="text-gold" />
                      <h4 className="text-white">Heart Health</h4>
                    </div>
                    <p className="text-3xl font-light text-gold">Excellent</p>
                    <p className="text-xs text-silver mt-2">Based on your latest metrics</p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-md">
                    <div className="flex items-center gap-3 mb-3">
                      <Target size={20} className="text-gold" />
                      <h4 className="text-white">Goals Progress</h4>
                    </div>
                    <p className="text-3xl font-light text-gold">68<span className="text-sm text-silver">%</span></p>
                    <p className="text-xs text-silver mt-2">3 of 5 goals on track</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-2xl font-light mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-medium mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Dark Mode</p>
                        <p className="text-sm text-silver">Toggle between light and dark themes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Compact View</p>
                        <p className="text-sm text-silver">Reduce spacing for more content</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-medium mb-4">Language & Region</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-silver mb-2">Language</label>
                      <select className="w-full bg-black border border-white/10 text-white p-2.5 rounded focus:border-gold focus:ring-1 focus:ring-gold">
                        <option value="en" className="bg-black text-white">English</option>
                        <option value="es" className="bg-black text-white">Spanish</option>
                        <option value="fr" className="bg-black text-white">French</option>
                        <option value="de" className="bg-black text-white">German</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-silver mb-2">Time Zone</label>
                      <select className="w-full bg-black border border-white/10 text-white p-2.5 rounded focus:border-gold focus:ring-1 focus:ring-gold">
                        <option value="est" className="bg-black text-white">Eastern Time (ET)</option>
                        <option value="cst" className="bg-black text-white">Central Time (CT)</option>
                        <option value="mst" className="bg-black text-white">Mountain Time (MT)</option>
                        <option value="pst" className="bg-black text-white">Pacific Time (PT)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Subscription</h3>
                  <div className="bg-gold/10 p-4 rounded-md border border-gold/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Crown size={18} className="text-gold" />
                        <h4 className="text-white font-medium">Premium Plan</h4>
                      </div>
                      <span className="text-gold text-sm">Active</span>
                    </div>
                    <p className="text-sm text-silver mb-4">Your subscription renews on May 16, 2024</p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-gold text-black text-sm hover:bg-gold/90 transition-colors">
                        Manage Plan
                      </button>
                      <button className="px-4 py-2 border border-white/20 text-white text-sm hover:bg-white/5 transition-colors">
                        View Benefits
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-2xl font-light mb-6">Privacy & Security</h2>
              
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-medium mb-4">Password Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-silver mb-2">Current Password</label>
                      <input type="password" className="w-full bg-white/5 border border-white/10 text-white p-2.5 rounded" placeholder="••••••••" />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-silver mb-2">New Password</label>
                      <input type="password" className="w-full bg-white/5 border border-white/10 text-white p-2.5 rounded" placeholder="••••••••" />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-silver mb-2">Confirm New Password</label>
                      <input type="password" className="w-full bg-white/5 border border-white/10 text-white p-2.5 rounded" placeholder="••••••••" />
                    </div>
                    
                    <button className="px-4 py-2 bg-gold text-black text-sm hover:bg-gold/90 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
                
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white">Enable 2FA</p>
                      <p className="text-sm text-silver">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>
                  <button className="px-4 py-2 border border-white/20 text-white text-sm hover:bg-white/5 transition-colors">
                    Setup Two-Factor Authentication
                  </button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Data Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Share Fitness Data with Trainers</p>
                        <p className="text-sm text-silver">Allow your trainers to view your fitness metrics</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-light mb-6">Notification Preferences</h2>
              <p className="text-silver">Manage your notification settings and alerts.</p>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-light mb-6">Account Activity</h2>
              <p className="text-silver">View your recent account activity and history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyZone;






