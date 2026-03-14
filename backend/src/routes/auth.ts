import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { redis } from '../config/redis';
import { AppError, asyncHandler } from '../utils/errors';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { strictRateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ─── Schemas ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  fcmToken: z.string().optional(),
  deviceInfo: z
    .object({
      platform: z.enum(['ios', 'android', 'web']).optional(),
      version: z.string().optional(),
    })
    .optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const deleteSchema = z.object({
  action: z.enum(['logout', 'delete', 'recover']),
  reason: z.string().optional(),
});

// ─── POST /v1/auth/login ────────────────────────────────────────────────────────

router.post(
  '/login',
  strictRateLimit,
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token, fcmToken, deviceInfo } = req.body;

    // Verify the token with Supabase Auth
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      throw new AppError(401, 'Invalid authentication token', 'AUTH_INVALID');
    }

    // Check if user already exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;

      // Check if account is scheduled for deletion and recover
      if (existingUser.delete_scheduled_at) {
        await supabase
          .from('users')
          .update({
            delete_scheduled_at: null,
            is_active: true,
          })
          .eq('id', userId);
      }

      // Update FCM token and last active
      const updates: Record<string, any> = {
        last_active_at: new Date().toISOString(),
      };
      if (fcmToken) {
        updates.fcm_token = fcmToken;
      }

      await supabase.from('users').update(updates).eq('id', userId);

      // Clear any JWT blacklist for this user (re-login)
      await redis.del(`jwt_blacklist:${authUser.id}`);

      res.json({
        success: true,
        data: {
          user: {
            id: existingUser.id,
            authId: existingUser.auth_id,
            phone: existingUser.phone,
            plan: existingUser.plan,
            accountType: existingUser.account_type,
            isVerified: existingUser.is_verified,
            isNew: false,
          },
          token,
        },
      });
    } else {
      // Create new user
      const phone = authUser.phone || '';

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_id: authUser.id,
          phone,
          account_type: 'self',
          plan: 'free',
          is_verified: false,
          is_active: true,
          is_suspended: false,
          is_banned: false,
          strikes: 0,
          profile_completeness: 0,
          fcm_token: fcmToken || null,
          last_active_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError || !newUser) {
        throw new AppError(500, 'Failed to create user account', 'USER_CREATE_FAILED');
      }

      userId = newUser.id;

      // Create default settings
      await supabase.from('user_settings').insert({
        user_id: userId,
        discovery_enabled: true,
        show_online_status: true,
        show_distance: true,
        push_notifications: true,
        email_notifications: false,
        age_min: 18,
        age_max: 50,
        distance_km: 100,
        gender_preference: 'any',
      });

      // Create default privileges
      await supabase.from('user_privileges').insert({
        user_id: userId,
        daily_likes: 10,
        daily_super_likes: 1,
        daily_rewinds: 0,
        daily_comments: 3,
        likes_used: 0,
        super_likes_used: 0,
        rewinds_used: 0,
        comments_used: 0,
        last_reset_at: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            authId: newUser.auth_id,
            phone: newUser.phone,
            plan: newUser.plan,
            accountType: newUser.account_type,
            isVerified: newUser.is_verified,
            isNew: true,
          },
          token,
        },
      });
    }
  })
);

// ─── POST /v1/auth/refresh ──────────────────────────────────────────────────────

router.post(
  '/refresh',
  strictRateLimit,
  validate(refreshSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    // Verify the session is still valid with Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !session) {
      throw new AppError(401, 'Invalid or expired refresh token', 'REFRESH_INVALID');
    }

    // Check if user is blacklisted
    const blacklisted = await redis.get(`jwt_blacklist:${session.user.id}`);
    if (blacklisted) {
      throw new AppError(401, 'Session has been revoked', 'SESSION_REVOKED');
    }

    // Verify user exists in our database
    const { data: user } = await supabase
      .from('users')
      .select('id, is_active, is_banned, is_suspended')
      .eq('auth_id', session.user.id)
      .single();

    if (!user) {
      throw new AppError(404, 'User account not found', 'USER_NOT_FOUND');
    }

    if (!user.is_active) {
      throw new AppError(403, 'Account is deactivated', 'ACCOUNT_INACTIVE');
    }

    if (user.is_banned) {
      throw new AppError(403, 'Account is banned', 'ACCOUNT_BANNED');
    }

    res.json({
      success: true,
      data: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
      },
    });
  })
);

// ─── POST /v1/auth/delete ───────────────────────────────────────────────────────

router.post(
  '/delete',
  authenticate,
  validate(deleteSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { action, reason } = req.body;

    switch (action) {
      case 'logout': {
        // Add to JWT blacklist (expires in 7 days, matching typical JWT expiry)
        await redis.set(`jwt_blacklist:${user.authId}`, '1', 'EX', 604800);

        // Clear FCM token
        await supabase
          .from('users')
          .update({ fcm_token: null })
          .eq('id', user.id);

        res.json({
          success: true,
          message: 'Logged out successfully',
        });
        break;
      }

      case 'delete': {
        // Schedule account for deletion in 30 days
        const deleteDate = new Date();
        deleteDate.setDate(deleteDate.getDate() + 30);

        await supabase
          .from('users')
          .update({
            delete_scheduled_at: deleteDate.toISOString(),
            is_active: false,
            fcm_token: null,
          })
          .eq('id', user.id);

        // Blacklist the JWT
        await redis.set(`jwt_blacklist:${user.authId}`, '1', 'EX', 604800);

        // Store deletion reason
        if (reason) {
          await supabase.from('deletion_feedback').insert({
            user_id: user.id,
            reason,
            scheduled_at: deleteDate.toISOString(),
          });
        }

        // Disable discovery
        await supabase
          .from('user_settings')
          .update({ discovery_enabled: false })
          .eq('user_id', user.id);

        res.json({
          success: true,
          message: 'Account scheduled for deletion in 30 days. Log in again to recover.',
          deleteScheduledAt: deleteDate.toISOString(),
        });
        break;
      }

      case 'recover': {
        // Recover a deletion-scheduled account
        const { data: currentUser } = await supabase
          .from('users')
          .select('delete_scheduled_at')
          .eq('id', user.id)
          .single();

        if (!currentUser?.delete_scheduled_at) {
          throw new AppError(400, 'Account is not scheduled for deletion', 'NOT_SCHEDULED');
        }

        await supabase
          .from('users')
          .update({
            delete_scheduled_at: null,
            is_active: true,
          })
          .eq('id', user.id);

        // Re-enable discovery
        await supabase
          .from('user_settings')
          .update({ discovery_enabled: true })
          .eq('user_id', user.id);

        // Clear blacklist
        await redis.del(`jwt_blacklist:${user.authId}`);

        res.json({
          success: true,
          message: 'Account recovered successfully',
        });
        break;
      }

      default:
        throw new AppError(400, 'Invalid action', 'INVALID_ACTION');
    }
  })
);

export default router;
