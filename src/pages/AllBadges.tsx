
import React from 'react';
import { Award } from 'lucide-react';
import Header from '../components/Header';
import NavBar from '../components/NavBar';

// Mock badges data
const allBadges = [
  {
    id: '1',
    name: 'First Clean',
    description: 'Complete your first cleanup',
    icon: 'award',
    color: 'yellow',
    unlocked: true,
  },
  {
    id: '2',
    name: 'Weekend Hero',
    description: 'Complete 3 cleanups in a weekend',
    icon: 'award',
    color: 'blue',
    unlocked: true,
  },
  {
    id: '3',
    name: 'Park Cleaner',
    description: 'Clean 5 different parks',
    icon: 'award',
    color: 'green',
    unlocked: true,
  },
  {
    id: '4',
    name: 'Beach Master',
    description: 'Complete 10 beach cleanups',
    icon: 'award',
    color: 'teal',
    unlocked: false,
  },
  {
    id: '5',
    name: 'Trash Champion',
    description: 'Collect 100kg of trash',
    icon: 'award',
    color: 'cyan',
    unlocked: false,
  },
  {
    id: '6',
    name: 'Community Leader',
    description: 'Invite 5 friends to join',
    icon: 'award',
    color: 'purple',
    unlocked: false,
  },
  {
    id: '7',
    name: 'Earth Guardian',
    description: 'Complete 50 cleanups',
    icon: 'award',
    color: 'emerald',
    unlocked: false,
  },
  {
    id: '8',
    name: 'Plastic Hunter',
    description: 'Collect 50kg of plastic',
    icon: 'award',
    color: 'indigo',
    unlocked: false,
  }
];

const getColorClass = (color: string, unlocked: boolean) => {
  if (!unlocked) return 'bg-gray-100 dark:bg-gray-800 text-gray-400';
  
  switch (color) {
    case 'yellow': return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-500 dark:text-yellow-400';
    case 'blue': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400';
    case 'green': return 'bg-green-100 dark:bg-green-950/30 text-green-500 dark:text-green-400';
    case 'teal': return 'bg-teal-100 dark:bg-teal-950/30 text-teal-500 dark:text-teal-400';
    case 'cyan': return 'bg-cyan-100 dark:bg-cyan-950/30 text-cyan-500 dark:text-cyan-400';
    case 'purple': return 'bg-purple-100 dark:bg-purple-950/30 text-purple-500 dark:text-purple-400';
    case 'emerald': return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400';
    case 'indigo': return 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
  }
};

const AllBadges = () => {
  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="All Badges" showBack={true} />
      
      <main className="max-w-md mx-auto p-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">All Available Badges</h1>
        
        <div className="grid grid-cols-2 gap-4">
          {allBadges.map((badge) => (
            <div key={badge.id} className="hero-card">
              <div className="flex flex-col items-center p-2">
                <div className={`w-16 h-16 ${getColorClass(badge.color, badge.unlocked)} rounded-full flex items-center justify-center mb-3`}>
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-medium text-center">{badge.name}</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">{badge.description}</p>
                <span className={`mt-2 text-xs px-3 py-1 rounded-full ${
                  badge.unlocked 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'
                }`}>
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <NavBar />
    </div>
  );
};

export default AllBadges;
