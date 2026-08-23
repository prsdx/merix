"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CurrentUser } from "./types";
import { api, clearToken, setToken } from "./api";
import { createClient } from "./supabase/client";

interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (orgName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await api.getMe();
      setUser(currentUser);
      setError(null);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          setToken(session.access_token);
          await refreshUser();
        } else {
          const localToken = typeof window !== "undefined" ? localStorage.getItem("merix_token") : null;
          if (localToken) {
            await refreshUser();
          } else {
            if (mounted) setLoading(false);
          }
        }

        // Listen for Supabase auth state changes (e.g. after OAuth redirect)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.access_token) {
            setToken(session.access_token);
            await refreshUser();
          } else if (_event === "SIGNED_OUT") {
            clearToken();
            if (mounted) setUser(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err: unknown) {
        // If Supabase client initialization throws (e.g. during local build with dummy envs), fallback gracefully
        const localToken = typeof window !== "undefined" ? localStorage.getItem("merix_token") : null;
        if (localToken) {
          refreshUser();
        } else {
          if (mounted) setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      await refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log in";
      setError(msg);
      throw err;
    }
  };

  const signup = async (orgName: string, email: string, password: string) => {
    setError(null);
    try {
      const res = await api.signup(orgName, email, password);
      setToken(res.access_token);
      await refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign up";
      setError(msg);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate Google sign-in";
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore signout error
    }
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        loginWithGoogle,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
