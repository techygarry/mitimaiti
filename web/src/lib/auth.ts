/**
 * Auth API client — all auth operations go through the backend.
 * The backend owns Supabase interaction; the frontend never calls Supabase auth directly.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  authId: string;
  phone: string;
  isVerified: boolean;
  profileCompleteness: number;
  isNew: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    session: AuthSession;
  };
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
}

// ─── Token Storage ───────────────────────────────────────────────────────────
// Tokens live in memory (not localStorage) to reduce XSS surface.
// A copy goes to sessionStorage so a page refresh doesn't force re-login.

let memoryTokens: AuthSession | null = null;

export function getTokens(): AuthSession | null {
  if (memoryTokens) return memoryTokens;

  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem('mm_session');
  if (stored) {
    try {
      memoryTokens = JSON.parse(stored);
      return memoryTokens;
    } catch {
      sessionStorage.removeItem('mm_session');
    }
  }
  return null;
}

export function setTokens(session: AuthSession): void {
  memoryTokens = session;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('mm_session', JSON.stringify(session));
  }
}

export function clearTokens(): void {
  memoryTokens = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('mm_session');
    sessionStorage.removeItem('mm_user');
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem('mm_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('mm_user', JSON.stringify(user));
  }
}

// ─── Token Refresh ───────────────────────────────────────────────────────────

let refreshPromise: Promise<AuthSession | null> | null = null;

export async function refreshAccessToken(): Promise<AuthSession | null> {
  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const tokens = getTokens();
    if (!tokens?.refreshToken) {
      clearTokens();
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!res.ok) {
        clearTokens();
        return null;
      }

      const json: RefreshResponse = await res.json();
      const newSession: AuthSession = {
        accessToken: json.data.accessToken,
        refreshToken: json.data.refreshToken,
        expiresAt: json.data.expiresAt,
      };

      setTokens(newSession);
      return newSession;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Auth check ──────────────────────────────────────────────────────────────

export function isTokenExpired(): boolean {
  const tokens = getTokens();
  if (!tokens?.expiresAt) return true;
  // Consider expired 60s before actual expiry for safety margin
  return Date.now() / 1000 >= tokens.expiresAt - 60;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<{ success: boolean; error?: string; code?: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Failed to send verification code',
        code: json.code,
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

export async function verifyOtp(
  phone: string,
  token: string
): Promise<{ success: boolean; user?: AuthUser; session?: AuthSession; error?: string; code?: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, token }),
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Verification failed',
        code: json.code,
      };
    }

    const { user, session } = (json as AuthResponse).data;
    setTokens(session);
    setStoredUser(user);

    return { success: true, user, session };
  } catch {
    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

export async function logout(): Promise<void> {
  const tokens = getTokens();
  if (tokens?.accessToken) {
    try {
      await fetch(`${API_URL}/auth/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // Best-effort server logout — clear local state regardless
    }
  }
  clearTokens();
}
