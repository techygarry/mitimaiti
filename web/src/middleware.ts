import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

/**
 * Next.js Edge Middleware — route protection + Supabase session refresh.
 */

const PUBLIC_PATHS = ['/', '/welcome', '/auth'];
const STATIC_PREFIXES = ['/_next', '/favicon', '/api', '/images', '/icons'];

function isPublic(pathname: string): boolean {
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (PUBLIC_PATHS.some((p) => pathname === p)) return true;
  if (pathname.startsWith('/auth/')) return true;
  // Allow onboarding (new users arrive here right after verify)
  if (pathname.startsWith('/onboarding')) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // DEV-ONLY: skip auth in local dev so the mock-driven UI is testable without a backend.
  // No effect in production (NODE_ENV is 'production' there).
  if (process.env.NODE_ENV === 'development') {
    return updateSession(request);
  }

  // Let public & static routes through (still refresh session if cookie exists)
  if (isPublic(pathname)) {
    return updateSession(request);
  }

  // Check for Supabase auth cookie (set by @supabase/ssr)
  const hasAuthCookie = request.cookies.getAll().some(
    (c) => c.name.includes('-auth-token') || c.name.includes('sb-')
  );

  // Also check a lightweight custom cookie we set on verify
  const hasSessionMarker = request.cookies.has('mm_authenticated');

  if (!hasAuthCookie && !hasSessionMarker) {
    const loginUrl = new URL('/auth/phone', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Refresh the Supabase session cookie
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
