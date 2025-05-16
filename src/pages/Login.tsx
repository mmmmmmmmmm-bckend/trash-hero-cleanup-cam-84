
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import EmailConfirmNotification from '@/components/auth/EmailConfirmNotification';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'sent' | 'confirmed' | 'error' | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      navigate('/', { replace: true });
    }

    // Check URL parameters for email confirmation
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'signup' && hashParams.get('email')) {
      setEmail(hashParams.get('email') || '');
      setConfirmationStatus('sent');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setConfirmationStatus('pending');
        } else {
          setError(error.message);
        }
        return;
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });
      
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background leaf-pattern">
      <div className="w-full max-w-md bg-card p-6 rounded-lg shadow-md border border-border">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/lovable-uploads/b7067255-97a6-42dd-8870-786af090bc03.png" 
            alt="TrashHero Logo" 
            className="h-16 w-auto mb-2" 
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">
              <span className="text-[#1bd0af]">TRASH</span>
              <span className="text-gray-400">HERO</span>
            </h1>
            <p className="text-muted-foreground">Sign in to continue</p>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input 
              id="password"
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        {confirmationStatus && (
          <EmailConfirmNotification 
            email={email} 
            status={confirmationStatus} 
          />
        )}
        
        <p className="text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
      
      <p className="text-muted-foreground text-sm mt-8 text-center">
        TrashHero - Make the world cleaner, one pickup at a time
      </p>
    </div>
  );
};

export default Login;
