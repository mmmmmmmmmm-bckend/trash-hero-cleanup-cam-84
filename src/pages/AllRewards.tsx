
import React from 'react';
import { Star, Gift } from 'lucide-react';
import Header from '../components/Header';
import NavBar from '../components/NavBar';

// Mock rewards data
const allRewards = [
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
  },
  {
    id: '4',
    title: 'Reusable Water Bottle',
    description: 'Premium eco-friendly water bottle',
    pointsCost: 600,
    image: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?w=400&q=80',
  },
  {
    id: '5',
    title: 'Zero Waste Kit',
    description: 'Complete kit with reusable items',
    pointsCost: 1500,
    image: 'https://images.unsplash.com/photo-1542220365-a599c252b6eb?w=400&q=80',
  },
  {
    id: '6',
    title: 'Eco Workshop',
    description: 'Free pass to an eco-friendly workshop',
    pointsCost: 800,
    image: 'https://images.unsplash.com/photo-1517457210474-359908f70c45?w=400&q=80',
  },
  {
    id: '7',
    title: '$10 Gift Card',
    description: 'Gift card for eco-friendly store',
    pointsCost: 900,
    image: 'https://images.unsplash.com/photo-1561715276-a2d087060f1d?w=400&q=80',
  }
];

const AllRewards = () => {
  const userPoints = 350; // Mock user points
  
  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="All Rewards" showBack={true} />
      
      <main className="max-w-md mx-auto p-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Available Rewards</h1>
          <div className="flex items-center px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full">
            <Star className="w-4 h-4 text-primary mr-1" />
            <span className="font-medium">{userPoints} points</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {allRewards.map(reward => (
            <div key={reward.id} className="hero-card flex overflow-hidden">
              <div className="w-24 h-24 relative overflow-hidden">
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
                    userPoints >= reward.pointsCost
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  disabled={userPoints < reward.pointsCost}
                >
                  {userPoints >= reward.pointsCost ? 'Redeem' : 'Not Enough Points'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <NavBar />
    </div>
  );
};

export default AllRewards;
