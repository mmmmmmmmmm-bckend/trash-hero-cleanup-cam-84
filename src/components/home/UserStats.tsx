
import React from 'react';

interface UserStatsProps {
  stats: {
    cleanups: number;
    collected: number;
    badges: number;
  };
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  return (
    <div className="hero-card">
      <h2 className="text-lg font-bold mb-3">Your Impact</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">{stats.cleanups}</p>
          <p className="text-xs text-muted-foreground">Cleanups</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.collected}</p>
          <p className="text-xs text-muted-foreground">kg Collected</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.badges}</p>
          <p className="text-xs text-muted-foreground">Badges</p>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
