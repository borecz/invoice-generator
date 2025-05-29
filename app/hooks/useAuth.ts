"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client"; // Your client-side Supabase instance
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
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

        // Handle auth session missing as normal state (user not logged in)
        if (error && error.message === "Auth session missing!") {
          setAuthState((prev) => ({
            ...prev,
            user: null,
            session: null,
            loading: false,
            error: null,
          }));
          return;
        }

        // Handle other errors as actual errors
        if (error) {
          console.error("useAuth: Error getting initial user:", error.message);
          setAuthState((prev) => ({ ...prev, loading: false, error }));
          return;
        }

        setAuthState((prev) => ({
          ...prev,
          user: user,
          session: user
            ? ({
                user,
                access_token: "",
                refresh_token: "",
                expires_in: 3600,
                token_type: "bearer",
                expires_at: Date.now() + 3600000,
              } as Session)
            : null,
          loading: false,
        }));
      } catch (catchError: any) {
        // Handle auth session missing as normal state
        if (catchError.message === "Auth session missing!") {
          setAuthState((prev) => ({
            ...prev,
            user: null,
            session: null,
            loading: false,
            error: null,
          }));
          return;
        }

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

        // Only handle specific events to reduce unnecessary re-renders
        if (event === "SIGNED_IN") {
          try {
            const {
              data: { user },
              error,
            } = await supabase.auth.getUser();

            // Handle auth session missing as normal state
            if (error && error.message === "Auth session missing!") {
              setAuthState({
                user: null,
                session: null,
                loading: false,
                error: null,
              });
              return;
            }

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
              setAuthState({
                user: user,
                session: user
                  ? ({
                      user,
                      access_token: "",
                      refresh_token: "",
                      expires_in: 3600,
                      token_type: "bearer",
                      expires_at: Date.now() + 3600000,
                    } as Session)
                  : null,
                loading: false,
                error: null,
              });
            }
          } catch (catchError: any) {
            // Handle auth session missing as normal state
            if (catchError.message === "Auth session missing!") {
              setAuthState({
                user: null,
                session: null,
                loading: false,
                error: null,
              });
              return;
            }

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
        // Ignore TOKEN_REFRESHED and INITIAL_SESSION events to reduce re-renders
        // as they don't change the user state significantly
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
