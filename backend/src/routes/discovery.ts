import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { redis } from '../config/redis';
import { AppError, asyncHandler } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { requirePlan, attachPlanInfo } from '../middleware/planCheck';
import { getCulturalScore } from '../services/scoring';
import { AuthenticatedRequest, Plan } from '../types';

const router = Router();

// ─── Constants ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const BOOST_DURATION_MINUTES = 30;
const PASSPORT_DURATION_HOURS = 24;

// Feed score weights by plan
const WEIGHT_FREE = {
  culturalScore: 0.6,
  completeness: 0.2,
  recency: 0.1,
  verified: 0.1,
};

const WEIGHT_PREMIUM = {
  culturalScore: 0.5,
  completeness: 0.15,
  recency: 0.1,
  verified: 0.1,
  intentMatch: 0.15,
};

// ─── Schemas ────────────────────────────────────────────────────────────────────

const boostSchema = z.object({});

const passportSchema = z.object({
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
});

// ─── Helper: Calculate age from DOB ─────────────────────────────────────────────

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ─── Helper: Compute feed score ─────────────────────────────────────────────────

interface FeedCandidate {
  userId: string;
  culturalScore: number;
  profileCompleteness: number;
  lastActiveAt: string;
  isVerified: boolean;
  isBoosted: boolean;
  intentMatch: boolean;
}

function computeFeedScore(candidate: FeedCandidate, plan: Plan): number {
  const weights = plan === 'free' ? WEIGHT_FREE : WEIGHT_PREMIUM;

  // Normalize cultural score (0-100 -> 0-1)
  const culturalNorm = candidate.culturalScore / 100;

  // Normalize completeness (0-100 -> 0-1)
  const completenessNorm = candidate.profileCompleteness / 100;

  // Recency: decay over 7 days
  const lastActive = new Date(candidate.lastActiveAt).getTime();
  const now = Date.now();
  const daysSinceActive = (now - lastActive) / (1000 * 60 * 60 * 24);
  const recencyNorm = Math.max(0, 1 - daysSinceActive / 7);

  // Verified bonus
  const verifiedNorm = candidate.isVerified ? 1 : 0;

  let score =
    culturalNorm * weights.culturalScore +
    completenessNorm * weights.completeness +
    recencyNorm * weights.recency +
    verifiedNorm * weights.verified;

  // Premium: intent match bonus
  if (plan !== 'free' && 'intentMatch' in weights) {
    score += (candidate.intentMatch ? 1 : 0) * (weights as any).intentMatch;
  }

  // Boost multiplier
  if (candidate.isBoosted) {
    score *= 1.5;
  }

  return Math.round(score * 1000) / 1000;
}

// ─── Helper: Interleave high and low scores ─────────────────────────────────────

function interleaveScores<T extends { feedScore: number }>(sorted: T[]): T[] {
  if (sorted.length <= 4) return sorted;

  const result: T[] = [];
  const high = sorted.slice(0, Math.ceil(sorted.length * 0.7));
  const low = sorted.slice(Math.ceil(sorted.length * 0.7));

  let hIdx = 0;
  let lIdx = 0;

  while (hIdx < high.length || lIdx < low.length) {
    // 3 high, 1 low pattern
    for (let i = 0; i < 3 && hIdx < high.length; i++) {
      result.push(high[hIdx++]);
    }
    if (lIdx < low.length) {
      result.push(low[lIdx++]);
    }
  }

  return result;
}

// ─── GET /v1/feed ───────────────────────────────────────────────────────────────

router.get(
  '/',
  authenticate,
  attachPlanInfo,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || PAGE_SIZE, 50);

    // 1. Get current user's profile and settings
    const [
      { data: myBasic },
      { data: mySettings },
      { data: myPrivileges },
    ] = await Promise.all([
      supabase.from('basic_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('user_privileges').select('*').eq('user_id', user.id).single(),
    ]);

    if (!myBasic) {
      throw new AppError(400, 'Complete your profile before discovering matches', 'PROFILE_INCOMPLETE');
    }

    // Determine discovery city (passport or actual)
    const passportCity = myPrivileges?.passport_city;
    const passportExpires = myPrivileges?.passport_expires
      ? new Date(myPrivileges.passport_expires)
      : null;
    const usePassport =
      passportCity && passportExpires && passportExpires > new Date();

    const discoveryCity = usePassport ? passportCity : myBasic.city;

    // 2. Get blocked users (both directions)
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    const blockedIds = new Set<string>();
    (blocks || []).forEach((b: any) => {
      blockedIds.add(b.blocker_id === user.id ? b.blocked_id : b.blocker_id);
    });

    // 3. Get already-seen users (actions by this user)
    const { data: seenActions } = await supabase
      .from('actions')
      .select('target_id')
      .eq('actor_id', user.id);

    const seenIds = new Set<string>(
      (seenActions || []).map((a: any) => a.target_id)
    );

    // 4. Build exclusion list
    const excludeIds = new Set([user.id, ...blockedIds, ...seenIds]);

    // 5. Hard filters query
    const genderPreference = mySettings?.gender_preference || 'any';
    const ageMin = mySettings?.age_min || 18;
    const ageMax = mySettings?.age_max || 50;

    // Calculate DOB range for age filter
    const now = new Date();
    const maxDob = new Date(now.getFullYear() - ageMin, now.getMonth(), now.getDate())
      .toISOString()
      .split('T')[0];
    const minDob = new Date(now.getFullYear() - ageMax - 1, now.getMonth(), now.getDate())
      .toISOString()
      .split('T')[0];

    let query = supabase
      .from('basic_profiles')
      .select(`
        user_id,
        display_name,
        date_of_birth,
        gender,
        bio,
        height_cm,
        city,
        country,
        intent,
        education,
        occupation
      `)
      .gte('date_of_birth', minDob)
      .lte('date_of_birth', maxDob);

    // Gender filter
    if (genderPreference !== 'any') {
      query = query.eq('gender', genderPreference);
    }

    // City filter (basic - can be overridden for premium)
    if (user.plan === 'free') {
      query = query.eq('city', discoveryCity);
    }

    // Premium filters from query params
    if (user.plan !== 'free') {
      const intentFilter = req.query.intent as string;
      const verifiedFilter = req.query.verified as string;
      const heightMin = req.query.heightMin as string;
      const heightMax = req.query.heightMax as string;
      const religionFilter = req.query.religion as string;
      const cityFilter = req.query.city as string;

      if (intentFilter) {
        query = query.eq('intent', intentFilter);
      }
      if (heightMin) {
        query = query.gte('height_cm', parseInt(heightMin));
      }
      if (heightMax) {
        query = query.lte('height_cm', parseInt(heightMax));
      }
      if (religionFilter) {
        query = query.eq('religion', religionFilter);
      }
      if (cityFilter) {
        query = query.eq('city', cityFilter);
      }
    }

    // Pagination: fetch more than needed to account for exclusions
    const fetchSize = limit * 3;
    query = query.limit(fetchSize);

    if (cursor) {
      query = query.gt('user_id', cursor);
    }

    const { data: candidates, error: queryError } = await query;

    if (queryError) {
      throw new AppError(500, 'Failed to fetch discovery feed', 'FEED_ERROR');
    }

    // 6. Filter out excluded users
    const filtered = (candidates || []).filter(
      (c: any) => !excludeIds.has(c.user_id)
    );

    // 7. Get user metadata for scoring
    const candidateIds = filtered.map((c: any) => c.user_id);

    if (candidateIds.length === 0) {
      res.json({
        success: true,
        data: {
          cards: [],
          cursor: null,
          hasMore: false,
        },
      });
      return;
    }

    const { data: usersMeta } = await supabase
      .from('users')
      .select('id, is_verified, profile_completeness, last_active_at')
      .in('id', candidateIds);

    const { data: privileges } = await supabase
      .from('user_privileges')
      .select('user_id, boost_active_until')
      .in('user_id', candidateIds);

    // Verified filter (premium only)
    const verifiedOnly = req.query.verified === 'true' && user.plan !== 'free';

    // 8. Score each candidate
    const metaMap = new Map<string, any>();
    (usersMeta || []).forEach((u: any) => metaMap.set(u.id, u));

    const privMap = new Map<string, any>();
    (privileges || []).forEach((p: any) => privMap.set(p.user_id, p));

    const scoredCandidates = [];

    for (const candidate of filtered) {
      const meta = metaMap.get(candidate.user_id);
      if (!meta) continue;

      if (verifiedOnly && !meta.is_verified) continue;

      const priv = privMap.get(candidate.user_id);
      const isBoosted =
        priv?.boost_active_until && new Date(priv.boost_active_until) > new Date();

      // Get cultural score
      let culturalScore = 0;
      try {
        const csResult = await getCulturalScore(user.id, candidate.user_id);
        culturalScore = csResult.total;
      } catch {
        // If cultural score fails, use 0
      }

      const feedScore = computeFeedScore(
        {
          userId: candidate.user_id,
          culturalScore,
          profileCompleteness: meta.profile_completeness || 0,
          lastActiveAt: meta.last_active_at,
          isVerified: meta.is_verified,
          isBoosted: !!isBoosted,
          intentMatch: candidate.intent === myBasic.intent,
        },
        user.plan
      );

      scoredCandidates.push({
        ...candidate,
        age: calculateAge(candidate.date_of_birth),
        culturalScore,
        isVerified: meta.is_verified,
        isBoosted: !!isBoosted,
        feedScore,
      });
    }

    // 9. Sort and interleave
    scoredCandidates.sort((a, b) => b.feedScore - a.feedScore);
    const interleaved = interleaveScores(scoredCandidates);

    // 10. Paginate
    const page = interleaved.slice(0, limit);

    // Get photos for the page
    const pageIds = page.map((c) => c.user_id);
    const { data: photos } = await supabase
      .from('photos')
      .select('user_id, url_medium, url_thumb, is_primary, sort_order')
      .in('user_id', pageIds)
      .order('sort_order');

    const photoMap = new Map<string, any[]>();
    (photos || []).forEach((p: any) => {
      if (!photoMap.has(p.user_id)) {
        photoMap.set(p.user_id, []);
      }
      photoMap.get(p.user_id)!.push(p);
    });

    // Build response cards
    const cards = page.map((c) => ({
      userId: c.user_id,
      displayName: c.display_name,
      age: c.age,
      bio: c.bio,
      city: c.city,
      country: c.country,
      intent: c.intent,
      education: c.education,
      occupation: c.occupation,
      heightCm: c.height_cm,
      culturalScore: c.culturalScore,
      isVerified: c.isVerified,
      isBoosted: c.isBoosted,
      photos: (photoMap.get(c.user_id) || []).map((p: any) => ({
        urlMedium: p.url_medium,
        urlThumb: p.url_thumb,
        isPrimary: p.is_primary,
      })),
    }));

    const lastCard = page[page.length - 1];
    const nextCursor = lastCard ? lastCard.user_id : null;
    const hasMore = interleaved.length > limit;

    res.json({
      success: true,
      data: {
        cards,
        cursor: nextCursor,
        hasMore,
      },
    });
  })
);

// ─── POST /v1/feed/boost ────────────────────────────────────────────────────────

router.post(
  '/boost',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    // Check if already boosted
    const { data: priv } = await supabase
      .from('user_privileges')
      .select('boost_active_until')
      .eq('user_id', user.id)
      .single();

    if (priv?.boost_active_until && new Date(priv.boost_active_until) > new Date()) {
      throw new AppError(400, 'You already have an active boost', 'BOOST_ACTIVE');
    }

    // Set boost expiry
    const boostUntil = new Date();
    boostUntil.setMinutes(boostUntil.getMinutes() + BOOST_DURATION_MINUTES);

    await supabase
      .from('user_privileges')
      .update({ boost_active_until: boostUntil.toISOString() })
      .eq('user_id', user.id);

    // Cache in Redis for fast lookup
    await redis.set(
      `boost:${user.id}`,
      '1',
      'EX',
      BOOST_DURATION_MINUTES * 60
    );

    res.json({
      success: true,
      data: {
        boostActiveUntil: boostUntil.toISOString(),
        durationMinutes: BOOST_DURATION_MINUTES,
      },
    });
  })
);

// ─── POST /v1/feed/passport ─────────────────────────────────────────────────────

router.post(
  '/passport',
  authenticate,
  requirePlan('gold', 'platinum'),
  validate(passportSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { city, country } = req.body;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PASSPORT_DURATION_HOURS);

    await supabase
      .from('user_privileges')
      .update({
        passport_city: city,
        passport_expires: expiresAt.toISOString(),
      })
      .eq('user_id', user.id);

    res.json({
      success: true,
      data: {
        passportCity: city,
        passportCountry: country,
        expiresAt: expiresAt.toISOString(),
      },
    });
  })
);

export default router;
