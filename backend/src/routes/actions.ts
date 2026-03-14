import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { redis } from '../config/redis';
import { AppError, asyncHandler } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { attachPlanInfo } from '../middleware/planCheck';
import { getCulturalScore } from '../services/scoring';
import { sendTemplateNotification, queueLikeNotification } from '../services/notifications';
import { AuthenticatedRequest, ActionKind } from '../types';

const router = Router();

// ─── Schemas ────────────────────────────────────────────────────────────────────

const actionSchema = z.object({
  targetId: z.string().uuid('Invalid target user ID'),
  kind: z.enum(['like', 'super_like', 'pass', 'comment']),
  commentText: z.string().max(500).optional(),
  promptQuestion: z.string().max(200).optional(),
});

const promptAnswerSchema = z.object({
  promptId: z.string().uuid('Invalid prompt ID'),
  answer: z.string().min(1).max(500, 'Answer must be 500 characters or less'),
});

// ─── Limits by plan ─────────────────────────────────────────────────────────────

const DAILY_LIMITS: Record<string, Record<ActionKind, number>> = {
  free: { like: 10, super_like: 1, pass: Infinity, comment: 3 },
  gold: { like: 30, super_like: 5, pass: Infinity, comment: 15 },
  platinum: { like: Infinity, super_like: 10, pass: Infinity, comment: Infinity },
};

// ─── POST /v1/action ────────────────────────────────────────────────────────────

router.post(
  '/',
  authenticate,
  attachPlanInfo,
  validate(actionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { targetId, kind, commentText, promptQuestion } = req.body;

    // Cannot action on yourself
    if (targetId === user.id) {
      throw new AppError(400, 'Cannot perform action on yourself', 'SELF_ACTION');
    }

    // Check target exists and is active
    const { data: target } = await supabase
      .from('users')
      .select('id, is_active, is_banned')
      .eq('id', targetId)
      .single();

    if (!target || !target.is_active || target.is_banned) {
      throw new AppError(404, 'User not found', 'TARGET_NOT_FOUND');
    }

    // Check if blocked
    const { data: block } = await supabase
      .from('blocks')
      .select('id')
      .or(
        `and(blocker_id.eq.${user.id},blocked_id.eq.${targetId}),and(blocker_id.eq.${targetId},blocked_id.eq.${user.id})`
      )
      .limit(1)
      .maybeSingle();

    if (block) {
      throw new AppError(403, 'Cannot interact with this user', 'BLOCKED');
    }

    // Check duplicate action
    const { data: existingAction } = await supabase
      .from('actions')
      .select('id')
      .eq('actor_id', user.id)
      .eq('target_id', targetId)
      .neq('kind', 'pass')
      .limit(1)
      .maybeSingle();

    if (existingAction && kind !== 'pass') {
      throw new AppError(400, 'You have already acted on this profile', 'DUPLICATE_ACTION');
    }

    // Check daily limits
    const { data: privileges } = await supabase
      .from('user_privileges')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!privileges) {
      throw new AppError(500, 'User privileges not found', 'PRIVILEGES_MISSING');
    }

    const limits = DAILY_LIMITS[user.plan] || DAILY_LIMITS.free;
    const limitForKind = limits[kind as ActionKind];

    const usedField = `${kind === 'super_like' ? 'super_likes' : kind + 's'}_used` as string;
    const currentUsed = (privileges as any)[usedField] || 0;

    if (currentUsed >= limitForKind) {
      throw new AppError(
        429,
        `Daily ${kind.replace('_', ' ')} limit reached. ${user.plan === 'free' ? 'Upgrade for more.' : 'Try again tomorrow.'}`,
        'DAILY_LIMIT_REACHED'
      );
    }

    // Record the action
    const { data: action, error: actionError } = await supabase
      .from('actions')
      .insert({
        actor_id: user.id,
        target_id: targetId,
        kind,
        comment_text: kind === 'comment' ? commentText : null,
        prompt_question: promptQuestion || null,
      })
      .select()
      .single();

    if (actionError) {
      throw new AppError(500, 'Failed to record action', 'ACTION_FAILED');
    }

    // Increment used count
    await supabase
      .from('user_privileges')
      .update({ [usedField]: currentUsed + 1 })
      .eq('user_id', user.id);

    // Check for mutual match (only for like/super_like)
    let isMatch = false;
    let matchId: string | null = null;

    if (kind === 'like' || kind === 'super_like') {
      // Check if target has also liked/super-liked us
      const { data: reciprocal } = await supabase
        .from('actions')
        .select('id')
        .eq('actor_id', targetId)
        .eq('target_id', user.id)
        .in('kind', ['like', 'super_like'])
        .limit(1)
        .maybeSingle();

      if (reciprocal) {
        isMatch = true;

        // Get cultural score for the match
        let culturalScore = 0;
        try {
          const cs = await getCulturalScore(user.id, targetId);
          culturalScore = cs.total;
        } catch {
          // Continue without score
        }

        // Create match
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user_a_id: user.id < targetId ? user.id : targetId,
            user_b_id: user.id < targetId ? targetId : user.id,
            status: 'active',
            matched_at: new Date().toISOString(),
            cultural_score: culturalScore,
          })
          .select()
          .single();

        if (matchError) {
          console.error('[Actions] Failed to create match:', matchError.message);
        } else {
          matchId = match.id;

          // Send match notifications to both users
          const { data: myBasic } = await supabase
            .from('basic_profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .single();

          const { data: targetBasic } = await supabase
            .from('basic_profiles')
            .select('display_name')
            .eq('user_id', targetId)
            .single();

          await Promise.all([
            sendTemplateNotification('new_match', user.id, {
              name: targetBasic?.display_name || 'Someone',
            }),
            sendTemplateNotification('new_match', targetId, {
              name: myBasic?.display_name || 'Someone',
            }),
          ]);
        }
      } else {
        // Notify target of the like (batched for regular likes)
        if (kind === 'super_like') {
          await sendTemplateNotification('new_super_like', targetId);
        } else {
          await queueLikeNotification(targetId);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        actionId: action.id,
        kind,
        isMatch,
        matchId,
      },
    });
  })
);

// ─── POST /v1/action/rewind ─────────────────────────────────────────────────────

router.post(
  '/rewind',
  authenticate,
  attachPlanInfo,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    // Check rewind limit
    const { data: privileges } = await supabase
      .from('user_privileges')
      .select('daily_rewinds, rewinds_used')
      .eq('user_id', user.id)
      .single();

    if (!privileges) {
      throw new AppError(500, 'Privileges not found', 'PRIVILEGES_MISSING');
    }

    // Free users get 0 rewinds, gold gets 3, platinum gets unlimited
    const rewindLimits: Record<string, number> = {
      free: 0,
      gold: 3,
      platinum: Infinity,
    };

    const maxRewinds = rewindLimits[user.plan] || 0;

    if (maxRewinds === 0) {
      throw new AppError(403, 'Rewind is a premium feature', 'PREMIUM_REQUIRED');
    }

    if (privileges.rewinds_used >= maxRewinds) {
      throw new AppError(429, 'Daily rewind limit reached', 'REWIND_LIMIT');
    }

    // Find the last pass action
    const { data: lastAction, error } = await supabase
      .from('actions')
      .select('*')
      .eq('actor_id', user.id)
      .eq('kind', 'pass')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastAction) {
      throw new AppError(404, 'No recent pass to rewind', 'NO_REWIND');
    }

    // Check if it was within the last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (new Date(lastAction.created_at) < fiveMinAgo) {
      throw new AppError(400, 'Can only rewind actions from the last 5 minutes', 'REWIND_EXPIRED');
    }

    // Delete the pass action
    await supabase.from('actions').delete().eq('id', lastAction.id);

    // Increment rewinds used
    await supabase
      .from('user_privileges')
      .update({ rewinds_used: privileges.rewinds_used + 1 })
      .eq('user_id', user.id);

    res.json({
      success: true,
      data: {
        rewoundTargetId: lastAction.target_id,
        rewindsRemaining: maxRewinds === Infinity ? -1 : maxRewinds - privileges.rewinds_used - 1,
      },
    });
  })
);

// ─── POST /v1/action/prompt ─────────────────────────────────────────────────────

router.post(
  '/prompt',
  authenticate,
  validate(promptAnswerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { promptId, answer } = req.body;

    // Verify prompt exists and is active
    const { data: prompt } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('id', promptId)
      .eq('is_active', true)
      .single();

    if (!prompt) {
      throw new AppError(404, 'Prompt not found or not active', 'PROMPT_NOT_FOUND');
    }

    // Check if already answered today
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('prompt_answers')
      .select('id')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .gte('created_at', `${today}T00:00:00`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Update existing answer
      await supabase
        .from('prompt_answers')
        .update({ answer })
        .eq('id', existing.id);

      res.json({
        success: true,
        data: { answerId: existing.id, updated: true },
      });
      return;
    }

    // Save answer
    const { data: savedAnswer, error } = await supabase
      .from('prompt_answers')
      .insert({
        user_id: user.id,
        prompt_id: promptId,
        answer,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to save prompt answer', 'PROMPT_SAVE_FAILED');
    }

    res.status(201).json({
      success: true,
      data: { answerId: savedAnswer.id, updated: false },
    });
  })
);

// ─── GET /v1/inbox ──────────────────────────────────────────────────────────────

router.get(
  '/inbox',
  authenticate,
  attachPlanInfo,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const tab = (req.query.tab as string) || 'likes'; // 'likes' | 'matches'
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    if (tab === 'matches') {
      // Get matches
      let query = supabase
        .from('matches')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .eq('status', 'active')
        .order('matched_at', { ascending: false })
        .limit(limit);

      if (cursor) {
        query = query.lt('matched_at', cursor);
      }

      const { data: matches } = await query;

      // Enrich with profile data
      const enrichedMatches = [];
      for (const match of matches || []) {
        const otherId =
          match.user_a_id === user.id ? match.user_b_id : match.user_a_id;

        const [{ data: otherBasic }, { data: otherPhotos }, { data: lastMessage }] =
          await Promise.all([
            supabase
              .from('basic_profiles')
              .select('display_name, city, country')
              .eq('user_id', otherId)
              .single(),
            supabase
              .from('photos')
              .select('url_thumb, is_primary')
              .eq('user_id', otherId)
              .eq('is_primary', true)
              .limit(1),
            supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .eq('match_id', match.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('match_id', match.id)
          .neq('sender_id', user.id)
          .eq('is_read', false);

        enrichedMatches.push({
          matchId: match.id,
          userId: otherId,
          displayName: otherBasic?.display_name || 'Unknown',
          city: otherBasic?.city,
          photo: otherPhotos?.[0]?.url_thumb || null,
          culturalScore: match.cultural_score,
          matchedAt: match.matched_at,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                sentAt: lastMessage.created_at,
                isYou: lastMessage.sender_id === user.id,
              }
            : null,
          unreadCount: unreadCount || 0,
        });
      }

      const lastMatch = matches?.[matches.length - 1];

      res.json({
        success: true,
        data: {
          tab: 'matches',
          items: enrichedMatches,
          cursor: lastMatch?.matched_at || null,
          hasMore: (matches?.length || 0) >= limit,
        },
      });
    } else {
      // Get likes received
      let query = supabase
        .from('actions')
        .select('*')
        .eq('target_id', user.id)
        .in('kind', ['like', 'super_like'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data: likes } = await query;

      const isFree = user.plan === 'free';

      const enrichedLikes = [];
      for (const like of likes || []) {
        // Check if already matched
        const { data: match } = await supabase
          .from('matches')
          .select('id')
          .or(
            `and(user_a_id.eq.${user.id},user_b_id.eq.${like.actor_id}),and(user_a_id.eq.${like.actor_id},user_b_id.eq.${user.id})`
          )
          .limit(1)
          .maybeSingle();

        if (match) continue; // Skip already-matched likes

        const { data: actorBasic } = await supabase
          .from('basic_profiles')
          .select('display_name, city, country, date_of_birth')
          .eq('user_id', like.actor_id)
          .single();

        const { data: actorPhoto } = await supabase
          .from('photos')
          .select('url_thumb, url_medium')
          .eq('user_id', like.actor_id)
          .eq('is_primary', true)
          .limit(1)
          .maybeSingle();

        enrichedLikes.push({
          actionId: like.id,
          userId: like.actor_id,
          kind: like.kind,
          commentText: like.comment_text,
          promptQuestion: like.prompt_question,
          displayName: isFree ? null : actorBasic?.display_name,
          city: isFree ? null : actorBasic?.city,
          age: isFree
            ? null
            : actorBasic?.date_of_birth
              ? new Date().getFullYear() - new Date(actorBasic.date_of_birth).getFullYear()
              : null,
          photo: isFree ? null : actorPhoto?.url_medium,
          photoBlurred: isFree ? actorPhoto?.url_thumb : null,
          blurred: isFree,
          createdAt: like.created_at,
        });
      }

      const lastLike = likes?.[likes.length - 1];

      // Get total likes count
      const { count: totalLikes } = await supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', user.id)
        .in('kind', ['like', 'super_like']);

      res.json({
        success: true,
        data: {
          tab: 'likes',
          totalLikes: totalLikes || 0,
          items: enrichedLikes,
          cursor: lastLike?.created_at || null,
          hasMore: (likes?.length || 0) >= limit,
          blurred: isFree,
        },
      });
    }
  })
);

export default router;
