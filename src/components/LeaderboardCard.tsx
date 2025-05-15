
import React from 'react';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
}

interface LeaderboardCardProps {
  title: string;
  entries: LeaderboardEntry[];
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ title, entries }) => {
  return (
    <div className="hero-card w-full">
      <h3 className="text-lg font-bold text-hero-text mb-4">{title}</h3>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <span className="font-bold text-lg w-6 text-center">
              {entry.rank === 1 && '🥇'}
              {entry.rank === 2 && '🥈'}
              {entry.rank === 3 && '🥉'}
              {entry.rank > 3 && entry.rank}
            </span>
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
              <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
            </div>
            <span className="flex-1 font-medium truncate">{entry.name}</span>
            <span className="font-bold text-hero-primary">{entry.points}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderboardCard;
