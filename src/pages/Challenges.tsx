
import React, { useState, useEffect } from 'react';
import { Award, Clock, Check, User, Users } from 'lucide-react';
import NavBar from '../components/NavBar';
import PointsBadge from '../components/PointsBadge';
import LeaderboardCard from '../components/LeaderboardCard';
import Header from '../components/Header';
import { supabase, getAvatarSrc } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AvatarSelector from '@/components/AvatarSelector';
import { ChallengesList } from '@/components/challenges/ChallengesList';
import { UserRankCard } from '@/components/challenges/UserRankCard';
import { AchievementsDisplay } from '@/components/challenges/AchievementsDisplay';

const Challenges = () => {
  const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' or 'leaderboard'
  const [leaderboardType, setLeaderboardType] = useState('global'); // 'global' or 'local'
  const [globalLeaders, setGlobalLeaders] = useState([]);
  const [localLeaders, setLocalLeaders] = useState([]);
  const [userRank, setUserRank] = useState({global: 0, local: 0});
  const [userPoints, setUserPoints] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState('');
  
  useEffect(() => {
    if (user) {
      fetchLeaderboardData();
      fetchUserProfile();
    }
  }, [user]);
  
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_points, avatar_url')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setUserPoints(data.total_points || 0);
        setUserAvatar(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Fetch global leaderboard
      const { data: globalData, error: globalError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, total_points')
        .order('total_points', { ascending: false })
        .limit(10);
        
      if (globalError) throw globalError;
      
      // Fetch local leaderboard (for demonstration, we use top 5 for local)
      const { data: localData, error: localError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, total_points')
        .order('total_points', { ascending: false })
        .limit(5);
        
      if (localError) throw localError;
      
      // Format leaderboard data
      if (globalData) {
        const formattedGlobal = formatLeaderboardData(globalData);
        setGlobalLeaders(formattedGlobal);
        
        // Find user's global rank
        const userGlobalRank = globalData.findIndex(profile => profile.id === user.id);
        if (userGlobalRank !== -1) {
          setUserRank(prev => ({...prev, global: userGlobalRank + 1}));
        } else {
          // If user not in top 10, we need to count all users with higher points
          const { count, error } = await supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .gt('total_points', userPoints);
            
          if (!error) {
            setUserRank(prev => ({...prev, global: count + 1}));
          }
        }
      }
      
      if (localData) {
        const formattedLocal = formatLeaderboardData(localData);
        setLocalLeaders(formattedLocal);
        
        // Find user's local rank
        const userLocalRank = localData.findIndex(profile => profile.id === user.id);
        setUserRank(prev => ({...prev, local: userLocalRank !== -1 ? userLocalRank + 1 : 0}));
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      toast({
        title: "Error",
        description: "Could not load leaderboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format leaderboard data
  const formatLeaderboardData = (data) => {
    return data.map((user, index) => {
      const avatarSrc = getAvatarSrc(user.avatar_url);
      
      return {
        id: user.id,
        name: user.full_name || user.username || `User ${index + 1}`,
        avatar: avatarSrc,
        points: user.total_points || 0,
        rank: index + 1
      };
    });
  };
  
  // Get user avatar URL
  const getUserAvatarUrl = () => {
    return getAvatarSrc(userAvatar);
  };
  
  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="Challenges & Leaderboards" showBack={true} />
      
      {/* Tabs */}
      <div className="sticky top-14 z-10 bg-background border-b border-border">
        <div className="flex max-w-md mx-auto">
          <button 
            className={`flex-1 py-3 font-medium text-sm ${
              activeTab === 'challenges' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('challenges')}
          >
            Challenges
          </button>
          <button 
            className={`flex-1 py-3 font-medium text-sm ${
              activeTab === 'leaderboard' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>
      </div>
      
      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'challenges' && (
          <ChallengesList />
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {/* Leaderboard type toggle */}
            <div className="bg-card rounded-lg shadow-sm p-1 flex">
              <button 
                className={`flex-1 py-2 text-sm rounded-md ${
                  leaderboardType === 'global' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground'
                }`}
                onClick={() => setLeaderboardType('global')}
              >
                Global
              </button>
              <button 
                className={`flex-1 py-2 text-sm rounded-md ${
                  leaderboardType === 'local' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground'
                }`}
                onClick={() => setLeaderboardType('local')}
              >
                Local
              </button>
            </div>
            
            {/* Leaderboard table */}
            {loading ? (
              <div className="bg-card p-4 rounded-lg shadow-sm animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <LeaderboardCard 
                title={leaderboardType === 'global' ? "Global Leaders" : "Leaders Near You"}
                entries={leaderboardType === 'global' ? globalLeaders : localLeaders}
              />
            )}
            
            {/* Your rank */}
            <UserRankCard
              userRank={userRank}
              leaderboardType={leaderboardType}
              userPoints={userPoints}
              avatarUrl={getUserAvatarUrl()}
            />
            
            {/* Badges/achievements */}
            <AchievementsDisplay />
          </div>
        )}
      </main>
      
      <NavBar />
    </div>
  );
};

export default Challenges;
