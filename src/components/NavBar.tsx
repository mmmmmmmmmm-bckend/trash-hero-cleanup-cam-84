
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Award, User, Star } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NavBar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/challenges', icon: Award, label: 'Challenges' },
    { path: '/points', icon: Star, label: 'Points' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link 
            to={item.path} 
            key={item.path}
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors ${
              isActive(item.path) 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'animate-pulse-green' : ''}`} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
