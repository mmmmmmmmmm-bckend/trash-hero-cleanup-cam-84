
import React from 'react';
import { User, Award, Star, Clock, MapPin, Trash, Settings, Check } from 'lucide-react';
import NavBar from '../components/NavBar';
import PointsBadge from '../components/PointsBadge';
import Header from '../components/Header';

// Mock cleanup data
const cleanups = [
  {
    id: '1',
    date: '2 days ago',
    location: 'City Beach',
    points: 25,
    verified: true,
  },
  {
    id: '2',
    date: '5 days ago',
    location: 'Downtown Park',
    points: 25,
    verified: true,
  },
  {
    id: '3',
    date: '1 week ago',
    location: 'Riverside',
    points: 25,
    verified: true,
  },
];

// Mock statistics
const stats = {
  totalCleanups: 12,
  totalPoints: 350,
  totalTrash: 5.2, // kg
  badges: 3,
  rank: 42,
};

const Profile = () => {
  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="Profile" />
      
      {/* Profile header - made movable/scrollable */}
      <div className="bg-gradient-to-r from-primary to-accent dark:from-sidebar-primary dark:to-accent/80 text-white pt-6 pb-16 relative">
        <div className="absolute top-4 right-4">
          <button className="p-2 bg-white/10 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full overflow-hidden mb-3">
            <img 
              src="https://i.pravatar.cc/150?img=5" 
              alt="User avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-xl font-bold">Alex Johnson</h1>
          <p className="text-white/80">@alexcleanup</p>
          <div className="flex items-center gap-1 mt-1">
            <PointsBadge points={stats.totalPoints} />
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="max-w-md mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="hero-card animate-scale-in">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-primary/10 rounded-full">
                <Trash className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm">Cleanups</h3>
                <p className="text-xl font-bold">{stats.totalCleanups}</p>
              </div>
            </div>
          </div>
          
          <div className="hero-card animate-scale-in" style={{ animationDelay: '50ms' }}>
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-accent/10 rounded-full">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm">Badges</h3>
                <p className="text-xl font-bold">{stats.badges}</p>
              </div>
            </div>
          </div>
          
          <div className="hero-card animate-scale-in" style={{ animationDelay: '100ms' }}>
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm">Rank</h3>
                <p className="text-xl font-bold">#{stats.rank}</p>
              </div>
            </div>
          </div>
          
          <div className="hero-card animate-scale-in" style={{ animationDelay: '150ms' }}>
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Trash className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-muted-foreground text-sm">Collected</h3>
                <p className="text-xl font-bold">{stats.totalTrash} kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-md mx-auto p-4 mt-4 space-y-6">
        {/* Badges */}
        <section>
          <h2 className="text-lg font-bold mb-3">Your Badges</h2>
          <div className="hero-card">
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-1">
                  <Award className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                </div>
                <span className="text-xs text-center">First Clean</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-1">
                  <Award className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-xs text-center">Weekend Hero</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-1">
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
        
        {/* Cleanup history */}
        <section>
          <h2 className="text-lg font-bold mb-3">Cleanup History</h2>
          <div className="hero-card">
            <div className="space-y-4">
              {cleanups.map(cleanup => (
                <div key={cleanup.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Trash className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{cleanup.location}</h3>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {cleanup.date}
                        </span>
                        {cleanup.verified && (
                          <span className="text-green-600 dark:text-green-400 flex items-center">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-primary dark:text-primary text-sm font-bold">
                    +{cleanup.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Environmental Impact */}
        <section>
          <h2 className="text-lg font-bold mb-3">Environmental Impact</h2>
          <div className="hero-card">
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">CO2 Saved</span>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-primary">1.2</span>
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Plastic Recovered</span>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-primary">2.8</span>
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Areas Cleaned</span>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-primary">5</span>
                  <span className="text-sm text-muted-foreground">locations</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <NavBar />
    </div>
  );
};

export default Profile;
