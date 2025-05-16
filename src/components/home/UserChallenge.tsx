
import React from 'react';
import PointsBadge from '../PointsBadge';

interface UserChallengeProps {
  onViewAll: () => void;
}

const UserChallenge: React.FC<UserChallengeProps> = ({ onViewAll }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Active Challenge</h2>
        <button 
          onClick={onViewAll}
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
  );
};

export default UserChallenge;
