
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

  return (
    <header className={`sticky top-0 z-50 w-full flex justify-between items-center px-4 py-3 ${
      isHomePage 
        ? 'bg-gradient-to-r from-sidebar-primary to-accent dark:from-sidebar-primary/90 dark:to-accent/80 text-white' 
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
        <h1 className={`font-bold ${isHomePage ? 'text-2xl' : 'text-xl'}`}>
          {isHomePage ? 'TrashHero' : title}
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
};

export default Header;
