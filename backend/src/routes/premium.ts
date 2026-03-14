import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { strictRateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest, PremiumPlanConfig } from '../types';
import { sendTemplateNotification } from '../services/notifications';

const router = Router();

// ─── Plan Configurations ────────────────────────────────────────────────────────

const PLANS: PremiumPlanConfig[] = [
  {
    id: 'gold_monthly',
    name: 'Gold Monthly',
    tier: 'gold',
    duration_days: 30,
    price_inr: 499,
    price_usd: 5.99,
    features: [
      'See who liked you',
      '30 likes per day',
      '5 super likes per day',
      '3 rewinds per day',
      '15 comments per day',
      'Advanced filters',
      'Passport mode',
      'Read receipts',
    ],
  },
  {
    id: 'gold_quarterly',
    name: 'Gold Quarterly',
    tier: 'gold',
    duration_days: 90,
    price_inr: 1199,
    price_usd: 14.99,
    features: [
      'All Gold Monthly features',
      'Save 20%',
    ],
  },
  {
    id: 'gold_yearly',
    name: 'Gold Yearly',
    tier: 'gold',
    duration_days: 365,
    price_inr: 3999,
    price_usd: 49.99,
    features: [
      'All Gold Monthly features',
      'Save 33%',
    ],
  },
  {
    id: 'platinum_monthly',
    name: 'Platinum Monthly',
    tier: 'platinum',
    duration_days: 30,
    price_inr: 999,
    price_usd: 11.99,
    features: [
      'All Gold features',
      'Unlimited likes',
      '10 super likes per day',
      'Unlimited rewinds',
      'Unlimited comments',
      'Priority in feed',
      'Kundli matching',
      'Profile boost included',
      'Hide ads',
    ],
  },
  {
    id: 'platinum_quarterly',
    name: 'Platinum Quarterly',
    tier: 'platinum',
    duration_days: 90,
    price_inr: 2499,
    price_usd: 29.99,
    features: [
      'All Platinum Monthly features',
      'Save 17%',
    ],
  },
  {
    id: 'platinum_yearly',
    name: 'Platinum Yearly',
    tier: 'platinum',
    duration_days: 365,
    price_inr: 7999,
    price_usd: 99.99,
    features: [
      'All Platinum Monthly features',
      'Save 33%',
    ],
  },
];

// ─── Region-based pricing multipliers ───────────────────────────────────────────

const REGION_MULTIPLIERS: Record<string, { inr: number; usd: number }> = {
  IN: { inr: 1.0, usd: 1.0 },
  US: { inr: 1.0, usd: 1.0 },
  GB: { inr: 1.0, usd: 1.1 },
  AE: { inr: 1.2, usd: 1.2 },
  SG: { inr: 1.1, usd: 1.1 },
  CA: { inr: 1.0, usd: 1.05 },
  AU: { inr: 1.0, usd: 1.1 },
  DEFAULT: { inr: 1.0, usd: 1.0 },
};

// ─── Schemas ────────────────────────────────────────────────────────────────────

const activateSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  paymentToken: z.string().min(1, 'Payment token is required'),
  paymentMethod: z.enum(['apple_iap', 'google_play', 'stripe', 'razorpay']),
  receiptData: z.string().optional(),
});

const webhookSchema = z.object({
  event: z.string(),
  paymentId: z.string(),
  status: z.string(),
  userId: z.string().optional(),
  planId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const restoreSchema = z.object({
  platform: z.enum(['ios', 'android']),
  receiptData: z.string().min(1),
});

// ─── GET /v1/premium/plans ──────────────────────────────────────────────────────

router.get(
  '/plans',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const region = (req.query.region as string)?.toUpperCase() || 'DEFAULT';

    // Get region multiplier
    const multiplier = REGION_MULTIPLIERS[region] || REGION_MULTIPLIERS.DEFAULT;

    // Get current plan
    const { data: userData } = await supabase
      .from('users')
      .select('plan, plan_expires')
      .eq('id', user.id)
      .single();

    const plans = PLANS.map((plan) => ({
      ...plan,
      price_inr: Math.round(plan.price_inr * multiplier.inr),
      price_usd: Math.round(plan.price_usd * multiplier.usd * 100) / 100,
      isCurrent:
        userData?.plan === plan.tier &&
        userData?.plan_expires &&
        new Date(userData.plan_expires) > new Date(),
    }));

    res.json({
      success: true,
      data: {
        currentPlan: userData?.plan || 'free',
        planExpires: userData?.plan_expires || null,
        plans,
        region: region === 'DEFAULT' ? null : region,
      },
    });
  })
);

// ─── POST /v1/premium/activate ──────────────────────────────────────────────────

router.post(
  '/activate',
  authenticate,
  strictRateLimit,
  validate(activateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { planId, paymentToken, paymentMethod, receiptData } = req.body;

    // Find the plan
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      throw new AppError(404, 'Plan not found', 'PLAN_NOT_FOUND');
    }

    // Stub: Verify payment with the payment provider
    // In production, this would:
    // 1. Verify receipt with Apple/Google/Stripe/Razorpay
    // 2. Check for duplicate transactions
    // 3. Handle upgrade/downgrade logic

    console.log(
      `[Premium] ACTIVATE: User ${user.id} - Plan ${planId} - Method ${paymentMethod} - Token ${paymentToken.slice(0, 10)}...`
    );

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    // Update user plan
    await supabase
      .from('users')
      .update({
        plan: plan.tier,
        plan_expires: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Update privileges based on plan tier
    const privilegeUpdates: Record<string, any> = {};
    if (plan.tier === 'gold') {
      privilegeUpdates.daily_likes = 30;
      privilegeUpdates.daily_super_likes = 5;
      privilegeUpdates.daily_rewinds = 3;
      privilegeUpdates.daily_comments = 15;
    } else if (plan.tier === 'platinum') {
      privilegeUpdates.daily_likes = 999999; // Unlimited
      privilegeUpdates.daily_super_likes = 10;
      privilegeUpdates.daily_rewinds = 999999;
      privilegeUpdates.daily_comments = 999999;
    }

    if (Object.keys(privilegeUpdates).length > 0) {
      await supabase
        .from('user_privileges')
        .update(privilegeUpdates)
        .eq('user_id', user.id);
    }

    // Record the subscription
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan_id: planId,
      plan_tier: plan.tier,
      payment_method: paymentMethod,
      payment_token: paymentToken,
      receipt_data: receiptData || null,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      auto_renew: true,
      status: 'active',
    });

    // Notify user
    await sendTemplateNotification('premium_activated', user.id, {
      plan: plan.name,
    });

    res.json({
      success: true,
      data: {
        plan: plan.tier,
        planName: plan.name,
        expiresAt: expiresAt.toISOString(),
        features: plan.features,
      },
    });
  })
);

// ─── POST /v1/premium/webhook ───────────────────────────────────────────────────

router.post(
  '/webhook',
  validate(webhookSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { event, paymentId, status, userId, planId, metadata } = req.body;

    // Stub: Process webhook from payment provider
    // In production, this would handle:
    // - payment.success -> activate subscription
    // - payment.failed -> notify user
    // - subscription.renewed -> extend expiry
    // - subscription.cancelled -> set auto_renew false
    // - refund.processed -> deactivate subscription

    console.log(
      `[Premium Webhook] Event: ${event} - PaymentId: ${paymentId} - Status: ${status}`
    );

    switch (event) {
      case 'payment.success':
        if (userId && planId) {
          console.log(
            `[Premium Webhook] Payment success for user ${userId}, plan ${planId}`
          );
        }
        break;

      case 'subscription.cancelled':
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ auto_renew: false })
            .eq('user_id', userId)
            .eq('status', 'active');
        }
        break;

      case 'refund.processed':
        if (userId) {
          await supabase
            .from('users')
            .update({ plan: 'free', plan_expires: null })
            .eq('id', userId);
        }
        break;

      default:
        console.log(`[Premium Webhook] Unhandled event: ${event}`);
    }

    // Always respond 200 to webhooks
    res.json({ received: true });
  })
);

// ─── POST /v1/premium/cancel ────────────────────────────────────────────────────

router.post(
  '/cancel',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;

    // Set auto_renew to false on active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({ auto_renew: false })
      .eq('user_id', user.id)
      .eq('status', 'active')
      .select()
      .single();

    if (error || !subscription) {
      throw new AppError(404, 'No active subscription found', 'NO_SUBSCRIPTION');
    }

    res.json({
      success: true,
      data: {
        message:
          'Auto-renewal has been cancelled. Your premium features will remain active until the current period ends.',
        expiresAt: subscription.expires_at,
        autoRenew: false,
      },
    });
  })
);

// ─── POST /v1/premium/restore ───────────────────────────────────────────────────

router.post(
  '/restore',
  authenticate,
  validate(restoreSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const { platform, receiptData } = req.body;

    // Stub: Verify purchase receipt with Apple/Google
    // In production, this would:
    // 1. Validate receipt with the platform
    // 2. Check if receipt is valid and not expired
    // 3. Find matching subscription and restore it

    console.log(
      `[Premium] RESTORE: User ${user.id} - Platform ${platform} - Receipt length ${receiptData.length}`
    );

    // Check for existing subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSub && new Date(existingSub.expires_at) > new Date()) {
      // Restore the subscription
      await supabase
        .from('users')
        .update({
          plan: existingSub.plan_tier,
          plan_expires: existingSub.expires_at,
        })
        .eq('id', user.id);

      res.json({
        success: true,
        data: {
          restored: true,
          plan: existingSub.plan_tier,
          expiresAt: existingSub.expires_at,
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          restored: false,
          message: 'No active subscription found to restore',
        },
      });
    }
  })
);

export default router;
