
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2 } from 'lucide-react';

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  username?: string | null;
  onAvatarChange?: (url: string) => void;
}

const AvatarUploader = ({ 
  currentAvatarUrl, 
  username, 
  onAvatarChange 
}: AvatarUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      // Check if the file is an image
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
        throw new Error('File type not supported. Please upload an image file.');
      }

      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 2MB.');
      }

      // Upload the file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user's avatar_url in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      
      if (onAvatarChange) {
        onAvatarChange(publicUrl);
      }

      toast({
        title: "Success!",
        description: "Your avatar has been updated.",
      });
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="w-24 h-24 border-4 border-background">
        <AvatarImage 
          src={avatarUrl || ''} 
          alt={username || 'User'} 
          className="object-cover"
        />
        <AvatarFallback className="text-xl">
          {username ? username.substring(0, 2).toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      
      <label htmlFor="avatar-upload">
        <Button 
          variant="outline" 
          size="sm" 
          type="button" 
          className="cursor-pointer" 
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4 mr-2" />
              Change Avatar
            </>
          )}
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default AvatarUploader;
