
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { supabase, getAvatarSrc } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import LeaderboardCard from '../components/LeaderboardCard';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import AppTutorial from '@/components/AppTutorial';
import FeatureGuide from '@/components/FeatureGuide';
import UserHeader from '@/components/home/UserHeader';
import ActionButtons from '@/components/home/ActionButtons';
import UserStats from '@/components/home/UserStats';
import UserChallenge from '@/components/home/UserChallenge';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [topLeaders, setTopLeaders] = useState([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFeatureGuide, setShowFeatureGuide] = useState(false);
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
    
    // Check if first visit to show tutorial - only once
    const hasSeenTutorial = localStorage.getItem('hasSeenAppTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      // Set tutorial as seen right away to prevent showing again if page reloads
      localStorage.setItem('hasSeenAppTutorial', 'true');
    }
  }, [user]);

  // Hide the tutorial and save this preference
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenAppTutorial', 'true');
  };

  const handleCloseFeatureGuide = () => {
    setShowFeatureGuide(false);
  };

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

  // Get avatar source based on avatar_url using our helper function
  const getUserAvatarSrc = () => {
    if (!userProfile?.avatar_url) return "https://i.pravatar.cc/150?img=5";
    
    // Use the imported getAvatarSrc helper function
    return getAvatarSrc(userProfile.avatar_url);
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
        // Use the imported getAvatarSrc helper function
        const avatarSrc = getAvatarSrc(user.avatar_url);
          
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

  return (
    <div className="min-h-screen pb-20 leaf-pattern">
      <div className="bg-gradient-to-r from-primary to-accent dark:from-sidebar-primary dark:to-accent/80 text-white">
        {/* Header component must be inside this div to share the gradient background */}
        <Header />
        
        {/* User points summary - now part of the same gradient container */}
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <UserHeader
              points={userPoints}
              profile={userProfile}
              avatarSrc={getUserAvatarSrc()}
            />
          </div>
        </div>
      </div>

      {/* Show App Tutorial */}
      <AppTutorial 
        isOpen={showTutorial} 
        onClose={handleCloseTutorial}
      />

      {/* Show Feature Guide */}
      <FeatureGuide
        isOpen={showFeatureGuide}
        onClose={handleCloseFeatureGuide}
      />

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
            <ActionButtons />

            {/* Help buttons */}
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setShowTutorial(true)}
              >
                App Guide
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setShowFeatureGuide(true)}
              >
                Features Guide
              </Button>
            </div>

            {/* Stats summary */}
            <UserStats stats={userStats} />

            {/* Active challenges */}
            <UserChallenge onViewAll={() => navigate('/challenges')} />

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
