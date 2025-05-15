
import React, { useState } from 'react';
import { User, Bell, Lock, LogOut, Mail, Moon, Sun, Globe, Shield, HelpCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

const Settings = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const [userInfo, setUserInfo] = useState({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    notifications: true,
    locationSharing: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({ ...userInfo });

  const handleToggleNotifications = () => {
    setUserInfo(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
    
    toast({
      title: userInfo.notifications ? "Notifications disabled" : "Notifications enabled",
      description: userInfo.notifications 
        ? "You won't receive push notifications from the app" 
        : "You'll now receive push notifications from the app",
    });
  };

  const handleToggleLocationSharing = () => {
    setUserInfo(prev => ({
      ...prev,
      locationSharing: !prev.locationSharing
    }));
    
    toast({
      title: userInfo.locationSharing ? "Location sharing disabled" : "Location sharing enabled",
      description: userInfo.locationSharing 
        ? "Your location will no longer be shared with the app" 
        : "Your location will be used to find nearby cleanup opportunities",
    });
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedInfo({ ...userInfo });
  };

  const handleSaveChanges = () => {
    setUserInfo(editedInfo);
    setIsEditing(false);
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSignOut = () => {
    toast({
      title: "Signed out",
      description: "You have been signed out of your account",
    });
    // In a real app, this would handle the sign out process
  };

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="Settings" showBack={true} />
      
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Profile section */}
        <section className="bg-card rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <img 
                src="https://i.pravatar.cc/150?img=5" 
                alt="User avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{userInfo.name}</h2>
              <p className="text-muted-foreground text-sm">@alexcleanup</p>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  value={editedInfo.name} 
                  onChange={e => setEditedInfo({...editedInfo, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  type="email"
                  value={editedInfo.email} 
                  onChange={e => setEditedInfo({...editedInfo, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input 
                  type="tel"
                  value={editedInfo.phone} 
                  onChange={e => setEditedInfo({...editedInfo, phone: e.target.value})}
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
                <span className="text-sm">{userInfo.email}</span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{userInfo.phone}</span>
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
        
        {/* Preferences section */}
        <section className="bg-card rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch 
                checked={userInfo.notifications} 
                onCheckedChange={handleToggleNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Location Sharing</h4>
                <p className="text-sm text-muted-foreground">Allow access to your location</p>
              </div>
              <Switch 
                checked={userInfo.locationSharing} 
                onCheckedChange={handleToggleLocationSharing}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Theme</h4>
                <p className="text-sm text-muted-foreground">Current: {theme === 'dark' ? 'Dark' : 'Light'}</p>
              </div>
              <div className="flex items-center">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Account section */}
        <section className="bg-card rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Account
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Globe className="w-4 h-4 mr-2" />
              Language Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
          </div>
        </section>
        
        {/* Sign out button */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleSignOut}
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
