import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { logger } from '@/lib/logger';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isSigningOut: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  isSigningOut: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsSigningOut(false);
          setLoading(false);
          
          // Navigate to landing page after sign out
          setTimeout(() => {
            try {
              // Use replace to prevent back navigation to tabs
              router.replace('/');
            } catch (error) {
              console.log('Navigation error handled:', error);
              // Fallback navigation method
              router.push('/');
            }
          }, 200);
        } else if (event === 'SIGNED_IN') {
        } else {
          // Handle all other auth events (INITIAL_SESSION, TOKEN_REFRESHED, etc.)
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      console.log('AuthContext: Starting sign out process...');
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Error signing out from Supabase', error);
      }
      
      // Clear state after successful signout
      setSession(null);
      setUser(null);
      
      console.log('AuthContext: Sign out completed successfully');
      
      // Navigate to home page
      router.replace('/');
      
    } catch (error) {
      logger.error('Unexpected error during sign out', error);
      
      // Force clear state and navigate on error
      setSession(null);
      setUser(null);
      router.replace('/');
      
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signOut,
        isSigningOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};