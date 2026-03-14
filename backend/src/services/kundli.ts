import kundliTables from '../data/kundli_tables.json';
import { KundliResult, KundliTier, NakshatraInfo } from '../types';

// ─── Nakshatra Data ─────────────────────────────────────────────────────────────

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

// Each nakshatra maps to a rashi (3 nakshatras per rashi, with overlap handled)
const NAKSHATRA_TO_RASHI: number[] = [
  0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5,
  6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
];

const tables = kundliTables as any;

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

// ─── Guna Calculators ──────────────────────────────────────────────────────────

/**
 * 1. Varna (max 1 point)
 * Varna groups: Brahmin, Kshatriya, Vaishya, Shudra
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
 * Categories: Manav(Human), Vanchar(Wild), Chatushpad(Quadruped), Jalchar(Aquatic), Keeta(Insect)
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
 * Count from girl's nakshatra to boy's, divide by 9, check remainder.
 */
function computeTara(boyNakIdx: number, girlNakIdx: number): number {
  // Tara from boy to girl
  let diff1 = (boyNakIdx - girlNakIdx + 27) % 27;
  const tara1 = (diff1 % 9) + 1;

  // Tara from girl to boy
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
 * Three nadis: Aadi, Madhya, Antya
 * Same nadi = 0 points (Nadi Dosha), different = 8 points
 */
function computeNadi(boyNakIdx: number, girlNakIdx: number): number {
  const nadiMap: number[] = tables.nadi_map;
  const boyNadi = nadiMap[boyNakIdx];
  const girlNadi = nadiMap[girlNakIdx];

  return boyNadi === girlNadi ? 0 : 8;
}

// ─── Main Kundli Function ──────────────────────────────────────────────────────

/**
 * Perform Ashtakoot Gun Milan (8-fold compatibility matching).
 *
 * @param boyNakshatraIndex - Nakshatra index (0-26) of the boy
 * @param girlNakshatraIndex - Nakshatra index (0-26) of the girl
 * @returns KundliResult with total points, tier, and per-guna breakdown
 */
export function computeGunMilan(
  boyNakshatraIndex: number,
  girlNakshatraIndex: number
): KundliResult {
  const varna = computeVarna(boyNakshatraIndex, girlNakshatraIndex);
  const vashya = computeVashya(boyNakshatraIndex, girlNakshatraIndex);
  const tara = computeTara(boyNakshatraIndex, girlNakshatraIndex);
  const yoni = computeYoni(boyNakshatraIndex, girlNakshatraIndex);
  const grahaMaitri = computeGrahaMaitri(boyNakshatraIndex, girlNakshatraIndex);
  const gana = computeGana(boyNakshatraIndex, girlNakshatraIndex);
  const bhakoot = computeBhakoot(boyNakshatraIndex, girlNakshatraIndex);
  const nadi = computeNadi(boyNakshatraIndex, girlNakshatraIndex);

  const totalPoints = varna + vashya + tara + yoni + grahaMaitri + gana + bhakoot + nadi;

  let tier: KundliTier;
  if (totalPoints >= 28) tier = 'excellent';
  else if (totalPoints >= 18) tier = 'good';
  else tier = 'challenging';

  return {
    totalPoints,
    maxPoints: 36,
    tier,
    gunas: {
      varna,
      vashya,
      tara,
      yoni,
      grahaMaitri,
      gana,
      bhakoot,
      nadi,
    },
  };
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

export default {
  computeGunMilan,
  getNakshatraInfo,
  getNakshatraIndex,
  getAllNakshatras,
  getAllRashis,
};
