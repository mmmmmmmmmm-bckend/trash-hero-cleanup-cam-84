import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Phone, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordMessage('');
      return;
    }

    let strength = 0;
    let messages = [];

    // Check for length
    if (password.length >= 8) {
      strength += 25;
    } else {
      messages.push('At least 8 characters');
    }

    // Check for uppercase
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      messages.push('At least one uppercase letter');
    }

    // Check for lowercase
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      messages.push('At least one lowercase letter');
    }

    // Check for special characters or numbers
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength += 25;
    } else {
      messages.push('At least one number or special character');
    }

    setPasswordStrength(strength);
    setPasswordMessage(messages.join(', '));
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setAvatarFile(file);
    
    // Preview the image
    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    
    try {
      setUploadingAvatar(true);
      
      // Check if storage bucket exists, create if not
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('avatars');
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        // The bucket doesn't exist, we would create it via SQL migration or let the user know
        toast({
          title: "Storage Error",
          description: "Avatar storage is not set up. Please contact support.",
          variant: "destructive",
        });
        return null;
      }
      
      // Upload the file
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, avatarFile);
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Avatar Upload Failed",
        description: error.message || "There was an error uploading your avatar.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingAvatar(false);
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

    if (passwordStrength < 75) {
      toast({
        title: "Weak password",
        description: "Please use a stronger password",
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
        phone: fullPhone
      };

      const { data, error } = await signUp(email, password, userData);
      
      if (error) throw error;
      
      // If we have an avatar and user data, upload it
      if (avatarFile && data?.user) {
        const avatarUrl = await uploadAvatar(data.user.id);
        
        // If avatar was uploaded, update the profile with the URL
        if (avatarUrl) {
          await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', data.user.id);
        }
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
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 mb-3 border-2 border-primary">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Avatar preview" />
                  ) : (
                    <AvatarFallback className="bg-primary/20">
                      <User className="w-12 h-12 text-primary/60" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="w-8 h-8" />
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                  disabled={loading || uploadingAvatar}
                />
              </div>
              <p className="text-sm text-muted-foreground">Upload profile photo</p>
            </div>

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
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="w-1/4">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="+20" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+20">🇪🇬 +20</SelectItem>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      <SelectItem value="+966">🇸🇦 +966</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <>
                  <Progress value={passwordStrength} className={`h-1 ${getStrengthColor()}`} />
                  <p className="text-xs text-muted-foreground">
                    {passwordMessage || (
                      passwordStrength < 75 
                        ? "Password strength: " + (passwordStrength <= 25 ? "Weak" : "Medium") 
                        : "Password strength: Strong"
                    )}
                  </p>
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">
                  Passwords don't match
                </p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading || uploadingAvatar}>
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
