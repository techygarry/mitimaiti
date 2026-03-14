import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { redis } from '../config/redis';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest, AuthUser, UserRow } from '../types';

const LAST_ACTIVE_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Authentication middleware.
 * - Extracts Bearer token from Authorization header
 * - Verifies the token with Supabase Auth
 * - Checks the Redis JWT blacklist
 * - Looks up the user in PostgreSQL by auth_id
 * - Attaches req.user with essential fields
 * - Debounced update of last_active_at
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or malformed authorization token', 'AUTH_MISSING');
  }

  const token = authHeader.slice(7);

  if (!token) {
    throw new AppError(401, 'Authorization token is empty', 'AUTH_EMPTY');
  }

  // Verify with Supabase Auth
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !authUser) {
    throw new AppError(401, 'Invalid or expired token', 'AUTH_INVALID');
  }

  // Check Redis blacklist
  const blacklisted = await redis.get(`jwt_blacklist:${authUser.id}`);
  if (blacklisted) {
    throw new AppError(401, 'Token has been revoked', 'AUTH_REVOKED');
  }

  // Lookup user in PostgreSQL
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('id, auth_id, plan, plan_expires, account_type, phone, is_active, is_suspended, is_banned')
    .eq('auth_id', authUser.id)
    .single();

  if (dbError || !dbUser) {
    throw new AppError(404, 'User account not found', 'USER_NOT_FOUND');
  }

  const user = dbUser as UserRow & { plan_expires: string | null };

  if (!user.is_active) {
    throw new AppError(403, 'Account is deactivated', 'ACCOUNT_INACTIVE');
  }

  if (user.is_banned) {
    throw new AppError(403, 'Account is banned', 'ACCOUNT_BANNED');
  }

  if (user.is_suspended) {
    throw new AppError(403, 'Account is suspended', 'ACCOUNT_SUSPENDED');
  }

  // Attach user to request
  const reqUser: AuthUser = {
    id: user.id,
    authId: user.auth_id,
    plan: user.plan,
    accountType: user.account_type,
    phone: user.phone,
  };

  (req as AuthenticatedRequest).user = reqUser;

  // Debounced last_active_at update
  const lastActiveKey = `last_active:${user.id}`;
  const lastUpdate = await redis.get(lastActiveKey);
  const now = Date.now();

  if (!lastUpdate || now - parseInt(lastUpdate, 10) > LAST_ACTIVE_DEBOUNCE_MS) {
    // Fire and forget - don't block the request
    redis.set(lastActiveKey, now.toString(), 'EX', 600).catch(() => {});
    supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id)
      .then(({ error: updateErr }) => {
        if (updateErr) {
          console.error('[Auth] Failed to update last_active_at:', updateErr.message);
        }
      });
  }

  next();
}

/**
 * Admin-only middleware. Must be used after authenticate.
 */
export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const user = (req as AuthenticatedRequest).user;

  const { data: adminCheck } = await supabase
    .from('users')
    .select('account_type')
    .eq('id', user.id)
    .single();

  // Check for admin role in a separate admin table or special account type
  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!adminRole) {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  next();
}

export default authenticate;
