"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client'; // Your client-side Supabase instance
import type { AuthSession, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Immediately try to get the current session
    const getCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("useAuth: Error getting initial session:", error.message);
          setAuthState(prev => ({ ...prev, loading: false, error }));
          return;
        }
        console.log("useAuth: Initial session fetch successful. Session:", session);
        console.log("useAuth: Initial user:", session?.user ?? null);
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session,
          loading: false,
        }));
      } catch (catchError: any) {
        console.error("useAuth: Catch error getting initial session:", catchError.message);
        setAuthState(prev => ({ ...prev, loading: false, error: catchError }));
      }
    };

    getCurrentSession();

    // Set up the auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: onAuthStateChange event:', event);
        console.log('useAuth: onAuthStateChange session:', session);
        console.log('useAuth: onAuthStateChange user:', session?.user ?? null);
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          error: null, // Clear previous errors on new auth state
        });
      }
    );

    // Cleanup listener on component unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return authState;
}
