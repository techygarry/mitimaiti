import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../utils/errors';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest, ModerationAction } from '../types';
import { sendTemplateNotification } from '../services/notifications';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

// ─── Schemas ────────────────────────────────────────────────────────────────────

const moderationActionSchema = z.object({
  reportId: z.string().uuid('Invalid report ID'),
  action: z.enum(['dismiss', 'remove_content', 'suspend', 'ban']),
  reason: z.string().min(1).max(500),
  suspendDays: z.number().min(1).max(365).optional(),
  banPermanent: z.boolean().optional(),
});

const dailyPromptSchema = z.object({
  question: z.string().min(5).max(200),
  category: z.string().min(1).max(50),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
    .optional(),
});

// ─── GET /v1/admin/queue ────────────────────────────────────────────────────────

router.get(
  '/queue',
  asyncHandler(async (req: Request, res: Response) => {
    const status = (req.query.status as string) || 'pending';
    const priority = req.query.priority as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('priority', { ascending: false }) // Critical first
      .order('created_at', { ascending: true }) // FIFO within priority
      .range(offset, offset + limit - 1);

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: reports, count, error } = await query;

    if (error) {
      throw new AppError(500, 'Failed to fetch moderation queue', 'QUEUE_ERROR');
    }

    // Get stats
    const [
      { count: pendingCount },
      { count: criticalCount },
      { count: highCount },
      { count: todayCount },
    ] = await Promise.all([
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('priority', 'critical'),
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('priority', 'high'),
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'actioned')
        .gte('reviewed_at', new Date().toISOString().split('T')[0]),
    ]);

    res.json({
      success: true,
      data: {
        reports: reports || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        stats: {
          pending: pendingCount || 0,
          critical: criticalCount || 0,
          high: highCount || 0,
          reviewedToday: todayCount || 0,
        },
      },
    });
  })
);

// ─── GET /v1/admin/queue/:id ────────────────────────────────────────────────────

router.get(
  '/queue/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get the report
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !report) {
      throw new AppError(404, 'Report not found', 'REPORT_NOT_FOUND');
    }

    // Get reporter and reported user context
    const [
      { data: reporter },
      { data: reported },
      { data: reporterBasic },
      { data: reportedBasic },
      { data: reportedPhotos },
      { data: reportedUser },
      { data: priorReports },
      { data: priorStrikes },
    ] = await Promise.all([
      supabase
        .from('users')
        .select('id, phone, created_at, is_verified')
        .eq('id', report.reporter_id)
        .single(),
      supabase
        .from('users')
        .select('id, phone, created_at, is_verified, is_suspended, is_banned, strikes')
        .eq('id', report.reported_user_id)
        .single(),
      supabase
        .from('basic_profiles')
        .select('display_name, city, country')
        .eq('user_id', report.reporter_id)
        .single(),
      supabase
        .from('basic_profiles')
        .select('display_name, bio, city, country')
        .eq('user_id', report.reported_user_id)
        .single(),
      supabase
        .from('photos')
        .select('url_medium, is_primary')
        .eq('user_id', report.reported_user_id)
        .order('sort_order'),
      supabase
        .from('users')
        .select('*')
        .eq('id', report.reported_user_id)
        .single(),
      supabase
        .from('reports')
        .select('id, reason, priority, status, created_at')
        .eq('reported_user_id', report.reported_user_id)
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('strikes')
        .select('id, reason, status, created_at')
        .eq('user_id', report.reported_user_id)
        .order('created_at', { ascending: false }),
    ]);

    res.json({
      success: true,
      data: {
        report,
        reporter: {
          ...reporter,
          displayName: reporterBasic?.display_name,
          city: reporterBasic?.city,
        },
        reported: {
          ...reported,
          displayName: reportedBasic?.display_name,
          bio: reportedBasic?.bio,
          city: reportedBasic?.city,
          country: reportedBasic?.country,
          photos: reportedPhotos || [],
        },
        priorReports: priorReports || [],
        priorStrikes: priorStrikes || [],
      },
    });
  })
);

// ─── POST /v1/admin/action ──────────────────────────────────────────────────────

router.post(
  '/action',
  validate(moderationActionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as AuthenticatedRequest).user;
    const { reportId, action, reason, suspendDays, banPermanent } = req.body;

    // Get the report
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !report) {
      throw new AppError(404, 'Report not found', 'REPORT_NOT_FOUND');
    }

    if (report.status !== 'pending') {
      throw new AppError(400, 'Report has already been reviewed', 'ALREADY_REVIEWED');
    }

    const reportedUserId = report.reported_user_id;

    // Process the moderation action
    switch (action as ModerationAction) {
      case 'dismiss': {
        // Update report status
        await supabase
          .from('reports')
          .update({
            status: 'dismissed',
            moderator_id: admin.id,
            resolution_note: reason,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', reportId);

        break;
      }

      case 'remove_content': {
        // Mark report as actioned
        await supabase
          .from('reports')
          .update({
            status: 'actioned',
            moderator_id: admin.id,
            resolution_note: reason,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', reportId);

        // Add a strike to the user
        await supabase.from('strikes').insert({
          user_id: reportedUserId,
          reason: `Content removed: ${reason}`,
          report_id: reportId,
          status: 'active',
          expires_at: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(), // 90 days
        });

        // Increment strike count
        await supabase.rpc('increment_strikes', { uid: reportedUserId });

        // Notify user
        await sendTemplateNotification('strike_received', reportedUserId);

        break;
      }

      case 'suspend': {
        const days = suspendDays || 7;
        const suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + days);

        // Suspend user
        await supabase
          .from('users')
          .update({
            is_suspended: true,
            ban_expires: suspendUntil.toISOString(),
          })
          .eq('id', reportedUserId);

        // Mark report
        await supabase
          .from('reports')
          .update({
            status: 'actioned',
            moderator_id: admin.id,
            resolution_note: `Suspended ${days} days: ${reason}`,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', reportId);

        // Add strike
        await supabase.from('strikes').insert({
          user_id: reportedUserId,
          reason: `Suspended ${days} days: ${reason}`,
          report_id: reportId,
          status: 'active',
          expires_at: suspendUntil.toISOString(),
        });

        await supabase.rpc('increment_strikes', { uid: reportedUserId });
        await sendTemplateNotification('strike_received', reportedUserId);

        break;
      }

      case 'ban': {
        const banExpires = banPermanent
          ? null
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        // Ban user
        await supabase
          .from('users')
          .update({
            is_banned: true,
            is_active: false,
            ban_expires: banExpires,
          })
          .eq('id', reportedUserId);

        // Mark report
        await supabase
          .from('reports')
          .update({
            status: 'actioned',
            moderator_id: admin.id,
            resolution_note: `Banned${banPermanent ? ' permanently' : ''}: ${reason}`,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', reportId);

        // Add strike
        await supabase.from('strikes').insert({
          user_id: reportedUserId,
          reason: `Banned${banPermanent ? ' permanently' : ''}: ${reason}`,
          report_id: reportId,
          status: 'active',
        });

        // Disable discovery
        await supabase
          .from('user_settings')
          .update({ discovery_enabled: false })
          .eq('user_id', reportedUserId);

        break;
      }
    }

    res.json({
      success: true,
      data: {
        reportId,
        action,
        reportedUserId,
        message: `Moderation action "${action}" applied successfully`,
      },
    });
  })
);

// ─── GET /v1/admin/user/:id ─────────────────────────────────────────────────────

router.get(
  '/user/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const [
      { data: user },
      { data: basic },
      { data: sindhi },
      { data: chatti },
      { data: personality },
      { data: photos },
      { data: settings },
      { data: privileges },
      { data: reports },
      { data: strikes },
      { data: subscriptions },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', id).single(),
      supabase.from('basic_profiles').select('*').eq('user_id', id).single(),
      supabase.from('sindhi_profiles').select('*').eq('user_id', id).single(),
      supabase.from('chatti_profiles').select('*').eq('user_id', id).single(),
      supabase.from('personality_profiles').select('*').eq('user_id', id).single(),
      supabase.from('photos').select('*').eq('user_id', id).order('sort_order'),
      supabase.from('user_settings').select('*').eq('user_id', id).single(),
      supabase.from('user_privileges').select('*').eq('user_id', id).single(),
      supabase
        .from('reports')
        .select('*')
        .eq('reported_user_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('strikes')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', id)
        .order('started_at', { ascending: false })
        .limit(10),
    ]);

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Get action stats
    const [
      { count: likesGiven },
      { count: likesReceived },
      { count: matchCount },
      { count: messagesSent },
    ] = await Promise.all([
      supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('actor_id', id)
        .in('kind', ['like', 'super_like']),
      supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', id)
        .in('kind', ['like', 'super_like']),
      supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user_a_id.eq.${id},user_b_id.eq.${id}`)
        .eq('status', 'active'),
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', id),
    ]);

    res.json({
      success: true,
      data: {
        user,
        profile: { basic, sindhi, chatti, personality },
        photos: photos || [],
        settings,
        privileges,
        reports: reports || [],
        strikes: strikes || [],
        subscriptions: subscriptions || [],
        stats: {
          likesGiven: likesGiven || 0,
          likesReceived: likesReceived || 0,
          activeMatches: matchCount || 0,
          messagesSent: messagesSent || 0,
        },
      },
    });
  })
);

// ─── POST /v1/admin/daily-prompt ────────────────────────────────────────────────

router.post(
  '/daily-prompt',
  validate(dailyPromptSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { question, category, date } = req.body;

    const promptDate = date || new Date().toISOString().split('T')[0];

    // Deactivate any existing prompt for this date
    await supabase
      .from('daily_prompts')
      .update({ is_active: false })
      .eq('date', promptDate);

    // Create new prompt
    const { data: prompt, error } = await supabase
      .from('daily_prompts')
      .insert({
        question,
        category,
        date: promptDate,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to create daily prompt', 'PROMPT_CREATE_FAILED');
    }

    res.status(201).json({
      success: true,
      data: {
        promptId: prompt.id,
        question,
        category,
        date: promptDate,
      },
    });
  })
);

export default router;
