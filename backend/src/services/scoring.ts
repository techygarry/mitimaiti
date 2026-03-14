import { redis } from '../config/redis';
import { supabase } from '../config/supabase';
import {
  CulturalScoreResult,
  CulturalBadge,
  ChattiProfileRow,
  SindhiProfileRow,
  BasicProfileRow,
} from '../types';

const CACHE_TTL_SECONDS = 3600; // 1 hour

/**
 * Build a canonical cache key so score(A,B) === score(B,A).
 */
function cacheKey(idA: string, idB: string): string {
  const [first, second] = idA < idB ? [idA, idB] : [idB, idA];
  return `cultural_score:${first}:${second}`;
}

// ─── Dimension Scorers ─────────────────────────────────────────────────────────

/**
 * Family Values (max 25 pts)
 * Same family_values = 25, adjacent = 15, opposite = 5
 */
function scoreFamilyValues(
  a: ChattiProfileRow | null,
  b: ChattiProfileRow | null
): number {
  if (!a || !b) return 0;

  const values = ['traditional', 'moderate', 'liberal'] as const;
  const idxA = values.indexOf(a.family_values);
  const idxB = values.indexOf(b.family_values);

  if (idxA === -1 || idxB === -1) return 0;

  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return 25;
  if (diff === 1) return 15;
  return 5;
}

/**
 * Language (max 20 pts)
 * Considers mother tongue match, dialect, and fluency level.
 */
function scoreLanguage(
  a: SindhiProfileRow | null,
  b: SindhiProfileRow | null
): number {
  if (!a || !b) return 0;

  let score = 0;

  // Mother tongue match (8 pts)
  if (
    a.mother_tongue &&
    b.mother_tongue &&
    a.mother_tongue.toLowerCase() === b.mother_tongue.toLowerCase()
  ) {
    score += 8;
  }

  // Dialect match (6 pts)
  if (
    a.sindhi_dialect &&
    b.sindhi_dialect &&
    a.sindhi_dialect.toLowerCase() === b.sindhi_dialect.toLowerCase()
  ) {
    score += 6;
  }

  // Fluency compatibility (6 pts)
  const fluencyLevels: Record<string, number> = {
    native: 5,
    fluent: 4,
    conversational: 3,
    basic: 2,
    learning: 1,
  };

  const flA = fluencyLevels[a.sindhi_fluency] || 0;
  const flB = fluencyLevels[b.sindhi_fluency] || 0;
  const fluencyDiff = Math.abs(flA - flB);

  if (fluencyDiff === 0) score += 6;
  else if (fluencyDiff === 1) score += 4;
  else if (fluencyDiff === 2) score += 2;

  return Math.min(score, 20);
}

/**
 * Festivals (max 20 pts)
 * Jaccard similarity of festivals_celebrated arrays.
 */
function scoreFestivals(
  a: ChattiProfileRow | null,
  b: ChattiProfileRow | null
): number {
  if (!a || !b) return 0;

  const setA = new Set((a.festivals_celebrated || []).map((f) => f.toLowerCase()));
  const setB = new Set((b.festivals_celebrated || []).map((f) => f.toLowerCase()));

  if (setA.size === 0 && setB.size === 0) return 0;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  if (union === 0) return 0;

  const jaccard = intersection / union;
  return Math.round(jaccard * 20);
}

/**
 * Food (max 15 pts)
 * Food preference match (10 pts) + cuisine overlap (5 pts).
 */
function scoreFood(
  a: ChattiProfileRow | null,
  b: ChattiProfileRow | null
): number {
  if (!a || !b) return 0;

  let score = 0;

  // Food preference compatibility
  if (a.food_preference === b.food_preference) {
    score += 10;
  } else {
    // Partial compatibility matrix
    const compatible: Record<string, string[]> = {
      vegetarian: ['vegan', 'jain'],
      vegan: ['vegetarian', 'jain'],
      jain: ['vegetarian', 'vegan'],
      non_vegetarian: [],
    };
    if (compatible[a.food_preference]?.includes(b.food_preference)) {
      score += 5;
    }
  }

  // Cuisine preferences overlap
  const cuisineA = new Set((a.cuisine_preferences || []).map((c) => c.toLowerCase()));
  const cuisineB = new Set((b.cuisine_preferences || []).map((c) => c.toLowerCase()));

  if (cuisineA.size > 0 && cuisineB.size > 0) {
    let overlap = 0;
    for (const item of cuisineA) {
      if (cuisineB.has(item)) overlap++;
    }
    const maxOverlap = Math.min(cuisineA.size, cuisineB.size);
    if (maxOverlap > 0) {
      score += Math.round((overlap / maxOverlap) * 5);
    }
  }

  return Math.min(score, 15);
}

/**
 * Diaspora (max 10 pts)
 * Same country = 10, same family origin country = 7, both diaspora = 4
 */
function scoreDiaspora(
  aBasic: BasicProfileRow | null,
  bBasic: BasicProfileRow | null,
  aSindhi: SindhiProfileRow | null,
  bSindhi: SindhiProfileRow | null
): number {
  if (!aBasic || !bBasic) return 0;

  // Same current country
  if (
    aBasic.country &&
    bBasic.country &&
    aBasic.country.toLowerCase() === bBasic.country.toLowerCase()
  ) {
    return 10;
  }

  // Same family origin country
  if (
    aSindhi?.family_origin_country &&
    bSindhi?.family_origin_country &&
    aSindhi.family_origin_country.toLowerCase() ===
      bSindhi.family_origin_country.toLowerCase()
  ) {
    return 7;
  }

  // Both in diaspora (outside India/Pakistan)
  const nonDiaspora = ['india', 'pakistan'];
  const aIsDiaspora =
    aBasic.country && !nonDiaspora.includes(aBasic.country.toLowerCase());
  const bIsDiaspora =
    bBasic.country && !nonDiaspora.includes(bBasic.country.toLowerCase());

  if (aIsDiaspora && bIsDiaspora) return 4;

  return 0;
}

/**
 * Intent (max 10 pts)
 * Same intent = 10, compatible intents = 5
 */
function scoreIntent(
  a: BasicProfileRow | null,
  b: BasicProfileRow | null
): number {
  if (!a || !b) return 0;

  if (a.intent === b.intent) return 10;

  // Partial compatibility
  const compatible: Record<string, string[]> = {
    marriage: ['dating'],
    dating: ['marriage', 'friendship'],
    friendship: ['dating', 'networking'],
    networking: ['friendship'],
  };

  if (compatible[a.intent]?.includes(b.intent)) return 5;

  return 0;
}

// ─── Main Scoring Function ─────────────────────────────────────────────────────

interface UserProfiles {
  basic: BasicProfileRow | null;
  sindhi: SindhiProfileRow | null;
  chatti: ChattiProfileRow | null;
}

async function fetchUserProfiles(userId: string): Promise<UserProfiles> {
  const [basicRes, sindhiRes, chattiRes] = await Promise.all([
    supabase.from('basic_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('sindhi_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('chatti_profiles').select('*').eq('user_id', userId).single(),
  ]);

  return {
    basic: (basicRes.data as BasicProfileRow) || null,
    sindhi: (sindhiRes.data as SindhiProfileRow) || null,
    chatti: (chattiRes.data as ChattiProfileRow) || null,
  };
}

/**
 * Compute the cultural compatibility score between two users.
 * Returns a total score out of 100 with breakdown and badge.
 */
export function computeCulturalScore(
  profilesA: UserProfiles,
  profilesB: UserProfiles
): CulturalScoreResult {
  const familyValues = scoreFamilyValues(profilesA.chatti, profilesB.chatti);
  const language = scoreLanguage(profilesA.sindhi, profilesB.sindhi);
  const festivals = scoreFestivals(profilesA.chatti, profilesB.chatti);
  const food = scoreFood(profilesA.chatti, profilesB.chatti);
  const diaspora = scoreDiaspora(
    profilesA.basic,
    profilesB.basic,
    profilesA.sindhi,
    profilesB.sindhi
  );
  const intent = scoreIntent(profilesA.basic, profilesB.basic);

  const total = familyValues + language + festivals + food + diaspora + intent;

  let badge: CulturalBadge = 'none';
  if (total >= 95) badge = 'gold';
  else if (total >= 80) badge = 'green';
  else if (total >= 60) badge = 'orange';

  return {
    total,
    badge,
    breakdown: {
      familyValues,
      language,
      festivals,
      food,
      diaspora,
      intent,
    },
  };
}

/**
 * Get cultural score with Redis caching.
 * Cache key uses canonical ID ordering so (A,B) == (B,A).
 */
export async function getCulturalScore(
  idA: string,
  idB: string
): Promise<CulturalScoreResult> {
  const key = cacheKey(idA, idB);

  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as CulturalScoreResult;
  }

  // Fetch profiles and compute
  const [profilesA, profilesB] = await Promise.all([
    fetchUserProfiles(idA),
    fetchUserProfiles(idB),
  ]);

  const result = computeCulturalScore(profilesA, profilesB);

  // Cache the result
  await redis.set(key, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);

  return result;
}

/**
 * Invalidate cached score when either user updates their profile.
 */
export async function invalidateCulturalScoreCache(userId: string): Promise<void> {
  // Scan for all keys containing this user's ID
  let cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      `cultural_score:*${userId}*`,
      'COUNT',
      100
    );
    cursor = newCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
}

export default { computeCulturalScore, getCulturalScore, invalidateCulturalScoreCache };
