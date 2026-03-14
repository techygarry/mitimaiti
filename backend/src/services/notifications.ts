import { redis } from '../config/redis';
import { supabase } from '../config/supabase';
import { NotificationPayload, NotificationType } from '../types';

// ─── Constants ──────────────────────────────────────────────────────────────────

const MAX_DAILY_NOTIFICATIONS = 15;
const COOLDOWN_SECONDS = 180; // 3 minutes
const BATCH_WINDOW_SECONDS = 300; // 5 minutes for batching likes
const QUIET_HOURS_DEFAULT_START = 22; // 10 PM
const QUIET_HOURS_DEFAULT_END = 7; // 7 AM

/**
 * All 18 notification types with their default templates.
 */
const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  { title: string; body: string; batchable: boolean }
> = {
  new_like: {
    title: 'New Like!',
    body: 'Someone liked your profile',
    batchable: true,
  },
  new_super_like: {
    title: 'Super Like!',
    body: 'Someone super liked your profile!',
    batchable: false,
  },
  new_match: {
    title: "It's a Match!",
    body: "You and {name} liked each other!",
    batchable: false,
  },
  new_message: {
    title: 'New Message',
    body: '{name} sent you a message',
    batchable: false,
  },
  match_expiring: {
    title: 'Match Expiring Soon',
    body: 'Your match with {name} expires in 24 hours. Start chatting!',
    batchable: false,
  },
  match_expired: {
    title: 'Match Expired',
    body: 'Your match with {name} has expired',
    batchable: false,
  },
  profile_boost_started: {
    title: 'Boost Active!',
    body: 'Your profile is being boosted for 30 minutes',
    batchable: false,
  },
  profile_boost_ended: {
    title: 'Boost Ended',
    body: 'Your profile boost has ended. See how you did!',
    batchable: false,
  },
  daily_prompt: {
    title: "Today's Prompt",
    body: 'Answer today\'s question to stand out!',
    batchable: false,
  },
  profile_incomplete: {
    title: 'Complete Your Profile',
    body: 'Profiles with more details get 3x more matches',
    batchable: false,
  },
  verification_approved: {
    title: 'Verified!',
    body: 'Your profile has been verified. You now have a verified badge!',
    batchable: false,
  },
  verification_rejected: {
    title: 'Verification Update',
    body: 'Your verification request needs attention. Please try again.',
    batchable: false,
  },
  premium_activated: {
    title: 'Welcome to Premium!',
    body: 'Your {plan} plan is now active. Enjoy all premium features!',
    batchable: false,
  },
  premium_expiring: {
    title: 'Premium Expiring',
    body: 'Your premium plan expires in {days} days. Renew to keep your benefits.',
    batchable: false,
  },
  premium_expired: {
    title: 'Premium Expired',
    body: 'Your premium plan has expired. Renew to continue enjoying premium features.',
    batchable: false,
  },
  family_invite_received: {
    title: 'Family Invite',
    body: 'You have received a family account invitation',
    batchable: false,
  },
  family_suggestion: {
    title: 'New Suggestion',
    body: 'Your family has suggested a new match for you',
    batchable: false,
  },
  strike_received: {
    title: 'Account Warning',
    body: 'Your account has received a community guideline strike',
    batchable: false,
  },
};

// ─── Throttling Checks ─────────────────────────────────────────────────────────

/**
 * Check if user is in quiet hours.
 */
async function isInQuietHours(userId: string): Promise<boolean> {
  const { data: settings } = await supabase
    .from('user_settings')
    .select('quiet_hours_start, quiet_hours_end')
    .eq('user_id', userId)
    .single();

  const start = settings?.quiet_hours_start
    ? parseInt(settings.quiet_hours_start.split(':')[0], 10)
    : QUIET_HOURS_DEFAULT_START;

  const end = settings?.quiet_hours_end
    ? parseInt(settings.quiet_hours_end.split(':')[0], 10)
    : QUIET_HOURS_DEFAULT_END;

  const currentHour = new Date().getUTCHours();

  if (start > end) {
    // Quiet hours span midnight (e.g., 22:00 - 07:00)
    return currentHour >= start || currentHour < end;
  }

  return currentHour >= start && currentHour < end;
}

/**
 * Check daily notification count.
 */
async function checkDailyLimit(userId: string): Promise<boolean> {
  const key = `notif_daily:${userId}`;
  const count = await redis.get(key);
  return !count || parseInt(count, 10) < MAX_DAILY_NOTIFICATIONS;
}

/**
 * Increment daily notification count.
 */
async function incrementDailyCount(userId: string): Promise<void> {
  const key = `notif_daily:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) {
    // Set expiry to end of day (approximate, will be reset by cron)
    await redis.expire(key, 86400);
  }
}

/**
 * Check cooldown between notifications of the same type.
 */
async function checkCooldown(userId: string, type: NotificationType): Promise<boolean> {
  const key = `notif_cooldown:${userId}:${type}`;
  const exists = await redis.exists(key);
  return exists === 0;
}

/**
 * Set cooldown after sending a notification.
 */
async function setCooldown(userId: string, type: NotificationType): Promise<void> {
  const key = `notif_cooldown:${userId}:${type}`;
  await redis.set(key, '1', 'EX', COOLDOWN_SECONDS);
}

// ─── Batch Likes ────────────────────────────────────────────────────────────────

/**
 * Queue a like notification for batching.
 */
export async function queueLikeNotification(userId: string): Promise<void> {
  const key = `notif_batch_likes:${userId}`;
  await redis.incr(key);
  // Set TTL if first entry
  const ttl = await redis.ttl(key);
  if (ttl === -1) {
    await redis.expire(key, BATCH_WINDOW_SECONDS);
  }
}

/**
 * Flush batched like notifications. Called by cron every 5 minutes.
 */
export async function flushBatchedLikes(): Promise<void> {
  let cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      'notif_batch_likes:*',
      'COUNT',
      100
    );
    cursor = newCursor;

    for (const key of keys) {
      const count = await redis.get(key);
      if (!count || parseInt(count, 10) === 0) continue;

      const userId = key.replace('notif_batch_likes:', '');
      const likeCount = parseInt(count, 10);

      await sendPush({
        type: 'new_like',
        userId,
        title: likeCount === 1 ? 'New Like!' : `${likeCount} New Likes!`,
        body:
          likeCount === 1
            ? 'Someone liked your profile'
            : `${likeCount} people liked your profile`,
      });

      await redis.del(key);
    }
  } while (cursor !== '0');
}

// ─── Main Send Function ────────────────────────────────────────────────────────

/**
 * Send a push notification to a user.
 *
 * Applies throttling rules:
 * - Max 15 notifications per day
 * - 3 minute cooldown between same-type notifications
 * - Quiet hours respect
 * - Batchable notifications are queued
 *
 * Currently logs notifications (stub for Firebase Cloud Messaging integration).
 */
export async function sendPush(payload: NotificationPayload): Promise<boolean> {
  const { type, userId, title, body, data } = payload;

  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) {
    console.warn(`[Notifications] Unknown notification type: ${type}`);
    return false;
  }

  // Check if batchable and queue instead
  if (template.batchable && type === 'new_like') {
    await queueLikeNotification(userId);
    console.log(`[Notifications] Queued batchable notification: ${type} for user ${userId}`);
    return true;
  }

  // Check quiet hours (skip for critical notifications)
  const criticalTypes: NotificationType[] = ['strike_received', 'new_match'];
  if (!criticalTypes.includes(type)) {
    const quiet = await isInQuietHours(userId);
    if (quiet) {
      console.log(`[Notifications] Skipped (quiet hours): ${type} for user ${userId}`);
      return false;
    }
  }

  // Check daily limit
  const withinLimit = await checkDailyLimit(userId);
  if (!withinLimit) {
    console.log(`[Notifications] Skipped (daily limit): ${type} for user ${userId}`);
    return false;
  }

  // Check cooldown
  const cooldownClear = await checkCooldown(userId, type);
  if (!cooldownClear) {
    console.log(`[Notifications] Skipped (cooldown): ${type} for user ${userId}`);
    return false;
  }

  // Check if user has push notifications enabled
  const { data: settings } = await supabase
    .from('user_settings')
    .select('push_notifications')
    .eq('user_id', userId)
    .single();

  if (settings && !settings.push_notifications) {
    console.log(`[Notifications] Skipped (disabled): ${type} for user ${userId}`);
    return false;
  }

  // Get FCM token
  const { data: user } = await supabase
    .from('users')
    .select('fcm_token')
    .eq('id', userId)
    .single();

  if (!user?.fcm_token) {
    console.log(`[Notifications] No FCM token for user ${userId}`);
    return false;
  }

  // Stub: Log instead of sending via Firebase
  // In production, this would use firebase-admin to send:
  //
  // const message = {
  //   token: user.fcm_token,
  //   notification: { title, body },
  //   data: data || {},
  // };
  // await admin.messaging().send(message);

  console.log(`[Notifications] SEND -> ${type} to ${userId}: "${title}" - "${body}"`, data || '');

  // Record throttling state
  await incrementDailyCount(userId);
  await setCooldown(userId, type);

  // Store notification in database for history
  const { error: insertErr } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    data: data || {},
    is_read: false,
  });

  if (insertErr) {
    console.error('[Notifications] Failed to store notification:', insertErr.message);
  }

  return true;
}

/**
 * Send notification using template defaults.
 */
export async function sendTemplateNotification(
  type: NotificationType,
  userId: string,
  replacements: Record<string, string> = {},
  extraData: Record<string, string> = {}
): Promise<boolean> {
  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) return false;

  let title = template.title;
  let body = template.body;

  // Replace placeholders
  for (const [key, value] of Object.entries(replacements)) {
    title = title.replace(`{${key}}`, value);
    body = body.replace(`{${key}}`, value);
  }

  return sendPush({ type, userId, title, body, data: extraData });
}

export default {
  sendPush,
  sendTemplateNotification,
  queueLikeNotification,
  flushBatchedLikes,
};
