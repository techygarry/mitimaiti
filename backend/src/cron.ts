import cron from 'node-cron';
import { supabase } from './config/supabase';
import { redis } from './config/redis';
import { flushBatchedLikes, sendTemplateNotification } from './services/notifications';

// ─── Every 5 minutes: Flush batched like notifications ──────────────────────────

const batchLikesJob = cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('[Cron] Flushing batched like notifications...');
    await flushBatchedLikes();
  } catch (err) {
    console.error('[Cron] Batch likes flush error:', err);
  }
});

// ─── Every 15 minutes: Match expiry check ───────────────────────────────────────

const matchExpiryJob = cron.schedule('*/15 * * * *', async () => {
  try {
    console.log('[Cron] Checking for expiring matches...');

    // Notify about matches expiring in 24 hours
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const { data: expiringMatches } = await supabase
      .from('matches')
      .select('id, user_a_id, user_b_id, expires_at')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lte('expires_at', in24Hours)
      .gt('expires_at', now);

    for (const match of expiringMatches || []) {
      // Check if we already notified (prevent duplicate notifications)
      const notifKey = `match_expiry_notif:${match.id}`;
      const alreadyNotified = await redis.get(notifKey);
      if (alreadyNotified) continue;

      // Notify both users
      const { data: userABasic } = await supabase
        .from('basic_profiles')
        .select('display_name')
        .eq('user_id', match.user_a_id)
        .single();

      const { data: userBBasic } = await supabase
        .from('basic_profiles')
        .select('display_name')
        .eq('user_id', match.user_b_id)
        .single();

      await Promise.all([
        sendTemplateNotification('match_expiring', match.user_a_id, {
          name: userBBasic?.display_name || 'your match',
        }),
        sendTemplateNotification('match_expiring', match.user_b_id, {
          name: userABasic?.display_name || 'your match',
        }),
      ]);

      // Mark as notified (24 hour TTL)
      await redis.set(notifKey, '1', 'EX', 86400);
    }

    // Expire matches that have passed their expiry date
    const { data: expiredMatches } = await supabase
      .from('matches')
      .select('id, user_a_id, user_b_id')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lte('expires_at', now);

    for (const match of expiredMatches || []) {
      await supabase
        .from('matches')
        .update({ status: 'expired' })
        .eq('id', match.id);

      // Notify both users
      await Promise.all([
        sendTemplateNotification('match_expired', match.user_a_id),
        sendTemplateNotification('match_expired', match.user_b_id),
      ]);
    }

    const expiringCount = expiringMatches?.length || 0;
    const expiredCount = expiredMatches?.length || 0;
    if (expiringCount > 0 || expiredCount > 0) {
      console.log(`[Cron] Match expiry: ${expiringCount} expiring soon, ${expiredCount} expired`);
    }
  } catch (err) {
    console.error('[Cron] Match expiry error:', err);
  }
});

// ─── Hourly: Passport reset ─────────────────────────────────────────────────────

const passportResetJob = cron.schedule('0 * * * *', async () => {
  try {
    console.log('[Cron] Resetting expired passports...');

    const now = new Date().toISOString();

    const { data: expired, error } = await supabase
      .from('user_privileges')
      .update({
        passport_city: null,
        passport_expires: null,
      })
      .not('passport_expires', 'is', null)
      .lte('passport_expires', now)
      .select('user_id');

    if (expired && expired.length > 0) {
      console.log(`[Cron] Reset ${expired.length} expired passports`);
    }
  } catch (err) {
    console.error('[Cron] Passport reset error:', err);
  }
});

// ─── Hourly: Ban lift ───────────────────────────────────────────────────────────

const banLiftJob = cron.schedule('5 * * * *', async () => {
  try {
    console.log('[Cron] Checking for ban lifts...');

    const now = new Date().toISOString();

    // Lift suspensions
    const { data: unsuspended } = await supabase
      .from('users')
      .update({
        is_suspended: false,
        ban_expires: null,
      })
      .eq('is_suspended', true)
      .not('ban_expires', 'is', null)
      .lte('ban_expires', now)
      .select('id');

    // Lift temporary bans
    const { data: unbanned } = await supabase
      .from('users')
      .update({
        is_banned: false,
        is_active: true,
        ban_expires: null,
      })
      .eq('is_banned', true)
      .not('ban_expires', 'is', null)
      .lte('ban_expires', now)
      .select('id');

    const totalLifted = (unsuspended?.length || 0) + (unbanned?.length || 0);
    if (totalLifted > 0) {
      console.log(
        `[Cron] Lifted ${unsuspended?.length || 0} suspensions and ${unbanned?.length || 0} bans`
      );
    }
  } catch (err) {
    console.error('[Cron] Ban lift error:', err);
  }
});

// ─── Hourly: Premium expiry ─────────────────────────────────────────────────────

const premiumExpiryJob = cron.schedule('10 * * * *', async () => {
  try {
    console.log('[Cron] Checking premium expiry...');

    const now = new Date().toISOString();

    // Notify about premiums expiring in 3 days
    const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: expiringSoon } = await supabase
      .from('users')
      .select('id, plan, plan_expires')
      .neq('plan', 'free')
      .not('plan_expires', 'is', null)
      .lte('plan_expires', in3Days)
      .gt('plan_expires', now);

    for (const user of expiringSoon || []) {
      const daysLeft = Math.ceil(
        (new Date(user.plan_expires!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      const notifKey = `premium_expiry_notif:${user.id}`;
      const alreadyNotified = await redis.get(notifKey);
      if (!alreadyNotified) {
        await sendTemplateNotification('premium_expiring', user.id, {
          days: daysLeft.toString(),
        });
        await redis.set(notifKey, '1', 'EX', 86400);
      }
    }

    // Expire premium plans
    const { data: expired } = await supabase
      .from('users')
      .select('id')
      .neq('plan', 'free')
      .not('plan_expires', 'is', null)
      .lte('plan_expires', now);

    for (const user of expired || []) {
      // Check if auto-renew is on
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('auto_renew')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscription?.auto_renew) {
        // In production, trigger renewal charge
        console.log(`[Cron] Auto-renewal pending for user ${user.id}`);
        continue;
      }

      // Downgrade to free
      await supabase
        .from('users')
        .update({ plan: 'free', plan_expires: null })
        .eq('id', user.id);

      // Reset privileges to free tier
      await supabase
        .from('user_privileges')
        .update({
          daily_likes: 10,
          daily_super_likes: 1,
          daily_rewinds: 0,
          daily_comments: 3,
        })
        .eq('user_id', user.id);

      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      await sendTemplateNotification('premium_expired', user.id);
    }

    if ((expired?.length || 0) > 0) {
      console.log(`[Cron] Expired ${expired!.length} premium plans`);
    }
  } catch (err) {
    console.error('[Cron] Premium expiry error:', err);
  }
});

// ─── Daily midnight: Reset daily limits + daily prompt ──────────────────────────

const dailyResetJob = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('[Cron] Resetting daily limits...');

    // Reset all users' daily usage counters
    const { error } = await supabase
      .from('user_privileges')
      .update({
        likes_used: 0,
        super_likes_used: 0,
        rewinds_used: 0,
        comments_used: 0,
        last_reset_at: new Date().toISOString(),
      })
      .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Match all rows

    if (error) {
      console.error('[Cron] Daily limits reset error:', error.message);
    } else {
      console.log('[Cron] Daily limits reset complete');
    }

    // Clear daily notification counters from Redis
    let cursor = '0';
    do {
      const [newCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        'notif_daily:*',
        'COUNT',
        500
      );
      cursor = newCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');

    // Activate daily prompt for today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayPrompt } = await supabase
      .from('daily_prompts')
      .select('id, question')
      .eq('date', today)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (todayPrompt) {
      console.log(`[Cron] Today's prompt: "${todayPrompt.question}"`);
    } else {
      console.log('[Cron] No daily prompt set for today');
    }
  } catch (err) {
    console.error('[Cron] Daily reset error:', err);
  }
});

// ─── Daily 3AM: Hard delete expired accounts + clean old notifications ──────────

const cleanupJob = cron.schedule('0 3 * * *', async () => {
  try {
    console.log('[Cron] Running daily cleanup...');

    const now = new Date().toISOString();

    // Hard delete accounts scheduled for deletion that are past their 30-day grace period
    const { data: expiredAccounts } = await supabase
      .from('users')
      .select('id, auth_id')
      .not('delete_scheduled_at', 'is', null)
      .lte('delete_scheduled_at', now);

    for (const account of expiredAccounts || []) {
      console.log(`[Cron] Hard deleting user ${account.id}`);

      // Delete user data from all tables
      const userId = account.id;

      await Promise.all([
        supabase.from('basic_profiles').delete().eq('user_id', userId),
        supabase.from('sindhi_profiles').delete().eq('user_id', userId),
        supabase.from('chatti_profiles').delete().eq('user_id', userId),
        supabase.from('personality_profiles').delete().eq('user_id', userId),
        supabase.from('photos').delete().eq('user_id', userId),
        supabase.from('user_settings').delete().eq('user_id', userId),
        supabase.from('user_privileges').delete().eq('user_id', userId),
        supabase.from('actions').delete().eq('actor_id', userId),
        supabase.from('blocks').delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`),
        supabase.from('family_members').delete().or(`user_id.eq.${userId},family_account_id.eq.${userId}`),
        supabase.from('family_invites').delete().eq('user_id', userId),
        supabase.from('prompt_answers').delete().eq('user_id', userId),
        supabase.from('notifications').delete().eq('user_id', userId),
      ]);

      // Delete messages from matches this user was in
      const { data: userMatches } = await supabase
        .from('matches')
        .select('id')
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

      for (const match of userMatches || []) {
        await supabase.from('messages').delete().eq('match_id', match.id);
      }

      await supabase.from('matches').delete().or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

      // Delete storage files
      const { data: storageList } = await supabase.storage
        .from('photos')
        .list(`users/${userId}/photos`);

      if (storageList && storageList.length > 0) {
        const paths = storageList.map((f) => `users/${userId}/photos/${f.name}`);
        await supabase.storage.from('photos').remove(paths);
      }

      // Delete the user record last
      await supabase.from('users').delete().eq('id', userId);

      // Delete auth user from Supabase Auth
      if (account.auth_id) {
        await supabase.auth.admin.deleteUser(account.auth_id);
      }

      // Clean up Redis
      await redis.del(
        `last_active:${userId}`,
        `presence:${userId}`,
        `jwt_blacklist:${account.auth_id}`
      );
    }

    if ((expiredAccounts?.length || 0) > 0) {
      console.log(`[Cron] Hard deleted ${expiredAccounts!.length} accounts`);
    }

    // Clean old notifications (older than 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { error: notifCleanError } = await supabase
      .from('notifications')
      .delete()
      .lte('created_at', ninetyDaysAgo);

    if (notifCleanError) {
      console.error('[Cron] Notification cleanup error:', notifCleanError.message);
    }

    // Clean expired strikes
    const { data: expiredStrikes } = await supabase
      .from('strikes')
      .select('id, user_id')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lte('expires_at', now);

    for (const strike of expiredStrikes || []) {
      await supabase
        .from('strikes')
        .update({ status: 'expired' })
        .eq('id', strike.id);
    }

    if ((expiredStrikes?.length || 0) > 0) {
      console.log(`[Cron] Expired ${expiredStrikes!.length} strikes`);
    }

    console.log('[Cron] Daily cleanup complete');
  } catch (err) {
    console.error('[Cron] Daily cleanup error:', err);
  }
});

// ─── Start/Stop Functions ───────────────────────────────────────────────────────

export function startCronJobs(): void {
  console.log('[Cron] Starting cron jobs...');
  batchLikesJob.start();
  matchExpiryJob.start();
  passportResetJob.start();
  banLiftJob.start();
  premiumExpiryJob.start();
  dailyResetJob.start();
  cleanupJob.start();
  console.log('[Cron] All cron jobs started');
}

export function stopCronJobs(): void {
  console.log('[Cron] Stopping cron jobs...');
  batchLikesJob.stop();
  matchExpiryJob.stop();
  passportResetJob.stop();
  banLiftJob.stop();
  premiumExpiryJob.stop();
  dailyResetJob.stop();
  cleanupJob.stop();
  console.log('[Cron] All cron jobs stopped');
}

export default { startCronJobs, stopCronJobs };
