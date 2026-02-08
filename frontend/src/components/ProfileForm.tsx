import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, uploadUserFile } from '../integrations/firebase/db';
import { toast } from 'sonner';

const ProfileForm = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload profile image if selected
      let imageData = null;
      if (profileImage) {
        imageData = await uploadUserFile(user.uid, profileImage, 'profile');
      }
      
      // Update user profile
      await updateUserProfile(user.uid, {
        name,
        bio,
        profileImage: imageData ? imageData.url : null,
        profileComplete: true
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
          className="mt-1 block w-full"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;