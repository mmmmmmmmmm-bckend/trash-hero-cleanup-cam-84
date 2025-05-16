import React, { useEffect, useState } from 'react';
import { supabase, getAvatarSrc } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
}

interface LeaderboardCardProps {
  title: string;
  entries?: LeaderboardEntry[];
  limit?: number;
  localOnly?: boolean;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ 
  title, 
  entries: initialEntries, 
  limit = 5, 
  localOnly = false 
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries || []);
  const [loading, setLoading] = useState(!initialEntries);

  useEffect(() => {
    // If entries are provided and we're not forcing a fetch, use them
    if (initialEntries && !localOnly) {
      setEntries(initialEntries);
      return;
    }
    
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Always fetch from the database to ensure we have real users
        let query = supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, total_points')
          .order('total_points', { ascending: false });
        
        if (localOnly) {
          // In a real app, you would filter by location/area
          query = query.limit(5);
        } else {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const leaderboardData = data.map((user, index) => {
            const avatarSrc = getAvatarSrc(user.avatar_url);
              
            return {
              id: user.id,
              name: user.full_name || user.username || `User ${index + 1}`,
              avatar: avatarSrc,
              points: user.total_points || 0,
              rank: index + 1
            };
          });
          
          setEntries(leaderboardData);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [initialEntries, limit, localOnly]);
  
  if (loading) {
    return (
      <div className="hero-card w-full">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hero-card w-full">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      {entries.length > 0 ? (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="font-bold text-lg w-6 text-center">
                {entry.rank === 1 && '🥇'}
                {entry.rank === 2 && '🥈'}
                {entry.rank === 3 && '🥉'}
                {entry.rank > 3 && entry.rank}
              </span>
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
              </div>
              <span className="flex-1 font-medium truncate">{entry.name}</span>
              <span className="font-bold text-primary">{entry.points}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No entries available
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;
