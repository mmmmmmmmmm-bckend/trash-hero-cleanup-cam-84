
import React from 'react';
import { Star } from 'lucide-react';

interface PointsBadgeProps {
  points: number;
  size?: 'small' | 'medium' | 'large';
}

const PointsBadge: React.FC<PointsBadgeProps> = ({ points, size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-3 py-1',
    large: 'text-lg px-4 py-2',
  };

  return (
    <div className={`bg-hero-accent rounded-full text-white font-bold flex items-center gap-1 ${sizeClasses[size]}`}>
      <Star className="w-4 h-4" />
      <span>{points}</span>
    </div>
  );
};

export default PointsBadge;
