
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Award, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import LeaderboardCard from '../components/LeaderboardCard';
import PointsBadge from '../components/PointsBadge';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatars } from '@/components/AvatarSelector';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [topLeaders, setTopLeaders] = useState([]);
  const [userStats, setUserStats] = useState({
    cleanups: 0,
    collected: 0,
    badges: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setUserProfile(profile);
        setUserPoints(profile.total_points || 0);
      }
      
      // Fetch user cleanups
      const { data: cleanups, error: cleanupsError } = await supabase
        .from('cleanups')
        .select('*')
        .eq('user_id', user.id);
      
      if (cleanupsError) {
        console.error('Error fetching cleanups:', cleanupsError);
      } else {
        // Calculate stats
        const totalCollected = cleanups?.reduce((sum, cleanup) => sum + (cleanup.trash_weight_kg || 0), 0) || 0;
        
        setUserStats({
          cleanups: cleanups?.length || 0,
          collected: parseFloat(totalCollected.toFixed(1)),
          badges: 3 // For now, this is hardcoded but would come from a badges table
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Get top users by points
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, total_points')
        .order('total_points', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }
      
      // Format for leaderboard
      const formattedLeaders = data.map((user, index) => {
        // Find the avatar URL based on the avatar_url ID
        const avatarSrc = user.avatar_url ? 
          (avatars.find(a => a.id === user.avatar_url)?.src || `https://i.pravatar.cc/150?img=${index + 1}`) : 
          `https://i.pravatar.cc/150?img=${index + 1}`;
          
        return {
          id: user.id,
          name: user.full_name || user.username || `User ${index + 1}`,
          avatar: avatarSrc,
          points: user.total_points || 0,
          rank: index + 1
        };
      });
      
      setTopLeaders(formattedLeaders);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  // Get avatar source based on avatar_url
  const getAvatarSrc = () => {
    if (!userProfile?.avatar_url) return avatars[0]?.src || "https://i.pravatar.cc/150?img=5";
    const avatar = avatars.find(a => a.id === userProfile.avatar_url);
    return avatar?.src || avatars[0]?.src || "https://i.pravatar.cc/150?img=5";
  };

  return (
    <div className="min-h-screen pb-20 leaf-pattern">
      <div className="bg-gradient-to-r from-primary to-accent dark:from-sidebar-primary dark:to-accent/80 text-white">
        {/* Header component must be inside this div to share the gradient background */}
        <Header />
        
        {/* User points summary - now part of the same gradient container */}
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Your impact</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{userPoints}</span>
                  <Star className="w-5 h-5" />
                  <span className="text-sm opacity-90">points</span>
                </div>
                {userProfile && (
                  <p className="text-sm mt-1 opacity-90">
                    {userProfile.full_name || userProfile.username || "User"}
                  </p>
                )}
              </div>
              <div className="bg-white/20 p-2 rounded-full">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  {userProfile ? (
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={getAvatarSrc()} 
                        alt={userProfile.full_name || "User"} 
                      />
                      <AvatarFallback>
                        {(userProfile.full_name || userProfile.username || "U").substring(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={avatars[0]?.src || "https://i.pravatar.cc/150?img=5"} alt="User avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Primary action: Start Cleanup */}
            <button 
              onClick={() => navigate('/cleanup')}
              className="hero-button w-full animate-bounce-small"
            >
              <Plus className="w-5 h-5" />
              <span>Start Cleanup</span>
            </button>

            {/* Secondary actions */}
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/points')}
                className="hero-button-secondary flex-col py-4"
              >
                <Star className="w-6 h-6 mb-1" />
                <span className="text-sm">My Points</span>
              </button>
              
              <button 
                onClick={() => navigate('/map')}
                className="hero-button-secondary flex-col py-4"
              >
                <MapPin className="w-6 h-6 mb-1" />
                <span className="text-sm">Nearby Bins</span>
              </button>
              
              <button 
                onClick={() => navigate('/challenges')}
                className="hero-button-secondary flex-col py-4"
              >
                <Award className="w-6 h-6 mb-1" />
                <span className="text-sm">Challenges</span>
              </button>
            </div>

            {/* Stats summary */}
            <div className="hero-card">
              <h2 className="text-lg font-bold mb-3">Your Impact</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{userStats.cleanups}</p>
                  <p className="text-xs text-muted-foreground">Cleanups</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{userStats.collected}</p>
                  <p className="text-xs text-muted-foreground">kg Collected</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{userStats.badges}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>

            {/* Active challenges */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Active Challenge</h2>
                <button 
                  onClick={() => navigate('/challenges')}
                  className="text-accent dark:text-accent text-sm"
                >
                  View All
                </button>
              </div>
              <div className="hero-card">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Weekend Warrior</h3>
                  <PointsBadge points={250} size="small" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete 3 cleanups this weekend
                </p>
                <div className="w-full bg-gray-200 dark:bg-muted rounded-full h-2.5 mb-1">
                  <div className="bg-accent dark:bg-accent h-2.5 rounded-full" style={{ width: '66%' }}></div>
                </div>
                <p className="text-xs text-right text-muted-foreground">2/3 completed</p>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Leaderboard</h2>
                <span className="text-sm text-muted-foreground">This Week</span>
              </div>
              <LeaderboardCard 
                title="Top Heroes"
                entries={topLeaders}
              />
            </div>
          </>
        )}
      </main>

      <NavBar />
    </div>
  );
};

export default Index;
