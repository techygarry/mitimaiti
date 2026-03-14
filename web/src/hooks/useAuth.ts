'use client';

import { useState, useEffect, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    error: null,
  });

  const supabase = getSupabaseClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const sendOtp = useCallback(
    async (phone: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        setState((prev) => ({ ...prev, loading: false }));
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to send OTP';
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return { success: false, error: message };
      }
    },
    [supabase]
  );

  const verifyOtp = useCallback(
    async (phone: string, token: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token,
          type: 'sms',
        });
        if (error) throw error;
        setState((prev) => ({
          ...prev,
          session: data.session,
          user: data.user,
          loading: false,
        }));
        return { success: true, isNewUser: !data.user?.user_metadata?.onboarded };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid OTP';
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return { success: false, error: message };
      }
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    await supabase.auth.signOut();
    setState({ session: null, user: null, loading: false, error: null });
  }, [supabase]);

  return {
    ...state,
    sendOtp,
    verifyOtp,
    logout,
    isAuthenticated: !!state.session,
  };
}
