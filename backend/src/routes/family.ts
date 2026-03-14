import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';
import { sendTemplateNotification } from '../services/notifications';

const router = Router();

// ─── Schemas ────────────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  label: z.string().max(50).optional(),
});

const joinSchema = z.object({
  code: z
    .string()
    .regex(/^MM-[A-Z0-9]{4}$/, 'Invalid invite code format (expected MM-XXXX)'),
});

const updateMemberSchema = z.object({
  canViewMatches: z.boolean().optional(),
  canSuggest: z.boolean().optional(),
  canChat: z.boolean().optional(),
  isPaused: z.boolean().optional(),
  revoke: z.boolean().optional(),
});

const suggestSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
  suggestedUserId: z.string().uuid('Invalid suggested user ID'),
  note: z.string().max(200).optional(),
});

// ─── Helper: Generate invite code ───────────────────────────────────────────────

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MM-${code}`;
}

// ─── POST /v1/family/invite ─────────────────────────────────────────────────────

router.post(
  '/invite',
  authenticate,
  validate(inviteSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    // Check active invite count (max 3)
    const { data: activeInvites, error: countError } = await supabase
      .from('family_invites')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      throw new AppError(500, 'Failed to check invite count', 'INVITE_CHECK_FAILED');
    }

    if (activeInvites && activeInvites.length >= 3) {
      throw new AppError(
        400,
        'Maximum 3 active invites allowed. Revoke an existing invite first.',
        'MAX_INVITES'
      );
    }

    // Generate unique code
    let code: string;
    let attempts = 0;
    do {
      code = generateInviteCode();
      const { data: existing } = await supabase
        .from('family_invites')
        .select('id')
        .eq('code', code)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new AppError(500, 'Failed to generate unique code', 'CODE_GEN_FAILED');
    }

    // Set expiry to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invite, error: insertError } = await supabase
      .from('family_invites')
      .insert({
        user_id: user.id,
        code,
        is_active: true,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new AppError(500, 'Failed to create invite', 'INVITE_CREATE_FAILED');
    }

    res.status(201).json({
      success: true,
      data: {
        inviteId: invite.id,
        code,
        expiresAt: expiresAt.toISOString(),
        activeInvites: (activeInvites?.length || 0) + 1,
      },
    });
  })
);

// ─── POST /v1/family/join ───────────────────────────────────────────────────────

router.post(
  '/join',
  authenticate,
  validate(joinSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { code } = req.body;

    // Find active invite
    const { data: invite, error } = await supabase
      .from('family_invites')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !invite) {
      throw new AppError(404, 'Invalid or expired invite code', 'INVITE_NOT_FOUND');
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('family_invites')
        .update({ is_active: false })
        .eq('id', invite.id);
      throw new AppError(400, 'This invite code has expired', 'INVITE_EXPIRED');
    }

    // Cannot join your own invite
    if (invite.user_id === user.id) {
      throw new AppError(400, 'Cannot join your own family invite', 'SELF_JOIN');
    }

    // Check if already a family member for this user
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', invite.user_id)
      .eq('family_account_id', user.id)
      .limit(1)
      .maybeSingle();

    if (existingMember) {
      throw new AppError(400, 'You are already a family member', 'ALREADY_MEMBER');
    }

    // Create family member record
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .insert({
        user_id: invite.user_id,
        family_account_id: user.id,
        role: 'member',
        can_view_matches: true,
        can_suggest: true,
        can_chat: false,
        is_paused: false,
      })
      .select()
      .single();

    if (memberError) {
      throw new AppError(500, 'Failed to join family', 'JOIN_FAILED');
    }

    // Update invite with family account id
    await supabase
      .from('family_invites')
      .update({ family_account_id: user.id })
      .eq('id', invite.id);

    // Update the joining user's account type
    await supabase
      .from('users')
      .update({ account_type: 'family' })
      .eq('id', user.id);

    // Notify the user who created the invite
    await sendTemplateNotification('family_invite_received', invite.user_id);

    res.status(201).json({
      success: true,
      data: {
        memberId: member.id,
        role: 'member',
        permissions: {
          canViewMatches: true,
          canSuggest: true,
          canChat: false,
        },
      },
    });
  })
);

// ─── GET /v1/family ─────────────────────────────────────────────────────────────

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const view = (req.query.view as string) || 'members'; // 'members' | 'feed' | 'suggestions'

    if (view === 'members') {
      // Get family members
      const { data: members } = await supabase
        .from('family_members')
        .select('*')
        .or(`user_id.eq.${user.id},family_account_id.eq.${user.id}`);

      // Enrich with user info
      const enriched = [];
      for (const member of members || []) {
        const memberId =
          member.family_account_id === user.id
            ? member.user_id
            : member.family_account_id;

        // Get only the name from basic profile for family member display
        const { data: basic } = await supabase
          .from('basic_profiles')
          .select('display_name')
          .eq('user_id', memberId)
          .single();

        enriched.push({
          id: member.id,
          userId: memberId,
          displayName: basic?.display_name || 'Family Member',
          role: member.role,
          canViewMatches: member.can_view_matches,
          canSuggest: member.can_suggest,
          canChat: member.can_chat,
          isPaused: member.is_paused,
          createdAt: member.created_at,
        });
      }

      // Get active invites
      const { data: invites } = await supabase
        .from('family_invites')
        .select('id, code, is_active, expires_at, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true);

      res.json({
        success: true,
        data: {
          view: 'members',
          members: enriched,
          invites: invites || [],
        },
      });
    } else if (view === 'feed') {
      // Family can see the user's discovery feed (if permitted)
      const { data: membership } = await supabase
        .from('family_members')
        .select('*, user_id')
        .eq('family_account_id', user.id)
        .eq('is_paused', false)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        throw new AppError(403, 'No active family connection found', 'NO_FAMILY_ACCESS');
      }

      if (!membership.can_view_matches) {
        throw new AppError(403, 'You do not have permission to view matches', 'PERMISSION_DENIED');
      }

      // Return the linked user's matches
      const linkedUserId = membership.user_id;

      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a_id.eq.${linkedUserId},user_b_id.eq.${linkedUserId}`)
        .eq('status', 'active')
        .order('matched_at', { ascending: false })
        .limit(20);

      const enrichedMatches = [];
      for (const match of matches || []) {
        const otherId =
          match.user_a_id === linkedUserId ? match.user_b_id : match.user_a_id;

        const { data: otherBasic } = await supabase
          .from('basic_profiles')
          .select('display_name, city, country, education, occupation')
          .eq('user_id', otherId)
          .single();

        enrichedMatches.push({
          matchId: match.id,
          userId: otherId,
          displayName: otherBasic?.display_name || 'Unknown',
          city: otherBasic?.city,
          country: otherBasic?.country,
          education: otherBasic?.education,
          occupation: otherBasic?.occupation,
          culturalScore: match.cultural_score,
          matchedAt: match.matched_at,
        });
      }

      res.json({
        success: true,
        data: {
          view: 'feed',
          linkedUserId,
          matches: enrichedMatches,
        },
      });
    } else if (view === 'suggestions') {
      // Get family suggestions
      const { data: suggestions } = await supabase
        .from('family_suggestions')
        .select('*')
        .or(`target_user_id.eq.${user.id},suggested_by.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      const enriched = [];
      for (const suggestion of suggestions || []) {
        const { data: suggestedBasic } = await supabase
          .from('basic_profiles')
          .select('display_name, city, country')
          .eq('user_id', suggestion.suggested_user_id)
          .single();

        enriched.push({
          id: suggestion.id,
          suggestedUserId: suggestion.suggested_user_id,
          displayName: suggestedBasic?.display_name || 'Unknown',
          city: suggestedBasic?.city,
          note: suggestion.note,
          status: suggestion.status,
          suggestedByYou: suggestion.suggested_by === user.id,
          createdAt: suggestion.created_at,
        });
      }

      res.json({
        success: true,
        data: {
          view: 'suggestions',
          suggestions: enriched,
        },
      });
    } else {
      throw new AppError(400, 'Invalid view parameter. Use: members, feed, suggestions', 'INVALID_VIEW');
    }
  })
);

// ─── PATCH /v1/family/:id ───────────────────────────────────────────────────────

router.patch(
  '/:id',
  authenticate,
  validate(updateMemberSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { id } = req.params;
    const { canViewMatches, canSuggest, canChat, isPaused, revoke } = req.body;

    // Find the family member record
    const { data: member, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !member) {
      throw new AppError(404, 'Family member not found', 'MEMBER_NOT_FOUND');
    }

    // Verify ownership - only the account owner can update permissions
    if (member.user_id !== user.id) {
      throw new AppError(403, 'Only the account owner can modify family permissions', 'NOT_OWNER');
    }

    if (revoke) {
      // Remove family member
      await supabase.from('family_members').delete().eq('id', id);

      // If no more family members, revert account type
      const { data: remaining } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_account_id', member.family_account_id);

      if (!remaining || remaining.length === 0) {
        await supabase
          .from('users')
          .update({ account_type: 'self' })
          .eq('id', member.family_account_id);
      }

      res.json({
        success: true,
        message: 'Family member removed',
      });
      return;
    }

    // Update permissions
    const updates: Record<string, any> = {};
    if (canViewMatches !== undefined) updates.can_view_matches = canViewMatches;
    if (canSuggest !== undefined) updates.can_suggest = canSuggest;
    if (canChat !== undefined) updates.can_chat = canChat;
    if (isPaused !== undefined) updates.is_paused = isPaused;

    if (Object.keys(updates).length === 0) {
      throw new AppError(400, 'No updates provided', 'EMPTY_UPDATE');
    }

    const { data: updated, error: updateError } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new AppError(500, 'Failed to update family member', 'UPDATE_FAILED');
    }

    res.json({
      success: true,
      data: {
        id: updated.id,
        canViewMatches: updated.can_view_matches,
        canSuggest: updated.can_suggest,
        canChat: updated.can_chat,
        isPaused: updated.is_paused,
      },
    });
  })
);

// ─── POST /v1/family/suggest ────────────────────────────────────────────────────

router.post(
  '/suggest',
  authenticate,
  validate(suggestSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { targetUserId, suggestedUserId, note } = req.body;

    // Verify the user is a family member with suggest permission
    const { data: membership } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_account_id', user.id)
      .eq('user_id', targetUserId)
      .eq('is_paused', false)
      .single();

    // Allow if user is the target (reviewing suggestions) or a family member (suggesting)
    if (!membership && targetUserId !== user.id) {
      throw new AppError(
        403,
        'You are not authorized to suggest for this user',
        'SUGGEST_UNAUTHORIZED'
      );
    }

    if (membership && !membership.can_suggest) {
      throw new AppError(403, 'You do not have suggestion permission', 'SUGGEST_DENIED');
    }

    // Check if suggestion already exists
    const { data: existing } = await supabase
      .from('family_suggestions')
      .select('id')
      .eq('target_user_id', targetUserId)
      .eq('suggested_user_id', suggestedUserId)
      .eq('suggested_by', user.id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      throw new AppError(400, 'This suggestion already exists', 'DUPLICATE_SUGGESTION');
    }

    // Create suggestion
    const { data: suggestion, error } = await supabase
      .from('family_suggestions')
      .insert({
        target_user_id: targetUserId,
        suggested_user_id: suggestedUserId,
        suggested_by: user.id,
        note: note || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to create suggestion', 'SUGGESTION_FAILED');
    }

    // Notify the target user
    await sendTemplateNotification('family_suggestion', targetUserId);

    res.status(201).json({
      success: true,
      data: {
        suggestionId: suggestion.id,
        status: 'pending',
      },
    });
  })
);

export default router;
