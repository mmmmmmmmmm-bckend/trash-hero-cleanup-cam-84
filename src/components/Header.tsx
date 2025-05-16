
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

const Header = ({ title, showBack = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProfilePage = location.pathname === '/profile';

  return (
    <header className={`sticky top-0 z-50 w-full flex justify-between items-center px-4 py-3 ${
      isHomePage 
        ? 'bg-transparent text-primary-foreground' 
        : 'bg-background dark:bg-background/95 backdrop-blur-sm border-b'
    }`}>
      <div className="flex items-center">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="mr-2 p-1 rounded-full hover:bg-white/20"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {isHomePage ? (
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/b7067255-97a6-42dd-8870-786af090bc03.png" alt="TrashHero Logo" className="h-8 w-auto" />
            <h1 className="font-bold text-2xl">
              <span className="text-[#1bd0af]">TRASH</span>
              <span className="text-gray-400">HERO</span>
            </h1>
          </div>
        ) : (
          <h1 className="font-bold text-xl">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {isProfilePage && (
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 rounded-full hover:bg-muted/60 transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
