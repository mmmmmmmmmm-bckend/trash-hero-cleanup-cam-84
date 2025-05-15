import React, { useState, useEffect } from 'react';
import { Star, Gift, Award, ArrowRight, Clock } from 'lucide-react';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock rewards data
const rewards = [
  {
    id: '1',
    title: 'Free Coffee',
    description: 'Get a free coffee at Green Café',
    pointsCost: 500,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  },
  {
    id: '2',
    title: 'Plant a Tree',
    description: 'We\'ll plant a tree in your name',
    pointsCost: 750,
    image: 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=400&q=80',
  },
  {
    id: '3',
    title: 'Eco-friendly T-shirt',
    description: 'Get a TrashHero t-shirt made from recycled materials',
    pointsCost: 1200,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80',
  }
];

const Points = () => {
  const [totalPoints, setTotalPoints] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchUserPoints();
      fetchPointsHistory();
    }
  }, [user]);
  
  const fetchUserPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTotalPoints(data.total_points || 0);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };
  
  const fetchPointsHistory = async () => {
    setLoading(true);
    try {
      // Fetch user cleanups as they are a source of points
      const { data: cleanups, error: cleanupsError } = await supabase
        .from('cleanups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (cleanupsError) throw cleanupsError;
      
      // Convert cleanups to point history entries
      const historyFromCleanups = cleanups?.map(cleanup => {
        const pointsEarned = cleanup.points || 25; // Default to 25 if not specified
        const formattedDate = formatTimeSince(new Date(cleanup.created_at));
        
        return {
          id: cleanup.id,
          type: 'earned',
          amount: pointsEarned,
          description: `Cleanup at ${cleanup.location || 'Unknown Location'}`,
          date: formattedDate,
          timestamp: new Date(cleanup.created_at).getTime()
        };
      }) || [];
      
      // Add some mock redeemed rewards for demonstration
      // In a real app, you would fetch this from a redemptions table
      const mockRedemptions = [
        {
          id: 'redemption-1',
          type: 'redeemed',
          amount: -200,
          description: 'Redeemed: Reusable Water Bottle',
          date: '2 weeks ago',
          timestamp: Date.now() - (14 * 24 * 60 * 60 * 1000) // 2 weeks ago
        }
      ];
      
      // Combine and sort by timestamp
      const combinedHistory = [...historyFromCleanups, ...mockRedemptions]
        .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
      
      setPointsHistory(combinedHistory);
    } catch (error) {
      console.error('Error fetching points history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format time since a date
  const formatTimeSince = (date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };
  
  const handleRedeemReward = (reward) => {
    if (totalPoints < reward.pointsCost) {
      toast({
        title: "Not Enough Points",
        description: `You need ${reward.pointsCost - totalPoints} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Reward Redeemed",
      description: `You've successfully redeemed ${reward.title}!`,
    });
    
    // In a real app, you would update the database here
    setTotalPoints(prev => prev - reward.pointsCost);
    setPointsHistory(prev => [
      {
        id: `redemption-${Date.now()}`,
        type: 'redeemed',
        amount: -reward.pointsCost,
        description: `Redeemed: ${reward.title}`,
        date: 'just now',
        timestamp: Date.now()
      },
      ...prev
    ]);
  };
  
  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="My Points" />
      
      <div className="bg-gradient-to-r from-primary to-accent dark:from-sidebar-primary dark:to-accent/80 text-white p-6">
        <div className="max-w-md mx-auto bg-white/20 backdrop-blur-md p-4 rounded-xl">
          <h2 className="text-center font-medium text-sm">Current Balance</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Star className="w-6 h-6" />
            <span className="text-3xl font-bold">{totalPoints}</span>
          </div>
        </div>
      </div>
      
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Badges section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Your Badges</h2>
            <button 
              onClick={() => navigate('/badges')} 
              className="text-accent text-sm flex items-center"
            >
              All Badges
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="hero-card">
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950/30 rounded-full flex items-center justify-center mb-1">
                  <Award className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                </div>
                <span className="text-xs text-center">First Clean</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-1">
                  <Award className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-xs text-center">Weekend Hero</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-1">
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
        
        {/* Rewards section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Available Rewards</h2>
            <button 
              onClick={() => navigate('/rewards')} 
              className="text-accent text-sm flex items-center"
            >
              More
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {rewards.map(reward => (
              <div key={reward.id} className="hero-card flex overflow-hidden">
                <div className="w-20 h-20 relative overflow-hidden">
                  <img 
                    src={reward.image} 
                    alt={reward.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{reward.title}</h3>
                    <div className="flex items-center text-sm font-bold text-primary dark:text-primary">
                      <Star className="w-4 h-4 mr-1" />
                      <span>{reward.pointsCost}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                  <button 
                    className={`mt-2 text-sm px-3 py-1 rounded-full ${
                      totalPoints >= reward.pointsCost
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    disabled={totalPoints < reward.pointsCost}
                    onClick={() => handleRedeemReward(reward)}
                  >
                    {totalPoints >= reward.pointsCost ? 'Redeem' : 'Not Enough Points'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Points history */}
        <section>
          <h2 className="text-lg font-bold mb-3">Points History</h2>
          {loading ? (
            <div className="hero-card animate-pulse">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div>
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="hero-card">
              <div className="space-y-3">
                {pointsHistory.length > 0 ? (
                  pointsHistory.map(item => (
                    <div key={item.id} className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          item.type === 'earned' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-amber-100 dark:bg-amber-900/30'
                        }`}>
                          {item.type === 'earned' ? (
                            <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{item.description}</h4>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        item.type === 'earned' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {item.type === 'earned' ? '+' : ''}{item.amount}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No points activity yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      
      <NavBar />
    </div>
  );
};

export default Points;
