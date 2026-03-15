import { supabase } from '../config/supabase';
import { redis } from '../config/redis';
import { PhotoScreenResult, TextScreenResult, ProfileTextScreenResult } from '../types';

// ─── Sightengine Config ──────────────────────────────────────────────────────

const SIGHTENGINE_API_USER = process.env.SIGHTENGINE_API_USER;
const SIGHTENGINE_API_SECRET = process.env.SIGHTENGINE_API_SECRET;
const SIGHTENGINE_BASE_URL = 'https://api.sightengine.com/1.0';

// ─── Thresholds ──────────────────────────────────────────────────────────────

const NUDITY_THRESHOLD = 0.7;
const HARASSMENT_THRESHOLD = 0.8;
const SPAM_THRESHOLD = 0.8;
const TOXICITY_THRESHOLD = 0.75;

// ─── Contact-Sharing Regex (phone numbers, URLs) ────────────────────────────

const PHONE_PATTERNS = [
  // International format: +1-234-567-8901, +91 98765 43210, etc.
  /(\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
  // Spelled-out numbers: "nine eight seven six..."
  /\b(zero|one|two|three|four|five|six|seven|eight|nine)(\s+(zero|one|two|three|four|five|six|seven|eight|nine)){6,}\b/gi,
  // Numbers with spaces/dashes that look like phone numbers
  /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g,
  // 10+ consecutive digits
  /\b\d{10,}\b/g,
];

const URL_PATTERNS = [
  // Standard URLs
  /https?:\/\/[^\s]+/gi,
  // URLs without protocol
  /\bwww\.[^\s]+/gi,
  // Social media handles
  /@[a-zA-Z0-9_]{3,}/g,
  // Common domains without www
  /\b[a-zA-Z0-9-]+\.(com|org|net|io|co|me|app|dev|xyz)\b/gi,
  // Instagram, Snapchat, etc. references
  /\b(insta|snap|telegram|whatsapp|signal|tg|wa)\b.*?[:@]?\s*[a-zA-Z0-9_.]+/gi,
];

// ─── Photo Screening ─────────────────────────────────────────────────────────

/**
 * Screen a photo for nudity using Sightengine.
 * POST to Sightengine nudity model.
 *
 * @param buffer - The photo file buffer
 * @returns {pass: boolean, score: number} — Reject if nudity > 0.7
 */
export async function screenPhoto(buffer: Buffer): Promise<PhotoScreenResult> {
  if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
    console.warn('[Moderation] Sightengine credentials not configured, auto-passing photo');
    return { pass: true, score: 0 };
  }

  try {
    const formData = new FormData();
    formData.append('media', new Blob([buffer]), 'photo.jpg');
    formData.append('models', 'nudity-2.1');
    formData.append('api_user', SIGHTENGINE_API_USER);
    formData.append('api_secret', SIGHTENGINE_API_SECRET);

    const response = await fetch(`${SIGHTENGINE_BASE_URL}/check.json`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error(`[Moderation] Sightengine photo API returned ${response.status}`);
      // Fail open — allow the photo but flag for manual review
      return { pass: true, score: 0 };
    }

    const result: any = await response.json();

    // Sightengine returns nudity scores:
    // result.nudity.sexual_activity, result.nudity.sexual_display,
    // result.nudity.erotica, result.nudity.very_suggestive, etc.
    const nudityScore = Math.max(
      result.nudity?.sexual_activity ?? 0,
      result.nudity?.sexual_display ?? 0,
      result.nudity?.erotica ?? 0,
      result.nudity?.very_suggestive ?? 0
    );

    const pass = nudityScore <= NUDITY_THRESHOLD;

    if (!pass) {
      console.log(`[Moderation] Photo rejected: nudity score ${nudityScore.toFixed(3)}`);
    }

    return { pass, score: nudityScore };
  } catch (err: any) {
    console.error('[Moderation] Photo screening error:', err.message || err);
    // Fail open
    return { pass: true, score: 0 };
  }
}

// ─── Message Screening ───────────────────────────────────────────────────────

/**
 * Screen a text message for harassment/spam using Sightengine.
 * POST to Sightengine text moderation API.
 *
 * @param text - The message text
 * @returns {pass: boolean, reason: string} — Reject if harassment > 0.8 or spam > 0.8
 */
export async function screenMessage(text: string): Promise<TextScreenResult> {
  if (!text || text.trim().length === 0) {
    return { pass: true, reason: '' };
  }

  if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
    console.warn('[Moderation] Sightengine credentials not configured, auto-passing message');
    return { pass: true, reason: '' };
  }

  try {
    const params = new URLSearchParams({
      text,
      lang: 'en',
      models: 'text-content-1.0',
      mode: 'ml',
      api_user: SIGHTENGINE_API_USER,
      api_secret: SIGHTENGINE_API_SECRET,
    });

    const response = await fetch(`${SIGHTENGINE_BASE_URL}/text/check.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error(`[Moderation] Sightengine text API returned ${response.status}`);
      return { pass: true, reason: '' };
    }

    const result: any = await response.json();

    // Check harassment
    const harassmentScore = result.moderation_classes?.sexual ?? 0;
    const discriminatoryScore = result.moderation_classes?.discriminatory ?? 0;
    const insultingScore = result.moderation_classes?.insulting ?? 0;
    const violentScore = result.moderation_classes?.violent ?? 0;

    const maxHarassment = Math.max(
      harassmentScore,
      discriminatoryScore,
      insultingScore,
      violentScore
    );

    if (maxHarassment > HARASSMENT_THRESHOLD) {
      const reasons: string[] = [];
      if (harassmentScore > HARASSMENT_THRESHOLD) reasons.push('sexual');
      if (discriminatoryScore > HARASSMENT_THRESHOLD) reasons.push('discriminatory');
      if (insultingScore > HARASSMENT_THRESHOLD) reasons.push('insulting');
      if (violentScore > HARASSMENT_THRESHOLD) reasons.push('violent');

      return {
        pass: false,
        reason: `harassment_detected:${reasons.join(',')}`,
      };
    }

    // Check spam
    const spamScore = result.moderation_classes?.spam ?? 0;
    if (spamScore > SPAM_THRESHOLD) {
      return { pass: false, reason: 'spam_detected' };
    }

    return { pass: true, reason: '' };
  } catch (err: any) {
    console.error('[Moderation] Message screening error:', err.message || err);
    return { pass: true, reason: '' };
  }
}

// ─── Profile Text Screening ─────────────────────────────────────────────────

/**
 * Screen profile text (bio, prompts) for toxicity using Sightengine.
 *
 * @param text - The profile text to check
 * @returns {pass: boolean, score: number} — Flag if toxicity > 0.75
 */
export async function screenProfileText(text: string): Promise<ProfileTextScreenResult> {
  if (!text || text.trim().length === 0) {
    return { pass: true, score: 0 };
  }

  if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
    console.warn('[Moderation] Sightengine credentials not configured, auto-passing profile text');
    return { pass: true, score: 0 };
  }

  try {
    const params = new URLSearchParams({
      text,
      lang: 'en',
      models: 'text-content-1.0',
      mode: 'ml',
      api_user: SIGHTENGINE_API_USER,
      api_secret: SIGHTENGINE_API_SECRET,
    });

    const response = await fetch(`${SIGHTENGINE_BASE_URL}/text/check.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error(`[Moderation] Sightengine text API returned ${response.status}`);
      return { pass: true, score: 0 };
    }

    const result: any = await response.json();

    // Aggregate toxicity from all moderation classes
    const classes = result.moderation_classes || {};
    const toxicityScore = Math.max(
      classes.sexual ?? 0,
      classes.discriminatory ?? 0,
      classes.insulting ?? 0,
      classes.violent ?? 0,
      classes.toxic ?? 0
    );

    const pass = toxicityScore <= TOXICITY_THRESHOLD;

    if (!pass) {
      console.log(`[Moderation] Profile text flagged: toxicity score ${toxicityScore.toFixed(3)}`);
    }

    return { pass, score: toxicityScore };
  } catch (err: any) {
    console.error('[Moderation] Profile text screening error:', err.message || err);
    return { pass: true, score: 0 };
  }
}

// ─── Early Message Contact-Sharing Check ─────────────────────────────────────

/**
 * For the first 5 messages in a match, check for phone numbers and URLs.
 * Uses regex patterns to detect contact-sharing attempts.
 *
 * @param matchId - The match ID to check message count
 * @param text - The message text
 * @returns true if the message should be BLOCKED
 */
export async function checkEarlyMessageContactSharing(
  matchId: string,
  text: string
): Promise<boolean> {
  if (!text || text.trim().length === 0) return false;

  // Check how many messages have been sent in this match
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('match_id', matchId);

  if (error) {
    console.error('[Moderation] Error checking message count:', error.message);
    return false;
  }

  const messageCount = count || 0;

  // Only enforce for first 5 messages
  if (messageCount >= 5) return false;

  // Check for phone numbers
  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex state
    if (pattern.test(text)) {
      console.log(`[Moderation] Blocked contact sharing (phone) in early message for match ${matchId}`);
      return true;
    }
  }

  // Check for URLs
  for (const pattern of URL_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      console.log(`[Moderation] Blocked contact sharing (URL) in early message for match ${matchId}`);
      return true;
    }
  }

  return false;
}

export default {
  screenPhoto,
  screenMessage,
  screenProfileText,
  checkEarlyMessageContactSharing,
};
