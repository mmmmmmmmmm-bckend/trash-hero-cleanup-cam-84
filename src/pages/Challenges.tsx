
import React, { useState, useEffect } from 'react';
import { Award, Clock, Check, User, Users } from 'lucide-react';
import NavBar from '../components/NavBar';
import PointsBadge from '../components/PointsBadge';
import LeaderboardCard from '../components/LeaderboardCard';
import Header from '../components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock challenge data
const activeChallenges = [
  { 
    id: '1', 
    title: 'Weekend Warrior', 
    description: 'Complete 3 cleanups this weekend', 
    reward: 250, 
    progress: 2, 
    total: 3,
    endsIn: '2d 5h',
    type: 'personal',
  },
  {
    id: '2',
    title: 'Plastic Hunter',
    description: 'Collect 5 plastic bottles',
    reward: 150,
    progress: 3,
    total: 5,
    endsIn: '1d 12h',
    type: 'personal',
  }
];

const availableChallenges = [
  {
    id: '3',
    title: 'Early Bird',
    description: 'Clean up before 9am',
    reward: 100,
    endsIn: '3d',
    type: 'personal',
  },
  {
    id: '4',
    title: 'City Clean-Up',
    description: 'Join forces with others to clean Downtown',
    reward: 500,
    endsIn: '5d',
    type: 'team',
  },
];

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
        .select('total_points')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setUserPoints(data.total_points || 0);
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
      const avatarSrc = user.avatar_url 
        ? (avatars.find(a => a.id === user.avatar_url)?.src || `https://i.pravatar.cc/150?img=${index + 1}`) 
        : `https://i.pravatar.cc/150?img=${index + 1}`;
      
      return {
        id: user.id,
        name: user.full_name || user.username || `User ${index + 1}`,
        avatar: avatarSrc,
        points: user.total_points || 0,
        rank: index + 1
      };
    });
  };
  
  // Import avatars
  const avatars = [
    { id: 'avatar1', name: 'Cairo Style', src: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=200&q=80' },
    { id: 'avatar2', name: 'Alexandria', src: 'https://images.unsplash.com/photo-1595503240812-7286dafaddc1?w=200&q=80' },
    { id: 'avatar3', name: 'Nile Explorer', src: 'https://images.unsplash.com/photo-1578927312881-55555eb2eb7f?w=200&q=80' },
    { id: 'avatar4', name: 'Desert Nomad', src: 'https://images.unsplash.com/photo-1591014141178-02091240f1c6?w=200&q=80' },
    { id: 'avatar5', name: 'Red Sea', src: 'https://images.unsplash.com/photo-1566677379313-461196b3e5ad?w=200&q=80' },
    { id: 'avatar6', name: 'Oasis', src: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=200&q=80' },
    { id: 'avatar7', name: 'Sphinx', src: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=200&q=80' },
    { id: 'avatar8', name: 'Pyramid', src: 'https://images.unsplash.com/photo-1668229550805-c3e2f121c01e?w=200&q=80' }
  ];
  
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
          <div className="space-y-6">
            {/* Active challenges */}
            <div>
              <h2 className="text-lg font-bold mb-3">Active Challenges</h2>
              <div className="space-y-3">
                {activeChallenges.map((challenge) => (
                  <div key={challenge.id} className="hero-card">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          challenge.type === 'personal' 
                            ? 'bg-accent/10' 
                            : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          {challenge.type === 'personal' ? (
                            <User className={`w-5 h-5 text-accent`} />
                          ) : (
                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                      </div>
                      <PointsBadge points={challenge.reward} size="small" />
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.total}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full" 
                          style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Ends in {challenge.endsIn}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Available challenges */}
            <div>
              <h2 className="text-lg font-bold mb-3">Available Challenges</h2>
              <div className="space-y-3">
                {availableChallenges.map((challenge) => (
                  <div key={challenge.id} className="hero-card">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          challenge.type === 'personal' 
                            ? 'bg-accent/10' 
                            : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          {challenge.type === 'personal' ? (
                            <User className={`w-5 h-5 text-accent`} />
                          ) : (
                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                      </div>
                      <PointsBadge points={challenge.reward} size="small" />
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Ends in {challenge.endsIn}</span>
                      </div>
                      <button className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Your Rank</h3>
              <div className="flex items-center">
                <span className="font-bold text-lg w-8">
                  {leaderboardType === 'global' ? 
                    (userRank.global || '?') : 
                    (userRank.local || '?')}
                </span>
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <img 
                    src={avatars.find(a => a.id === user?.user_metadata?.avatar_url || 'avatar1')?.src || 'https://i.pravatar.cc/150?img=5'} 
                    alt="Your avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="ml-3 font-medium">You</span>
                <span className="ml-auto font-bold text-primary">{userPoints} pts</span>
              </div>
            </div>
            
            {/* Badges/achievements */}
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <h3 className="font-medium mb-3">Your Achievements</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-1">
                    <Award className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <span className="text-xs">First Clean</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-1">
                    <Award className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span className="text-xs">Weekend Hero</span>
                </div>
                <div className="flex flex-col items-center opacity-50">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-1">
                    <Award className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-xs">Locked</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <NavBar />
    </div>
  );
};

export default Challenges;
