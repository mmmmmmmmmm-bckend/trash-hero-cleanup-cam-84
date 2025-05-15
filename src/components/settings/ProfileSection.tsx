
import React, { useState } from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import AvatarSelector, { avatars } from '@/components/AvatarSelector';

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
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar_url);

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
    setSelectedAvatar(profile.avatar_url);
  };

  const handleSaveChanges = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedProfile.username,
          full_name: editedProfile.full_name,
          phone_number: editedProfile.phone_number,
          avatar_url: selectedAvatar,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile({
        ...editedProfile,
        avatar_url: selectedAvatar
      });
      setIsEditing(false);
      
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedAvatar(profile.avatar_url);
  };

  return (
    <section className="bg-card rounded-lg p-4 shadow-sm">
      <div className="flex flex-col items-center mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer mb-2">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <img 
                  src={avatars.find(a => a.id === profile.avatar_url)?.src || '/placeholder.svg'} 
                  alt="User avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogTitle className="text-center mb-4">Choose Your Avatar</DialogTitle>
            <AvatarSelector 
              selectedAvatar={selectedAvatar} 
              onSelectAvatar={(avatarId) => setSelectedAvatar(avatarId)} 
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                onClick={() => {
                  handleSaveChanges();
                }}
                disabled={selectedAvatar === profile.avatar_url}
              >
                Save Avatar
              </Button>
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
              className="bg-gray-100"
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
          <div>
            <AvatarSelector 
              selectedAvatar={selectedAvatar}
              onSelectAvatar={setSelectedAvatar}
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
            >
              Save Changes
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
