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
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{6,14}$/,
      'Phone must be in E.164 format (e.g. +919876543210)'
    ),
});

const verifySchema = z.object({
  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{6,14}$/,
      'Phone must be in E.164 format (e.g. +919876543210)'
    ),
  token: z
    .string()
    .min(6, 'OTP must be at least 6 characters')
    .max(6, 'OTP must be at most 6 characters'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const deleteSchema = z.object({
  action: z.enum(['logout', 'delete']),
  reason: z.string().max(500).optional(),
});

// ─── POST /v1/auth/login ────────────────────────────────────────────────────────
// Sends a phone OTP via Supabase Auth (Twilio under the hood).
// No age-gate here — that's checked during onboarding.

router.post(
  '/login',
  strictRateLimit,
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        // Supabase sends the OTP via Twilio
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('[Auth] Supabase OTP error:', JSON.stringify({ message: error.message, status: error.status, name: error.name }));
      // Surface rate-limit or provider errors cleanly
      if (error.message.includes('rate') || error.status === 429) {
        throw new AppError(
          429,
          'Too many OTP requests. Please wait before trying again.',
          'OTP_RATE_LIMITED'
        );
      }
      throw new AppError(
        500,
        'Failed to send verification code. Please try again.',
        'OTP_SEND_FAILED'
      );
    }

    res.json({
      success: true,
      message: 'Verification code sent',
    });
  })
);

// ─── POST /v1/auth/verify ───────────────────────────────────────────────────────
// Verifies the OTP, provisions new users, refreshes returning users.

router.post(
  '/verify',
  strictRateLimit,
  validate(verifySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { phone, token } = req.body;

    // Verify OTP through Supabase Auth
    const {
      data: { session, user: authUser },
      error: authError,
    } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (authError || !authUser || !session) {
      throw new AppError(
        401,
        'Invalid or expired verification code',
        'OTP_INVALID'
      );
    }

    // ── Check if user already exists in our database ──
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (existingUser) {
      // ── Returning user ──

      // If account was scheduled for deletion, auto-recover on login
      const updates: Record<string, any> = {
        last_active: new Date().toISOString(),
      };

      if (existingUser.deletion_requested) {
        updates.deletion_requested = false;
        updates.deletion_scheduled_for = null;
        updates.is_active = true;

        // Re-enable discovery
        await supabase
          .from('user_settings')
          .update({ discovery_enabled: true })
          .eq('user_id', existingUser.id);
      }

      await supabase.from('users').update(updates).eq('id', existingUser.id);

      // Clear any JWT blacklist for this user
      await redis.del(`jwt_blacklist:${authUser.id}`);

      res.json({
        success: true,
        data: {
          user: {
            id: existingUser.id,
            authId: existingUser.auth_id,
            phone: existingUser.phone,
            isVerified: existingUser.is_verified,
            profileCompleteness: existingUser.profile_completeness,
            isNew: false,
          },
          session: {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at,
          },
        },
      });
    } else {
      // ── New user ──

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_id: authUser.id,
          phone,
          is_verified: false,
          is_active: true,
          is_banned: false,
          is_hidden: false,
          profile_completeness: 0,
          strikes: 0,
          deletion_requested: false,
          last_active: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError || !newUser) {
        throw new AppError(
          500,
          'Failed to create user account',
          'USER_CREATE_FAILED'
        );
      }

      const userId = newUser.id;

      // Create default settings, privileges, and safety rows in parallel
      const [settingsResult, privilegesResult, safetyResult] =
        await Promise.all([
          supabase.from('user_settings').insert({
            user_id: userId,
            discovery_enabled: true,
            show_online_status: true,
            show_distance: true,
            push_notifications: true,
            email_notifications: false,
            age_min: 18,
            age_max: 50,
            distance_km: 100,
            gender_preference: 'everyone',
          }),

          supabase.from('user_privileges').insert({
            user_id: userId,
            daily_likes: 50,
            daily_super_likes: 1,
            daily_rewinds: 10,
            daily_comments: 5,
            likes_used: 0,
            super_likes_used: 0,
            rewinds_used: 0,
            comments_used: 0,
            last_reset_at: new Date().toISOString(),
          }),

          supabase.from('user_safety').insert({
            user_id: userId,
            is_suspended: false,
            is_permanently_banned: false,
            strikes: 0,
            last_reported_at: null,
            suspension_until: null,
          }),
        ]);

      // Check for insertion failures (non-critical but log-worthy)
      if (settingsResult.error) {
        console.error(
          '[Auth] Failed to create default settings:',
          settingsResult.error.message
        );
      }
      if (privilegesResult.error) {
        console.error(
          '[Auth] Failed to create default privileges:',
          privilegesResult.error.message
        );
      }
      if (safetyResult.error) {
        console.error(
          '[Auth] Failed to create safety row:',
          safetyResult.error.message
        );
      }

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            authId: newUser.auth_id,
            phone: newUser.phone,
            isVerified: false,
            profileCompleteness: 0,
            isNew: true,
          },
          session: {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at,
          },
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

    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !session) {
      throw new AppError(
        401,
        'Invalid or expired refresh token',
        'REFRESH_INVALID'
      );
    }

    // Check if user's JWT is blacklisted (logged out)
    const blacklisted = await redis.get(
      `jwt_blacklist:${session.user.id}`
    );
    if (blacklisted) {
      throw new AppError(401, 'Session has been revoked', 'SESSION_REVOKED');
    }

    // Verify user still exists and is in good standing
    const { data: user } = await supabase
      .from('users')
      .select('id, is_active, is_banned')
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

    // Check suspension via user_safety
    const { data: safety } = await supabase
      .from('user_safety')
      .select('is_suspended, suspension_until, is_permanently_banned')
      .eq('user_id', user.id)
      .single();

    if (safety?.is_permanently_banned) {
      throw new AppError(
        403,
        'Account is permanently banned',
        'ACCOUNT_BANNED'
      );
    }

    if (safety?.is_suspended && safety.suspension_until) {
      const suspendedUntil = new Date(safety.suspension_until);
      if (suspendedUntil > new Date()) {
        throw new AppError(
          403,
          `Account is suspended until ${suspendedUntil.toISOString()}`,
          'ACCOUNT_SUSPENDED'
        );
      }
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
// action: 'logout' → blacklist JWT in Redis
// action: 'delete' → soft-delete: mark for deletion in 30 days, hide from discovery

router.post(
  '/delete',
  authenticate,
  validate(deleteSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { action, reason } = req.body;

    switch (action) {
      case 'logout': {
        // Blacklist the JWT for 7 days (matching typical token lifetime)
        await redis.set(
          `jwt_blacklist:${user.authId}`,
          '1',
          'EX',
          604800 // 7 days in seconds
        );

        res.json({
          success: true,
          message: 'Logged out successfully',
        });
        break;
      }

      case 'delete': {
        const deleteDate = new Date();
        deleteDate.setDate(deleteDate.getDate() + 30);

        // Mark user for deletion and hide from discovery
        await supabase
          .from('users')
          .update({
            deletion_requested: true,
            deletion_scheduled_for: deleteDate.toISOString(),
            is_hidden: true,
          })
          .eq('id', user.id);

        // Disable discovery so they don't appear in feeds
        await supabase
          .from('user_settings')
          .update({ discovery_enabled: false })
          .eq('user_id', user.id);

        // Blacklist the JWT
        await redis.set(
          `jwt_blacklist:${user.authId}`,
          '1',
          'EX',
          604800
        );

        // Store deletion reason if provided
        if (reason) {
          await supabase.from('deletion_feedback').insert({
            user_id: user.id,
            reason,
            scheduled_at: deleteDate.toISOString(),
          });
        }

        res.json({
          success: true,
          message:
            'Account scheduled for deletion in 30 days. Log in again to recover your account.',
          data: {
            deletionScheduledFor: deleteDate.toISOString(),
          },
        });
        break;
      }

      default:
        throw new AppError(400, 'Invalid action', 'INVALID_ACTION');
    }
  })
);

export default router;
