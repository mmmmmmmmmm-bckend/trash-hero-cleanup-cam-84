
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";

// We're removing the predefined avatars array completely

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelectAvatar: (avatarId: string) => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profilePictureUrl?: string | null;
}

const AvatarSelector = ({ 
  selectedAvatar, 
  onSelectAvatar,
  onFileChange,
  profilePictureUrl 
}: AvatarSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-1">Profile Picture</label>
      <div className="flex gap-3 items-center">
        <div className="flex-shrink-0">
          {profilePictureUrl ? (
            <Avatar className="w-16 h-16">
              <AvatarImage src={profilePictureUrl} alt="Profile Preview" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <label htmlFor="profile-picture" className="cursor-pointer">
            <div className="flex gap-2 items-center p-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
              <Upload size={16} />
              <span className="text-sm">Upload Profile Picture</span>
            </div>
            <Input 
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
          {profilePictureUrl && (
            <p className="text-xs text-muted-foreground mt-1">
              Profile picture selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
