import kundliTables from '../data/kundli_tables.json';
import { redis } from '../config/redis';
import { supabase } from '../config/supabase';
import { KundliResult, KundliTier, KundliBreakdown, NakshatraInfo } from '../types';

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = 'pair';
const CACHE_SUFFIX = 'kundli';
const CACHE_TTL_SECONDS = 86400; // 24 hours

// ─── Nakshatra Data ──────────────────────────────────────────────────────────

const NAKSHATRAS: string[] = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const RASHIS: string[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

// Each nakshatra maps to a rashi (zodiac sign)
const NAKSHATRA_TO_RASHI: number[] = [
  0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5,
  6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
];

const tables = kundliTables as any;

// ─── Cache Key (canonical ordering — lower UUID first) ───────────────────────

function cacheKey(idA: string, idB: string): string {
  const [first, second] = idA < idB ? [idA, idB] : [idB, idA];
  return `${CACHE_PREFIX}:${first}:${second}:${CACHE_SUFFIX}`;
}

// ─── Nakshatra Info ──────────────────────────────────────────────────────────

/**
 * Get nakshatra info from index (0-26).
 */
export function getNakshatraInfo(index: number): NakshatraInfo {
  const clampedIndex = Math.max(0, Math.min(26, index));
  return {
    name: NAKSHATRAS[clampedIndex],
    index: clampedIndex,
    rashi: RASHIS[NAKSHATRA_TO_RASHI[clampedIndex]],
  };
}

/**
 * Get rashi index from nakshatra index.
 */
function getRashiIndex(nakshatraIndex: number): number {
  return NAKSHATRA_TO_RASHI[nakshatraIndex];
}

/**
 * Get nakshatra index by name (case-insensitive).
 */
export function getNakshatraIndex(name: string): number {
  const idx = NAKSHATRAS.findIndex(
    (n) => n.toLowerCase() === name.toLowerCase()
  );
  if (idx === -1) {
    throw new Error(`Unknown nakshatra: ${name}`);
  }
  return idx;
}

/**
 * Get all nakshatra names.
 */
export function getAllNakshatras(): string[] {
  return [...NAKSHATRAS];
}

/**
 * Get all rashi names.
 */
export function getAllRashis(): string[] {
  return [...RASHIS];
}

// ─── Guna Calculators (Ashtakoot 8-Guna System) ─────────────────────────────

/**
 * 1. Varna (max 1 point)
 * Boy's varna >= Girl's varna = 1 point
 */
function computeVarna(boyNakIdx: number, girlNakIdx: number): number {
  const varnaMap: number[] = tables.varna_map;
  const boyVarna = varnaMap[boyNakIdx];
  const girlVarna = varnaMap[girlNakIdx];
  return boyVarna >= girlVarna ? 1 : 0;
}

/**
 * 2. Vashya (max 2 points)
 * Categories: Manav, Vanchar, Chatushpad, Jalchar, Keeta
 */
function computeVashya(boyNakIdx: number, girlNakIdx: number): number {
  const vashyaMap: number[] = tables.vashya_map;
  const boyVashya = vashyaMap[boyNakIdx];
  const girlVashya = vashyaMap[girlNakIdx];

  const matrix: number[][] = tables.vashya_matrix;
  return matrix[boyVashya][girlVashya];
}

/**
 * 3. Tara (max 3 points)
 * Based on birth star compatibility.
 */
function computeTara(boyNakIdx: number, girlNakIdx: number): number {
  let diff1 = (boyNakIdx - girlNakIdx + 27) % 27;
  const tara1 = (diff1 % 9) + 1;

  let diff2 = (girlNakIdx - boyNakIdx + 27) % 27;
  const tara2 = (diff2 % 9) + 1;

  // Auspicious taras: 1, 2, 4, 6, 8, 9
  const auspicious = new Set([1, 2, 4, 6, 8, 9]);

  let points = 0;
  if (auspicious.has(tara1)) points += 1.5;
  if (auspicious.has(tara2)) points += 1.5;

  return points;
}

/**
 * 4. Yoni (max 4 points)
 * Animal compatibility of nakshatras.
 */
function computeYoni(boyNakIdx: number, girlNakIdx: number): number {
  const yoniMap: number[] = tables.yoni_map;
  const boyYoni = yoniMap[boyNakIdx];
  const girlYoni = yoniMap[girlNakIdx];

  const matrix: number[][] = tables.yoni_matrix;
  return matrix[boyYoni][girlYoni];
}

/**
 * 5. Graha Maitri (max 5 points)
 * Planetary lord friendship of the rashis.
 */
function computeGrahaMaitri(boyNakIdx: number, girlNakIdx: number): number {
  const boyRashi = getRashiIndex(boyNakIdx);
  const girlRashi = getRashiIndex(girlNakIdx);

  const lordMap: number[] = tables.rashi_lord_map;
  const boyLord = lordMap[boyRashi];
  const girlLord = lordMap[girlRashi];

  const matrix: number[][] = tables.graha_maitri_matrix;
  return matrix[boyLord][girlLord];
}

/**
 * 6. Gana (max 6 points)
 * Three ganas: Deva, Manushya, Rakshasa
 */
function computeGana(boyNakIdx: number, girlNakIdx: number): number {
  const ganaMap: number[] = tables.gana_map;
  const boyGana = ganaMap[boyNakIdx];
  const girlGana = ganaMap[girlNakIdx];

  const matrix: number[][] = tables.gana_matrix;
  return matrix[boyGana][girlGana];
}

/**
 * 7. Bhakoot (max 7 points)
 * Rashi compatibility based on relative position.
 */
function computeBhakoot(boyNakIdx: number, girlNakIdx: number): number {
  const boyRashi = getRashiIndex(boyNakIdx);
  const girlRashi = getRashiIndex(girlNakIdx);

  const diff = ((boyRashi - girlRashi + 12) % 12) + 1;

  // Inauspicious combinations: 2/12, 5/9, 6/8
  const inauspicious = new Set([2, 5, 6, 8, 9, 12]);
  return inauspicious.has(diff) ? 0 : 7;
}

/**
 * 8. Nadi (max 8 points)
 * Same nadi = 0 points (Nadi Dosha), different = 8 points
 */
function computeNadi(boyNakIdx: number, girlNakIdx: number): number {
  const nadiMap: number[] = tables.nadi_map;
  const boyNadi = nadiMap[boyNakIdx];
  const girlNadi = nadiMap[girlNakIdx];

  return boyNadi === girlNadi ? 0 : 8;
}

// ─── Core Gun Milan Function ─────────────────────────────────────────────────

/**
 * Perform Ashtakoot Gun Milan (8-fold compatibility matching).
 *
 * @param boyNakshatraIndex - Nakshatra index (0-26) of the boy
 * @param girlNakshatraIndex - Nakshatra index (0-26) of the girl
 * @returns KundliResult with total, max:36, tier, and per-guna breakdown
 */
export function computeGunMilan(
  boyNakshatraIndex: number,
  girlNakshatraIndex: number
): KundliResult {
  const varna = computeVarna(boyNakshatraIndex, girlNakshatraIndex);
  const vashya = computeVashya(boyNakshatraIndex, girlNakshatraIndex);
  const tara = computeTara(boyNakshatraIndex, girlNakshatraIndex);
  const yoni = computeYoni(boyNakshatraIndex, girlNakshatraIndex);
  const graha_maitri = computeGrahaMaitri(boyNakshatraIndex, girlNakshatraIndex);
  const gana = computeGana(boyNakshatraIndex, girlNakshatraIndex);
  const bhakoot = computeBhakoot(boyNakshatraIndex, girlNakshatraIndex);
  const nadi = computeNadi(boyNakshatraIndex, girlNakshatraIndex);

  const total = varna + vashya + tara + yoni + graha_maitri + gana + bhakoot + nadi;

  let tier: KundliTier;
  if (total >= 28) tier = 'excellent';
  else if (total >= 18) tier = 'good';
  else tier = 'challenging';

  const breakdown: KundliBreakdown = {
    varna,
    vashya,
    tara,
    yoni,
    graha_maitri,
    gana,
    bhakoot,
    nadi,
  };

  return {
    total,
    max: 36,
    tier,
    breakdown,
  };
}

// ─── DB Row Shape ────────────────────────────────────────────────────────────

interface ChattiRow {
  user_id: string;
  nakshatra: string;
  rashi: string;
}

// ─── Fetch Chatti Data ───────────────────────────────────────────────────────

async function fetchChattiData(userId: string): Promise<ChattiRow | null> {
  const { data, error } = await supabase
    .from('chatti_profiles')
    .select('user_id, nakshatra, rashi')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as ChattiRow;
}

// ─── Compute Kundli Score Between Two Users ──────────────────────────────────

/**
 * Compute Kundli (Ashtakoot Gun Milan) score between two users.
 * Fetches nakshatra/rashi data from user_chatti table.
 * Returns null if either user has no Chatti data.
 */
export async function computeKundliScore(
  userAId: string,
  userBId: string
): Promise<KundliResult | null> {
  const [chattiA, chattiB] = await Promise.all([
    fetchChattiData(userAId),
    fetchChattiData(userBId),
  ]);

  // If either user has no Chatti data, return null
  if (!chattiA || !chattiB) {
    return null;
  }

  // Resolve nakshatra indices
  let nakIdxA: number;
  let nakIdxB: number;

  try {
    nakIdxA = getNakshatraIndex(chattiA.nakshatra);
  } catch {
    console.warn(`[Kundli] Unknown nakshatra for user ${userAId}: ${chattiA.nakshatra}`);
    return null;
  }

  try {
    nakIdxB = getNakshatraIndex(chattiB.nakshatra);
  } catch {
    console.warn(`[Kundli] Unknown nakshatra for user ${userBId}: ${chattiB.nakshatra}`);
    return null;
  }

  // Use user A as "boy" and user B as "girl" for the traditional calculation
  // (the canonical ID ordering ensures consistent results regardless of call order)
  const [boyIdx, girlIdx] = userAId < userBId
    ? [nakIdxA, nakIdxB]
    : [nakIdxB, nakIdxA];

  return computeGunMilan(boyIdx, girlIdx);
}

// ─── Cached Entry Point ──────────────────────────────────────────────────────

/**
 * Get Kundli score with Redis caching.
 * Cache key uses canonical ID ordering so score(A,B) === score(B,A).
 * TTL: 24 hours.
 * Returns null if either user has no Chatti data.
 */
export async function getKundliScore(
  idA: string,
  idB: string
): Promise<KundliResult | null> {
  const key = cacheKey(idA, idB);

  // Try cache
  try {
    const cached = await redis.get(key);
    if (cached) {
      // We store "null" string for users without chatti data
      if (cached === 'null') return null;
      return JSON.parse(cached) as KundliResult;
    }
  } catch (err) {
    console.error('[Kundli] Redis read error, computing fresh:', err);
  }

  // Compute
  const result = await computeKundliScore(idA, idB);

  // Store in cache (including null results to avoid repeated DB lookups)
  try {
    await redis.set(
      key,
      result ? JSON.stringify(result) : 'null',
      'EX',
      CACHE_TTL_SECONDS
    );
  } catch (err) {
    console.error('[Kundli] Redis write error:', err);
  }

  return result;
}

/**
 * Invalidate cached kundli score when a user updates their chatti data.
 */
export async function invalidateKundliCache(userId: string): Promise<void> {
  let cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      `${CACHE_PREFIX}:*${userId}*:${CACHE_SUFFIX}`,
      'COUNT',
      100
    );
    cursor = newCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== '0');
}

export default {
  computeGunMilan,
  computeKundliScore,
  getKundliScore,
  invalidateKundliCache,
  getNakshatraInfo,
  getNakshatraIndex,
  getAllNakshatras,
  getAllRashis,
};
