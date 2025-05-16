
import React from 'react';
import { User, Users, Clock } from 'lucide-react';
import PointsBadge from '../PointsBadge';

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

export const ChallengesList = () => {
  return (
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
  );
};
