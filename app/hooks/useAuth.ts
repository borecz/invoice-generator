"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client"; // Your client-side Supabase instance
import type { AuthSession, User } from "@supabase/supabase-js";

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
    // Immediately try to get the current user (more secure than getSession)
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("useAuth: Error getting initial user:", error.message);
          setAuthState((prev) => ({ ...prev, loading: false, error }));
          return;
        }
        console.log("useAuth: Initial user fetch successful. User:", user);
        setAuthState((prev) => ({
          ...prev,
          user: user,
          session: user ? { user, access_token: null } : null, // Create session-like object for compatibility
          loading: false,
        }));
      } catch (catchError: any) {
        console.error(
          "useAuth: Catch error getting initial user:",
          catchError.message
        );
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: catchError,
        }));
      }
    };

    getCurrentUser();

    // Set up the auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("useAuth: onAuthStateChange event:", event);

        // For security, re-fetch user data using getUser() instead of trusting session data
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          try {
            const {
              data: { user },
              error,
            } = await supabase.auth.getUser();
            if (error) {
              console.error(
                "useAuth: Error re-fetching user after auth change:",
                error.message
              );
              setAuthState({
                user: null,
                session: null,
                loading: false,
                error,
              });
            } else {
              console.log("useAuth: Re-fetched user after auth change:", user);
              setAuthState({
                user: user,
                session: user ? { user, access_token: null } : null,
                loading: false,
                error: null,
              });
            }
          } catch (catchError: any) {
            console.error(
              "useAuth: Catch error re-fetching user:",
              catchError.message
            );
            setAuthState({
              user: null,
              session: null,
              loading: false,
              error: catchError,
            });
          }
        } else if (event === "SIGNED_OUT") {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
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
