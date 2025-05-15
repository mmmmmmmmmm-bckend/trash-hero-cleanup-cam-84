
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

type SignUpResponse = {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: Error | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userProfile: any; // Full profile data including avatar_url
  signUp: (email: string, password: string, userData: any) => Promise<SignUpResponse>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>; // Function to refresh profile data
  updateProfilePicture: (userId: string, imageUrl: string) => Promise<void>; // New function to update profile picture
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Function to refresh profile data that can be called from other components
  const refreshProfile = async () => {
    if (!user) return;
    
    const profileData = await fetchUserProfile(user.id);
    if (profileData) {
      setUserProfile(profileData);
    }
  };

  // New function to update profile picture
  const updateProfilePicture = async (userId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating profile picture:', error);
        throw error;
      }
      
      // Refresh the profile data to get the updated avatar
      await refreshProfile();
    } catch (error) {
      console.error('Error in updateProfilePicture:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Defer role check with setTimeout to avoid Supabase auth deadlock
          setTimeout(() => {
            checkUserRole(currentSession.user.id);
            fetchUserProfile(currentSession.user.id).then(profile => {
              if (profile) {
                setUserProfile(profile);
              }
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setUserProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        checkUserRole(currentSession.user.id);
        fetchUserProfile(currentSession.user.id).then(profile => {
          if (profile) {
            setUserProfile(profile);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return;
      }
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<SignUpResponse> => {
    setLoading(true);
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (result.error) throw result.error;
      
      toast({
        title: "Account created successfully",
        description: "Please check your email to confirm your account.",
      });
      
      navigate('/');
      return result;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      return {
        data: null,
        error
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred during sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userProfile,
      signUp, 
      signIn, 
      signOut, 
      loading, 
      isAdmin,
      refreshProfile,
      updateProfilePicture
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
