
import React from 'react';
import { Star, Gift, Award, ArrowRight, Clock } from 'lucide-react';
import NavBar from '../components/NavBar';
import Header from '../components/Header';

// Mock rewards data
const rewards = [
  {
    id: '1',
    title: 'Free Coffee',
    description: 'Get a free coffee at Green Café',
    pointsCost: 500,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  },
  {
    id: '2',
    title: 'Plant a Tree',
    description: 'We\'ll plant a tree in your name',
    pointsCost: 750,
    image: 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=400&q=80',
  },
  {
    id: '3',
    title: 'Eco-friendly T-shirt',
    description: 'Get a TrashHero t-shirt made from recycled materials',
    pointsCost: 1200,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80',
  }
];

// Mock points history
const pointsHistory = [
  {
    id: '1',
    type: 'earned',
    amount: 25,
    description: 'Beach cleanup',
    date: '2 hours ago',
  },
  {
    id: '2',
    type: 'earned',
    amount: 50,
    description: 'Challenge completed: Weekend Warrior',
    date: '1 day ago',
  },
  {
    id: '3',
    type: 'earned',
    amount: 25,
    description: 'Park cleanup',
    date: '3 days ago',
  },
  {
    id: '4',
    type: 'redeemed',
    amount: -200,
    description: 'Redeemed: Reusable Water Bottle',
    date: '1 week ago',
  }
];

const Points = () => {
  const [totalPoints, setTotalPoints] = React.useState(350);
  
  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="My Points" />
      
      <div className="bg-gradient-to-r from-primary to-accent dark:from-sidebar-primary dark:to-accent/80 text-white p-6">
        <div className="max-w-md mx-auto bg-white/20 backdrop-blur-md p-4 rounded-xl">
          <h2 className="text-center font-medium text-sm">Current Balance</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Star className="w-6 h-6" />
            <span className="text-3xl font-bold">{totalPoints}</span>
          </div>
        </div>
      </div>
      
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Badges section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Your Badges</h2>
            <button className="text-accent text-sm flex items-center">
              All Badges
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="hero-card">
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950/30 rounded-full flex items-center justify-center mb-1">
                  <Award className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                </div>
                <span className="text-xs text-center">First Clean</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-1">
                  <Award className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-xs text-center">Weekend Hero</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-1">
                  <Award className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
                <span className="text-xs text-center">Park Cleaner</span>
              </div>
              <div className="flex flex-col items-center opacity-50">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-1">
                  <Award className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-xs text-center">Locked</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Rewards section */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Available Rewards</h2>
            <button className="text-accent text-sm flex items-center">
              More
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {rewards.map(reward => (
              <div key={reward.id} className="hero-card flex overflow-hidden">
                <div className="w-20 h-20 relative overflow-hidden">
                  <img 
                    src={reward.image} 
                    alt={reward.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{reward.title}</h3>
                    <div className="flex items-center text-sm font-bold text-primary dark:text-primary">
                      <Star className="w-4 h-4 mr-1" />
                      <span>{reward.pointsCost}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                  <button 
                    className={`mt-2 text-sm px-3 py-1 rounded-full ${
                      totalPoints >= reward.pointsCost
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    disabled={totalPoints < reward.pointsCost}
                  >
                    {totalPoints >= reward.pointsCost ? 'Redeem' : 'Not Enough Points'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Points history */}
        <section>
          <h2 className="text-lg font-bold mb-3">Points History</h2>
          <div className="hero-card">
            <div className="space-y-3">
              {pointsHistory.map(item => (
                <div key={item.id} className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      item.type === 'earned' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                      {item.type === 'earned' ? (
                        <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{item.description}</h4>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    item.type === 'earned' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {item.type === 'earned' ? '+' : ''}{item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <NavBar />
    </div>
  );
};

export default Points;
