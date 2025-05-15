
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Phone, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import AvatarSelector from '@/components/AvatarSelector';
import PasswordField from '@/components/signup/PasswordField';
import PhoneField from '@/components/signup/PhoneField';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  
  // New state for profile picture upload
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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
      setProfilePictureUrl(objectUrl);
      
      // Auto-switch from avatar selection to custom picture
      setSelectedAvatar('');
    }
  };

  const uploadProfilePicture = async (userId: string): Promise<string | null> => {
    if (!profilePicture) return null;
    
    setUploading(true);
    try {
      // Create a unique file name
      const fileExtension = profilePicture.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExtension}`;
      
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = countryCode + phone;
      
      // First part: Sign up the user
      const userData = {
        name,
        username,
        phone: fullPhone,
        avatar: selectedAvatar // Store the selected avatar ID or empty if using custom picture
      };

      const { data, error } = await signUp(email, password, userData);
      
      if (error) throw error;
      
      // Update profile with the avatar info
      if (data?.user) {
        let avatarUrl = selectedAvatar;
        
        // If there's a custom profile picture, upload it
        if (profilePicture) {
          const uploadedUrl = await uploadProfilePicture(data.user.id);
          if (uploadedUrl) {
            avatarUrl = uploadedUrl;
          }
        }
        
        // Update the profile with the avatar information
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', data.user.id);
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Join TrashHero</CardTitle>
          <CardDescription>
            Create an account to start making an impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <PhoneField 
              phone={phone}
              setPhone={setPhone}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
            />
            
            <PasswordField 
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
            />
            
            {/* Profile Picture Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Picture</label>
              <div className="flex gap-3 items-center">
                <div className="flex-shrink-0">
                  {profilePictureUrl ? (
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={profilePictureUrl} alt="Profile Preview" />
                      <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
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
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                  {profilePictureUrl && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Custom profile picture selected
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Avatar selection - only shown if no profile picture uploaded */}
            {!profilePictureUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Or choose an avatar</label>
                <AvatarSelector
                  selectedAvatar={selectedAvatar}
                  onSelectAvatar={setSelectedAvatar}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading || uploading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm text-muted-foreground">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
