
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Award, Star } from 'lucide-react';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import LeaderboardCard from '../components/LeaderboardCard';
import PointsBadge from '../components/PointsBadge';

// Sample top leaders data
const topLeaders = [
  { id: '1', name: 'Emma Green', avatar: 'https://i.pravatar.cc/150?img=1', points: 1250, rank: 1 },
  { id: '2', name: 'Alex River', avatar: 'https://i.pravatar.cc/150?img=2', points: 980, rank: 2 },
  { id: '3', name: 'Sam Earth', avatar: 'https://i.pravatar.cc/150?img=3', points: 780, rank: 3 },
];

const Index = () => {
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState(350);

  return (
    <div className="min-h-screen pb-20 leaf-pattern">
      <Header />
      
      {/* User points summary */}
      <div className="bg-gradient-to-r from-primary to-accent dark:from-sidebar-primary dark:to-accent/80 text-white p-6 shadow-md">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Your impact</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{userPoints}</span>
                <Star className="w-5 h-5" />
                <span className="text-sm opacity-90">points</span>
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-full">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=5" alt="User avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
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
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground">Cleanups</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">5.2</p>
              <p className="text-xs text-muted-foreground">kg Collected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">3</p>
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
      </main>

      <NavBar />
    </div>
  );
};

export default Index;
