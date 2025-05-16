import React, { useState } from 'react';
import { User, Mail, Phone, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase, getAvatarSrc } from '@/integrations/supabase/client';
import AvatarSelector from '@/components/AvatarSelector';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSectionProps {
  profile: {
    username: string;
    full_name: string;
    phone_number: string;
    email: string;
    avatar_url: string;
    notifications: boolean;
    locationSharing: boolean;
  };
  setProfile: React.Dispatch<React.SetStateAction<{
    username: string;
    full_name: string;
    phone_number: string;
    email: string;
    avatar_url: string;
    notifications: boolean;
    locationSharing: boolean;
  }>>;
  user: any;
  toast: any;
}

const ProfileSection = ({ profile, setProfile, user, toast }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { refreshProfile, updateProfilePicture } = useAuth();

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
    setProfilePicturePreview(null);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Profile picture must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive", 
        });
        return;
      }
      
      setProfilePicture(file);
      const objectUrl = URL.createObjectURL(file);
      setProfilePicturePreview(objectUrl);
    }
  };

  const uploadProfilePicture = async (): Promise<string | null> => {
    if (!profilePicture || !user) return null;
    
    setUploading(true);
    try {
      // Create a unique file name
      const fileExtension = profilePicture.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExtension}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(`public/${fileName}`, profilePicture, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading profile picture:', error);
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(`public/${fileName}`);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error in profile picture upload process:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!user) return;
      
      let avatarUrl = profile.avatar_url;
      
      // If there's a new profile picture, upload it
      if (profilePicture) {
        const uploadedUrl = await uploadProfilePicture();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
          // Update the profile picture in AuthContext to sync across the app
          await updateProfilePicture(user.id, uploadedUrl);
        }
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedProfile.username,
          full_name: editedProfile.full_name,
          phone_number: editedProfile.phone_number,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile({
        ...editedProfile,
        avatar_url: avatarUrl
      });
      setIsEditing(false);
      
      // Refresh profile data in the auth context
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleProfilePictureUpdate = async () => {
    try {
      if (!user) return;
      
      // If there's a new profile picture, upload it
      if (profilePicture) {
        const uploadedUrl = await uploadProfilePicture();
        if (uploadedUrl) {
          // Update profile picture across the app
          await updateProfilePicture(user.id, uploadedUrl);
          
          setProfile({
            ...profile,
            avatar_url: uploadedUrl
          });
          
          toast({
            title: "Profile picture updated",
            description: "Your profile picture has been updated successfully",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile picture",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  // Get image source - profile picture or fallback
  const getImageSource = () => {
    if (profilePicturePreview) {
      return profilePicturePreview;
    } else if (profile.avatar_url) {
      return profile.avatar_url;
    } else {
      return '/placeholder.svg';
    }
  };

  return (
    <section className="bg-card rounded-lg p-4 shadow-sm">
      <div className="flex flex-col items-center mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer mb-2">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={getImageSource()} 
                  alt="User avatar" 
                />
                <AvatarFallback>{profile.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogTitle className="text-center mb-4">Profile Picture</DialogTitle>
            
            {/* Upload custom picture */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={profilePicturePreview || profile.avatar_url} 
                    alt="Profile preview" 
                  />
                  <AvatarFallback>{profile.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </div>
              
              <AvatarSelector
                selectedAvatar=""
                onSelectAvatar={() => {}}
                onFileChange={handleProfilePictureChange}
                profilePictureUrl={profilePicturePreview || profile.avatar_url}
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  onClick={handleProfilePictureUpdate}
                  disabled={uploading || !profilePicture}
                >
                  {uploading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <h2 className="text-xl font-bold">{profile.full_name}</h2>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input 
              value={editedProfile.full_name} 
              onChange={e => setEditedProfile({...editedProfile, full_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <Input 
              value={editedProfile.username} 
              onChange={e => setEditedProfile({...editedProfile, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input 
              type="email"
              value={editedProfile.email} 
              disabled
              className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input 
              type="tel"
              value={editedProfile.phone_number} 
              onChange={e => setEditedProfile({...editedProfile, phone_number: e.target.value})}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSaveChanges}
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{profile.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{profile.phone_number}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full"
            onClick={handleStartEditing}
          >
            Edit Profile
          </Button>
        </div>
      )}
    </section>
  );
};

export default ProfileSection;
