// ============================================================
// DRIFTFIELD: Auth Context & Hook
// ============================================================
// Provides useAuth() hook with user, profile, loading state,
// and auth methods. Wraps the entire app.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    // Reset daily probe counter if new day
    if (data.probes_last_reset !== new Date().toISOString().split('T')[0]) {
      data.probes_fired_today = 0;
    }

    setProfile(data);
    return data;
  }, []);

  // Refresh profile (call after mutations)
  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      return await fetchProfile(session.user.id);
    }
  }, [session, fetchProfile]);

  // Init: get session + subscribe to auth changes
  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        fetchProfile(s.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s);
        if (s?.user?.id) {
          await fetchProfile(s.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Auth methods — no-op if supabase not configured
  const notConfigured = { data: null, error: new Error('Supabase not configured') };

  const signUp = async (email, password) => {
    if (!supabase) return notConfigured;
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    if (!supabase) return notConfigured;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signInWithMagicLink = async (email) => {
    if (!supabase) return notConfigured;
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    if (!supabase) return notConfigured;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  const updateProfile = async (updates) => {
    if (!supabase || !session?.user?.id) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
    if (data) setProfile(data);
    return { data, error };
  };

  const value = {
    // State
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAuthenticated: !!session,
    isPremium:
      profile?.subscription_tier === 'premium' &&
      profile?.subscription_status === 'active',
    supabaseConfigured,
    // Methods
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
