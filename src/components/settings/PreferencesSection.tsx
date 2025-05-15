
import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface PreferencesSectionProps {
  profile: {
    notifications: boolean;
    locationSharing: boolean;
  };
  setProfile: React.Dispatch<React.SetStateAction<any>>;
  theme: string;
  toast: any;
}

const PreferencesSection = ({ profile, setProfile, theme, toast }: PreferencesSectionProps) => {
  const handleToggleNotifications = () => {
    setProfile(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
    
    toast({
      title: profile.notifications ? "Notifications disabled" : "Notifications enabled",
      description: profile.notifications 
        ? "You won't receive push notifications from the app" 
        : "You'll now receive push notifications from the app",
    });
  };

  const handleToggleLocationSharing = () => {
    setProfile(prev => ({
      ...prev,
      locationSharing: !prev.locationSharing
    }));
    
    toast({
      title: profile.locationSharing ? "Location sharing disabled" : "Location sharing enabled",
      description: profile.locationSharing 
        ? "Your location will no longer be shared with the app" 
        : "Your location will be used to find nearby cleanup opportunities",
    });
  };
  
  return (
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
            checked={profile.notifications} 
            onCheckedChange={handleToggleNotifications}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Location Sharing</h4>
            <p className="text-sm text-muted-foreground">Allow access to your location</p>
          </div>
          <Switch 
            checked={profile.locationSharing} 
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
  );
};

export default PreferencesSection;
