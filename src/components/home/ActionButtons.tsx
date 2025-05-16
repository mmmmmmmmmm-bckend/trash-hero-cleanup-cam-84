
import React from 'react';
import { Star, MapPin, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActionButtons: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <button 
        onClick={() => navigate('/points')}
        className="hero-button-secondary flex-col py-4"
      >
        <Star className="w-6 h-6 mb-1" />
        <span className="text-sm">My Points</span>
      </button>
      
      <button 
        onClick={() => {
          navigate('/map');
        }}
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
  );
};

export default ActionButtons;
