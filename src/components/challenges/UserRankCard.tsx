
import React from 'react';

interface UserRankCardProps {
  userRank: { global: number; local: number };
  leaderboardType: 'global' | 'local';
  userPoints: number;
  avatarUrl: string;
}

export const UserRankCard: React.FC<UserRankCardProps> = ({
  userRank,
  leaderboardType,
  userPoints,
  avatarUrl,
}) => {
  // Ensure leaderboardType is valid
  const validType = leaderboardType === 'global' || leaderboardType === 'local' 
    ? leaderboardType 
    : 'global'; // Default to global if invalid
    
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <h3 className="font-medium text-sm text-muted-foreground mb-2">Your Rank</h3>
      <div className="flex items-center">
        <span className="font-bold text-lg w-8">
          {validType === 'global' ? 
            (userRank.global || '?') : 
            (userRank.local || '?')}
        </span>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <img 
            src={avatarUrl} 
            alt="Your avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
        <span className="ml-3 font-medium">You</span>
        <span className="ml-auto font-bold text-primary">{userPoints} pts</span>
      </div>
    </div>
  );
};
