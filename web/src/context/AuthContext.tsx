'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  type AuthUser,
  type AuthSession,
  getTokens,
  getStoredUser,
  clearTokens,
  isTokenExpired,
  refreshAccessToken,
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  logout as apiLogout,
} from '@/lib/auth';

// ─── Context shape ───────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  /** Send OTP to phone (E.164). Returns error string on failure. */
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  /** Verify OTP. On success stores session and redirects. */
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; isNew?: boolean; error?: string }>;
  /** Logout — clears tokens, blacklists JWT on server, redirects to welcome. */
  logout: () => Promise<void>;
  /** True when the user has a valid session. */
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Public routes that don't need auth ──────────────────────────────────────

const PUBLIC_PATHS = ['/', '/welcome', '/auth/phone', '/auth/otp'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Schedule silent refresh before token expires ──

  const scheduleRefresh = useCallback((expiresAt: number) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const now = Date.now() / 1000;
    // Refresh 2 minutes before expiry, minimum 10s from now
    const refreshIn = Math.max((expiresAt - now - 120) * 1000, 10_000);

    refreshTimerRef.current = setTimeout(async () => {
      const newSession = await refreshAccessToken();
      if (newSession) {
        setSession(newSession);
        scheduleRefresh(newSession.expiresAt);
      } else {
        // Refresh failed — force re-login
        setUser(null);
        setSession(null);
        if (!isPublicPath(window.location.pathname)) {
          router.replace('/auth/phone');
        }
      }
    }, refreshIn);
  }, [router]);

  // ── Initialize from stored tokens on mount ──

  useEffect(() => {
    const storedTokens = getTokens();
    const storedUser = getStoredUser();

    if (storedTokens && storedUser) {
      if (isTokenExpired()) {
        // Token expired — try refresh
        refreshAccessToken().then((refreshed) => {
          if (refreshed) {
            setSession(refreshed);
            setUser(storedUser);
            scheduleRefresh(refreshed.expiresAt);
          } else {
            clearTokens();
          }
          setLoading(false);
        });
      } else {
        setSession(storedTokens);
        setUser(storedUser);
        scheduleRefresh(storedTokens.expiresAt);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [scheduleRefresh]);

  // ── Client-side route guard ──

  useEffect(() => {
    if (loading) return;

    const authenticated = !!session && !!user;

    if (!authenticated && !isPublicPath(pathname)) {
      router.replace('/auth/phone');
    }

    // Redirect authenticated users away from auth pages to discover
    // Skip /auth/otp — let the OTP page handle its own post-verify redirect
    // (new users go to /onboarding, returning users go to /discover)
    if (authenticated && (pathname === '/auth/phone' || pathname === '/welcome')) {
      router.replace('/discover');
    }
  }, [loading, session, user, pathname, router]);

  // ── Auth actions ──

  const sendOtp = useCallback(async (phone: string) => {
    return apiSendOtp(phone);
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, token: string) => {
      const result = await apiVerifyOtp(phone, token);
      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
        // Tokens and user are already persisted by apiVerifyOtp — just schedule refresh
        scheduleRefresh(result.session.expiresAt);
        return { success: true, isNew: result.user.isNew };
      }
      return { success: false, error: result.error };
    },
    [scheduleRefresh]
  );

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    await apiLogout();
    setUser(null);
    setSession(null);
    // Clear the middleware auth cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'mm_authenticated=; path=/; max-age=0';
    }
    router.replace('/welcome');
  }, [router]);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    sendOtp,
    verifyOtp,
    logout,
    isAuthenticated: !!session && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
