
import React, { useEffect, useState } from 'react';
import { User, Award, Star, Clock, MapPin, Trash, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '../components/NavBar';
import PointsBadge from '../components/PointsBadge';
import Header from '../components/Header';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AvatarSelector, { avatars } from '@/components/AvatarSelector';

const Profile = () => {
  const [headerCompact, setHeaderCompact] = useState(false);
  const [cleanups, setCleanups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [stats, setStats] = useState({
    totalCleanups: 0,
    totalPoints: 0,
    totalTrash: 0,
    badges: 3,
    rank: 0
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHeaderCompact(scrollPosition > 120);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } else if (profileData) {
        setProfile(profileData);
        setSelectedAvatar(profileData.avatar_url || 'avatar1');
      }
      
      // Fetch user cleanups
      const { data: cleanupData, error: cleanupError } = await supabase
        .from('cleanups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (cleanupError) {
        console.error('Error fetching cleanups:', cleanupError);
      } else if (cleanupData) {
        // Transform data to match the UI format
        const formattedCleanups = cleanupData.map(cleanup => ({
          id: cleanup.id,
          date: formatDate(cleanup.created_at),
          location: cleanup.location || 'Unknown location',
          points: cleanup.points || 0,
          verified: cleanup.verified || false
        }));
        
        setCleanups(formattedCleanups);
        
        // Calculate totals
        const totalTrash = cleanupData.reduce((sum, cleanup) => sum + (cleanup.trash_weight_kg || 0), 0);
        
        // Get user rank
        const { data: rankData, error: rankError } = await supabase
          .from('profiles')
          .select('id')
          .gte('total_points', profileData.total_points || 0)
          .order('total_points', { ascending: false });
        
        const userRank = rankData ? rankData.length : 0;
        
        setStats({
          totalCleanups: cleanupData.length,
          totalPoints: profileData.total_points || 0,
          totalTrash: parseFloat(totalTrash.toFixed(1)),
          badges: 3, // Hardcoded for now
          rank: userRank
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 14) {
      return '1 week ago';
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 60) {
      return '1 month ago';
    } else {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
  };

  const handleAvatarChange = async (avatarId: string) => {
    try {
      if (!user || !profile) return;
      
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarId })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setProfile({
        ...profile,
        avatar_url: avatarId
      });
      
      setSelectedAvatar(avatarId);
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been changed successfully."
      });
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update avatar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="Profile" showBack={true} />
      
      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Profile header - made movable/scrollable */}
          <div className={`bg-gradient-to-r from-primary to-accent dark:from-sidebar-primary dark:to-accent/80 text-white pt-6 ${
            headerCompact ? 'pb-6' : 'pb-12'
          } transition-all duration-300 relative z-10`}>
            <div className="flex flex-col items-center transition-all duration-300">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="w-20 h-20 bg-white rounded-full overflow-hidden mb-3 cursor-pointer hover:opacity-90 transition-opacity">
                    <Avatar className="w-20 h-20">
                      <AvatarImage 
                        src={avatars.find(a => a.id === profile?.avatar_url)?.src || avatars[0].src} 
                        alt={profile?.full_name || 'User'} 
                      />
                      <AvatarFallback>{(profile?.full_name || 'User').substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogTitle className="text-center mb-4">Choose Your Avatar</DialogTitle>
                  <AvatarSelector 
                    selectedAvatar={selectedAvatar} 
                    onSelectAvatar={handleAvatarChange} 
                  />
                </DialogContent>
              </Dialog>
              <h1 className="text-xl font-bold">{profile?.full_name || 'User'}</h1>
              <p className="text-white/80">@{profile?.username || 'username'}</p>
              <div className="flex items-center gap-1 mt-1">
                <PointsBadge points={stats.totalPoints} />
              </div>
            </div>
          </div>
          
          {/* Stats cards - adjusted positioning */}
          <div className={`max-w-md mx-auto px-4 transition-all duration-300 ${
            headerCompact ? '-mt-6' : '-mt-8'
          } relative z-20`}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="hero-card animate-scale-in">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Trash className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm">Cleanups</h3>
                    <p className="text-xl font-bold">{stats.totalCleanups}</p>
                  </div>
                </div>
              </div>
              
              <div className="hero-card animate-scale-in" style={{ animationDelay: '50ms' }}>
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <Star className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm">Badges</h3>
                    <p className="text-xl font-bold">{stats.badges}</p>
                  </div>
                </div>
              </div>
              
              <div className="hero-card animate-scale-in" style={{ animationDelay: '100ms' }}>
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Award className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm">Rank</h3>
                    <p className="text-xl font-bold">#{stats.rank}</p>
                  </div>
                </div>
              </div>
              
              <div className="hero-card animate-scale-in" style={{ animationDelay: '150ms' }}>
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Trash className="w-5 h-5 text-green-500 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm">Collected</h3>
                    <p className="text-xl font-bold">{stats.totalTrash} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <main className="max-w-md mx-auto p-4 space-y-6 relative z-20 mt-4">
            {/* Badges */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Your Badges</h2>
                <a href="/badges" className="text-accent text-sm flex items-center">
                  All Badges
                  <Award className="w-4 h-4 ml-1" />
                </a>
              </div>
              <div className="hero-card">
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-1">
                      <Award className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                    </div>
                    <span className="text-xs text-center">First Clean</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-1">
                      <Award className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-center">Weekend Hero</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-1">
                      <Award className="w-6 h-6 text-green-500 dark:text-green-400" />
                    </div>
                    <span className="text-xs text-center">Park Cleaner</span>
                  </div>
                  <div className="flex flex-col items-center opacity-50">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-1">
                      <Award className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-xs text-center">Locked</span>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Cleanup history */}
            <section>
              <h2 className="text-lg font-bold mb-3">Cleanup History</h2>
              {cleanups.length > 0 ? (
                <div className="hero-card">
                  <div className="space-y-4">
                    {cleanups.map(cleanup => (
                      <div key={cleanup.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Trash className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{cleanup.location}</h3>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {cleanup.date}
                              </span>
                              {cleanup.verified && (
                                <span className="text-green-600 dark:text-green-400 flex items-center">
                                  <Check className="w-3 h-3 mr-1" />
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-primary dark:text-primary text-sm font-bold">
                          +{cleanup.points}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="hero-card text-center p-6">
                  <p className="text-muted-foreground">No cleanups yet</p>
                  <button 
                    onClick={() => window.location.href = '/cleanup'}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-full text-sm"
                  >
                    Start your first cleanup
                  </button>
                </div>
              )}
            </section>
            
            {/* Environmental Impact */}
            <section>
              <h2 className="text-lg font-bold mb-3">Environmental Impact</h2>
              <div className="hero-card">
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">CO2 Saved</span>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold text-primary">1.2</span>
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Plastic Recovered</span>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold text-primary">{stats.totalTrash}</span>
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Areas Cleaned</span>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold text-primary">{stats.totalCleanups}</span>
                      <span className="text-sm text-muted-foreground">locations</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </>
      )}
      
      <NavBar />
    </div>
  );
};

export default Profile;
