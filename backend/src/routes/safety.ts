import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { strictRateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest, ReportReason, ReportPriority } from '../types';

const router = Router();

// ─── Schemas ────────────────────────────────────────────────────────────────────

const reportSchema = z.object({
  reportedUserId: z.string().uuid('Invalid user ID'),
  reason: z.enum([
    'fake_profile',
    'inappropriate_content',
    'harassment',
    'spam',
    'underage',
    'other',
  ]),
  description: z.string().max(1000).optional(),
  evidenceUrls: z.array(z.string().url()).max(5).optional(),
});

const blockSchema = z.object({
  action: z.enum(['block', 'unblock', 'sync_contacts']),
  targetId: z.string().uuid('Invalid user ID').optional(),
  phoneNumbers: z.array(z.string()).optional(),
});

const appealSchema = z.object({
  strikeId: z.string().uuid('Invalid strike ID'),
  reason: z.string().min(10).max(1000, 'Appeal must be between 10 and 1000 characters'),
});

// ─── Auto-priority mapping ─────────────────────────────────────────────────────

function computeReportPriority(reason: ReportReason): ReportPriority {
  const priorityMap: Record<ReportReason, ReportPriority> = {
    underage: 'critical',
    harassment: 'high',
    fake_profile: 'medium',
    inappropriate_content: 'medium',
    spam: 'low',
    other: 'low',
  };
  return priorityMap[reason];
}

// ─── POST /v1/safety/report ─────────────────────────────────────────────────────

router.post(
  '/report',
  authenticate,
  strictRateLimit,
  validate(reportSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { reportedUserId, reason, description, evidenceUrls } = req.body;

    // Cannot report yourself
    if (reportedUserId === user.id) {
      throw new AppError(400, 'Cannot report yourself', 'SELF_REPORT');
    }

    // Check target exists
    const { data: target } = await supabase
      .from('users')
      .select('id, is_active')
      .eq('id', reportedUserId)
      .single();

    if (!target) {
      throw new AppError(404, 'Reported user not found', 'USER_NOT_FOUND');
    }

    // Check for duplicate recent report
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: recentReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('reported_user_id', reportedUserId)
      .gte('created_at', oneHourAgo)
      .limit(1)
      .maybeSingle();

    if (recentReport) {
      throw new AppError(
        400,
        'You have already reported this user recently',
        'DUPLICATE_REPORT'
      );
    }

    const priority = computeReportPriority(reason);

    // Create report
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason,
        description: description || null,
        priority,
        status: 'pending',
        evidence_urls: evidenceUrls || [],
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to create report', 'REPORT_FAILED');
    }

    // Auto-block the reported user for the reporter's safety
    const { data: existingBlock } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', reportedUserId)
      .limit(1)
      .maybeSingle();

    if (!existingBlock) {
      await supabase.from('blocks').insert({
        blocker_id: user.id,
        blocked_id: reportedUserId,
      });
    }

    // For critical reports, flag for immediate review
    if (priority === 'critical') {
      console.warn(
        `[Safety] CRITICAL REPORT: ${report.id} - Reason: ${reason} - Reporter: ${user.id} - Target: ${reportedUserId}`
      );
    }

    // Check if this user has been reported multiple times recently
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    const { count: recentReportCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('reported_user_id', reportedUserId)
      .gte('created_at', oneDayAgo);

    // Auto-suspend if 5+ reports in 24 hours
    if (recentReportCount && recentReportCount >= 5) {
      await supabase
        .from('users')
        .update({ is_suspended: true })
        .eq('id', reportedUserId);

      console.warn(
        `[Safety] AUTO-SUSPEND: User ${reportedUserId} received ${recentReportCount} reports in 24 hours`
      );
    }

    res.status(201).json({
      success: true,
      data: {
        reportId: report.id,
        priority,
        status: 'pending',
        message: 'Thank you for keeping our community safe. We will review this report.',
      },
    });
  })
);

// ─── POST /v1/safety/block ──────────────────────────────────────────────────────

router.post(
  '/block',
  authenticate,
  validate(blockSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { action, targetId, phoneNumbers } = req.body;

    switch (action) {
      case 'block': {
        if (!targetId) {
          throw new AppError(400, 'targetId is required for blocking', 'TARGET_REQUIRED');
        }

        if (targetId === user.id) {
          throw new AppError(400, 'Cannot block yourself', 'SELF_BLOCK');
        }

        // Check if already blocked
        const { data: existing } = await supabase
          .from('blocks')
          .select('id')
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetId)
          .limit(1)
          .maybeSingle();

        if (existing) {
          throw new AppError(400, 'User is already blocked', 'ALREADY_BLOCKED');
        }

        await supabase.from('blocks').insert({
          blocker_id: user.id,
          blocked_id: targetId,
        });

        // Unmatch if there's an active match
        await supabase
          .from('matches')
          .update({ status: 'unmatched' })
          .or(
            `and(user_a_id.eq.${user.id},user_b_id.eq.${targetId}),and(user_a_id.eq.${targetId},user_b_id.eq.${user.id})`
          )
          .eq('status', 'active');

        res.json({
          success: true,
          message: 'User blocked successfully',
        });
        break;
      }

      case 'unblock': {
        if (!targetId) {
          throw new AppError(400, 'targetId is required for unblocking', 'TARGET_REQUIRED');
        }

        const { error } = await supabase
          .from('blocks')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetId);

        if (error) {
          throw new AppError(500, 'Failed to unblock user', 'UNBLOCK_FAILED');
        }

        res.json({
          success: true,
          message: 'User unblocked successfully',
        });
        break;
      }

      case 'sync_contacts': {
        if (!phoneNumbers || phoneNumbers.length === 0) {
          throw new AppError(400, 'phoneNumbers array is required', 'PHONES_REQUIRED');
        }

        // Find users with these phone numbers and auto-block
        const { data: contactUsers } = await supabase
          .from('users')
          .select('id, phone')
          .in('phone', phoneNumbers)
          .neq('id', user.id);

        let blockedCount = 0;

        for (const contact of contactUsers || []) {
          const { data: existing } = await supabase
            .from('blocks')
            .select('id')
            .eq('blocker_id', user.id)
            .eq('blocked_id', contact.id)
            .limit(1)
            .maybeSingle();

          if (!existing) {
            await supabase.from('blocks').insert({
              blocker_id: user.id,
              blocked_id: contact.id,
            });
            blockedCount++;
          }
        }

        res.json({
          success: true,
          data: {
            contactsFound: contactUsers?.length || 0,
            newBlocksCreated: blockedCount,
          },
        });
        break;
      }

      default:
        throw new AppError(400, 'Invalid action', 'INVALID_ACTION');
    }
  })
);

// ─── GET /v1/safety/health ──────────────────────────────────────────────────────

router.get(
  '/health',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    // Get account status
    const { data: userData } = await supabase
      .from('users')
      .select(
        'is_active, is_suspended, is_banned, ban_expires, strikes, is_verified'
      )
      .eq('id', user.id)
      .single();

    // Get block counts
    const { count: blockedByYou } = await supabase
      .from('blocks')
      .select('*', { count: 'exact', head: true })
      .eq('blocker_id', user.id);

    const { count: blockedByOthers } = await supabase
      .from('blocks')
      .select('*', { count: 'exact', head: true })
      .eq('blocked_id', user.id);

    // Get active strikes
    const { data: strikes } = await supabase
      .from('strikes')
      .select('id, reason, status, created_at, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Get pending reports by this user
    const { count: pendingReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('reporter_id', user.id)
      .eq('status', 'pending');

    res.json({
      success: true,
      data: {
        accountStatus: {
          isActive: userData?.is_active || false,
          isSuspended: userData?.is_suspended || false,
          isBanned: userData?.is_banned || false,
          banExpires: userData?.ban_expires || null,
          isVerified: userData?.is_verified || false,
        },
        strikes: {
          total: userData?.strikes || 0,
          active: strikes || [],
        },
        blocks: {
          blockedByYou: blockedByYou || 0,
          blockedByOthers: blockedByOthers || 0,
        },
        reports: {
          pendingByYou: pendingReports || 0,
        },
      },
    });
  })
);

// ─── POST /v1/safety/appeal ─────────────────────────────────────────────────────

router.post(
  '/appeal',
  authenticate,
  strictRateLimit,
  validate(appealSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { strikeId, reason } = req.body;

    // Find the strike
    const { data: strike, error } = await supabase
      .from('strikes')
      .select('*')
      .eq('id', strikeId)
      .eq('user_id', user.id)
      .single();

    if (error || !strike) {
      throw new AppError(404, 'Strike not found', 'STRIKE_NOT_FOUND');
    }

    if (strike.status !== 'active') {
      throw new AppError(
        400,
        `Cannot appeal a strike with status: ${strike.status}`,
        'STRIKE_NOT_APPEALABLE'
      );
    }

    // Check if already appealed
    const { data: existingAppeal } = await supabase
      .from('appeals')
      .select('id')
      .eq('strike_id', strikeId)
      .limit(1)
      .maybeSingle();

    if (existingAppeal) {
      throw new AppError(400, 'This strike has already been appealed', 'ALREADY_APPEALED');
    }

    // Create appeal
    const { data: appeal, error: appealError } = await supabase
      .from('appeals')
      .insert({
        strike_id: strikeId,
        user_id: user.id,
        reason,
        status: 'pending',
      })
      .select()
      .single();

    if (appealError) {
      throw new AppError(500, 'Failed to submit appeal', 'APPEAL_FAILED');
    }

    // Update strike status
    await supabase
      .from('strikes')
      .update({ status: 'appealed' })
      .eq('id', strikeId);

    res.status(201).json({
      success: true,
      data: {
        appealId: appeal.id,
        status: 'pending',
        message:
          'Your appeal has been submitted and will be reviewed within 24-48 hours.',
      },
    });
  })
);

export default router;
