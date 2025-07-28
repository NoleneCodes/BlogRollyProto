
import { useState, useEffect } from 'react';
import { supabaseAuth } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabaseAuth.getSession();
        if (error) {
          console.error('Initial session error:', error);
          setAuthState({
            user: null,
            loading: false,
            error: error.message
          });
        } else if (session?.user) {
          setAuthState({
            user: session.user,
            loading: false,
            error: null
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
        setAuthState({
          user: null,
          loading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };

    getInitialSession();

    const { data: authListener } = supabaseAuth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state change:', event, session?.user?.email);
          
          if (session?.user) {
            setAuthState({
              user: session.user,
              loading: false,
              error: null
            });
          } else {
            setAuthState({
              user: null,
              loading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setAuthState({
            user: null,
            loading: false,
            error: 'Authentication error occurred'
          });
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabaseAuth.signUp(email, password, metadata);
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = 'Sign up failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabaseAuth.signIn(email, password);
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
        return { error };
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = 'Sign in failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      await supabaseAuth.signOut();
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    } catch (err) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Sign out failed' }));
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut
  };
};
