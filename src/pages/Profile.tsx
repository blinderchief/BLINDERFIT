
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }
    
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock update (would connect to backend in real app)
    toast.success('Profile updated successfully');
    setSaving(false);
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock update (would connect to backend in real app)
    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaving(false);
  };
  
  const handleDeleteAccount = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock deletion (would connect to backend in real app)
    toast.success('Account deleted');
    logout();
    navigate('/');
  };
  
  const handleClearData = async () => {
    setSaving(true);
    
    // Simulate clearing the data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear localStorage items related to health and fitness data
    localStorage.removeItem(`gofit_health_data_${user?.id}`);
    localStorage.removeItem(`gofit_fitness_plan_${user?.id}`);
    localStorage.removeItem(`gofit_educational_content_${user?.id}`);
    
    toast.success('Health data and generated plans cleared');
    setSaving(false);
    
    // Redirect to health form
    navigate('/health-form');
  };
  
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center">
        <div className="text-gofit-offwhite">Please login to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-96px)] py-12">
      <div className="gofit-container">
        <h1 className="text-3xl md:text-4xl font-light tracking-wider text-gofit-offwhite mb-10">
          Account <span className="text-gofit-gold">Settings</span>
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {/* Profile Information */}
            <div className="bg-gofit-charcoal p-6 mb-10 border border-gofit-charcoal/50">
              <h2 className="text-xl font-light text-gofit-offwhite mb-6 flex items-center">
                <User className="mr-2 h-5 w-5 text-gofit-gold" /> Profile Information
              </h2>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gofit-silver mb-2">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full py-3 px-4 bg-gofit-black border border-gofit-charcoal/50 text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gofit-silver mb-2">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-3 px-4 bg-gofit-black border border-gofit-charcoal/50 text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`gofit-button ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Change Password */}
            <div className="bg-gofit-charcoal p-6 mb-10 border border-gofit-charcoal/50">
              <h2 className="text-xl font-light text-gofit-offwhite mb-6 flex items-center">
                <Lock className="mr-2 h-5 w-5 text-gofit-gold" /> Change Password
              </h2>
              
              <form onSubmit={handleChangePassword}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-gofit-silver mb-2">Current Password</label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full py-3 px-4 bg-gofit-black border border-gofit-charcoal/50 text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-gofit-silver mb-2">New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full py-3 px-4 bg-gofit-black border border-gofit-charcoal/50 text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-gofit-silver mb-2">Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full py-3 px-4 bg-gofit-black border border-gofit-charcoal/50 text-gofit-offwhite focus:ring-2 focus:ring-gofit-gold/50 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`gofit-button ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Data Management */}
            <div className="bg-gofit-charcoal p-6 border border-gofit-charcoal/50">
              <h2 className="text-xl font-light text-gofit-offwhite mb-6 flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-gofit-gold" /> Data Management
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-light text-gofit-offwhite mb-2">Reset Health Data</h3>
                  <p className="text-gofit-silver mb-4">
                    Clear your existing health data and fitness plans to start fresh.
                  </p>
                  <button
                    onClick={handleClearData}
                    disabled={saving}
                    className={`gofit-button-outline ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saving ? 'Clearing...' : 'Clear Health Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="lg:col-span-1">
            <div className="bg-gofit-charcoal p-6 border border-red-800/30">
              <h2 className="text-xl font-light text-gofit-offwhite mb-6 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> Danger Zone
              </h2>
              
              <div>
                <h3 className="text-lg font-light text-gofit-offwhite mb-2">Delete Account</h3>
                <p className="text-gofit-silver mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-700 text-white hover:bg-red-800 transition-colors"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="bg-red-900/20 border border-red-500/20 p-4 space-y-4">
                    <p className="text-red-300 text-sm">
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-700 text-white hover:bg-red-800 transition-colors"
                      >
                        Yes, Delete Account
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-gofit-black text-gofit-offwhite border border-gofit-charcoal/50 hover:border-gofit-silver/30"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
