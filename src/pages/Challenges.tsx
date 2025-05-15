
import React, { useState } from 'react';
import { Award, Clock, Check, User, Users } from 'lucide-react';
import NavBar from '../components/NavBar';
import PointsBadge from '../components/PointsBadge';
import LeaderboardCard from '../components/LeaderboardCard';
import Header from '../components/Header';

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

// Mock leaderboard data
const globalLeaders = [
  { id: '1', name: 'Emma Green', avatar: 'https://i.pravatar.cc/150?img=1', points: 1250, rank: 1 },
  { id: '2', name: 'Alex River', avatar: 'https://i.pravatar.cc/150?img=2', points: 980, rank: 2 },
  { id: '3', name: 'Sam Earth', avatar: 'https://i.pravatar.cc/150?img=3', points: 780, rank: 3 },
  { id: '4', name: 'Taylor Blue', avatar: 'https://i.pravatar.cc/150?img=4', points: 720, rank: 4 },
  { id: '5', name: 'Jordan Lake', avatar: 'https://i.pravatar.cc/150?img=5', points: 650, rank: 5 },
];

const localLeaders = [
  { id: '1', name: 'You', avatar: 'https://i.pravatar.cc/150?img=5', points: 350, rank: 1 },
  { id: '2', name: 'Neighbor Jane', avatar: 'https://i.pravatar.cc/150?img=6', points: 320, rank: 2 },
  { id: '3', name: 'Local Hero', avatar: 'https://i.pravatar.cc/150?img=7', points: 290, rank: 3 },
];

const Challenges = () => {
  const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' or 'leaderboard'
  const [leaderboardType, setLeaderboardType] = useState('global'); // 'global' or 'local'
  
  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="Challenges & Leaderboards" />
      
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
            <LeaderboardCard 
              title={leaderboardType === 'global' ? "Global Leaders" : "Leaders Near You"}
              entries={leaderboardType === 'global' ? globalLeaders : localLeaders}
            />
            
            {/* Your rank */}
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Your Rank</h3>
              <div className="flex items-center">
                <span className="font-bold text-lg w-8">{leaderboardType === 'global' ? '42' : '1'}</span>
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <img src="https://i.pravatar.cc/150?img=5" alt="Your avatar" className="w-full h-full object-cover" />
                </div>
                <span className="ml-3 font-medium">You</span>
                <span className="ml-auto font-bold text-primary">350 pts</span>
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
