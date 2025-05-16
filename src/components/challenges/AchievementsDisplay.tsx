
import React from 'react';
import { Award } from 'lucide-react';

export const AchievementsDisplay = () => {
  return (
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
  );
};
