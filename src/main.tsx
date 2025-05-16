
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/toaster";

// Set initial theme based on user preference or localStorage
const setInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply theme class to document root
  if (savedTheme) {
    document.documentElement.classList.add(savedTheme);
  } else if (prefersDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  }
};

// Call the function before rendering
setInitialTheme();

createRoot(document.getElementById("root")!).render(
  <App />
);
