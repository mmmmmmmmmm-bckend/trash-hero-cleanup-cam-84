
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck = ({ children }: AuthCheckProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [navigate, user, loading, location]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

export default AuthCheck;
