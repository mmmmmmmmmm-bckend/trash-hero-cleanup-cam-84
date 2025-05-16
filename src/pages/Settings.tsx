
import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, LogOut, Mail, Moon, Sun, Globe, Shield, HelpCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AvatarSelector from '@/components/AvatarSelector';
import ProfileSection from '@/components/settings/ProfileSection';
import PreferencesSection from '@/components/settings/PreferencesSection';
import AccountSection from '@/components/settings/AccountSection';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    phone_number: '',
    email: '',
    avatar_url: 'avatar1',
    notifications: true,
    locationSharing: true,
  });

  // Load user profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setProfile({
            username: data.username || '',
            full_name: data.full_name || '',
            phone_number: data.phone_number || '',
            email: user.email || '',
            avatar_url: data.avatar_url || 'avatar1',
            notifications: true,
            locationSharing: true,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="Settings" showBack={true} />
      
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Profile section */}
        <ProfileSection 
          profile={profile} 
          setProfile={setProfile} 
          user={user} 
          toast={toast} 
        />
        
        {/* Preferences section */}
        <PreferencesSection 
          profile={profile} 
          setProfile={setProfile} 
          theme={theme} 
          toast={toast} 
        />
        
        {/* Account section */}
        <AccountSection />
        
        {/* Sign out button */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </main>
      
      <NavBar />
    </div>
  );
};

export default Settings;
