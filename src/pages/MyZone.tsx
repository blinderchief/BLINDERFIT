
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Shield, Bell, Clock, ChevronRight,
  Edit, Mail, Phone, MapPin, Calendar, Crown
} from 'lucide-react';
import { toast } from 'sonner';

const MyZone = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleUpdateProfile = () => {
    toast.success('Profile updated successfully');
  };

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
      <h1 className="text-2xl md:text-3xl font-light tracking-wider mb-12">
        My <span className="text-gold">Zone</span>
      </h1>
      
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
                  <button className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit size={20} className="text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-medium mb-2">{user.email}</h2>
                  <div className="flex items-center gap-2 text-silver">
                    <Crown size={16} className="text-gold" />
                    <span>Premium Member</span>
                  </div>
                  <p className="text-silver mt-1">Member since April 2024</p>
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  className="px-6 py-2 border border-gold text-gold hover:bg-gold hover:text-black transition-colors"
                >
                  Update Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-silver mb-2">Email</label>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <Mail size={16} className="text-silver" />
                      <span className="text-white">{user.email}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-silver mb-2">Phone Number</label>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded">
                      <Phone size={16} className="text-silver" />
                      <span className="text-white">+1 (555) 000-0000</span>
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
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-light mb-6">Account Settings</h2>
              <p className="text-silver">Manage your account preferences and settings.</p>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-light mb-6">Privacy & Security</h2>
              <p className="text-silver">Control your privacy settings and security preferences.</p>
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
