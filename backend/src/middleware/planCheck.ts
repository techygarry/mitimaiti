import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest, Plan } from '../types';

/**
 * Middleware factory that restricts access based on user plan.
 *
 * Checks:
 * 1. User has the required plan tier (or higher)
 * 2. Plan has not expired
 *
 * Plan hierarchy: platinum > gold > free
 */
export function requirePlan(...allowedPlans: Plan[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      throw new AppError(401, 'Authentication required', 'AUTH_REQUIRED');
    }

    // Fetch fresh plan data from DB
    const { data: freshUser, error } = await supabase
      .from('users')
      .select('plan, plan_expires')
      .eq('id', user.id)
      .single();

    if (error || !freshUser) {
      throw new AppError(500, 'Failed to verify plan status', 'PLAN_CHECK_FAILED');
    }

    const currentPlan = freshUser.plan as Plan;
    const planExpires = freshUser.plan_expires
      ? new Date(freshUser.plan_expires)
      : null;

    // Check if premium plan has expired
    if (currentPlan !== 'free' && planExpires && planExpires < new Date()) {
      // Downgrade to free
      await supabase
        .from('users')
        .update({ plan: 'free', plan_expires: null })
        .eq('id', user.id);

      // Update the user object on the request
      user.plan = 'free';

      if (!allowedPlans.includes('free')) {
        throw new AppError(
          403,
          'Your premium plan has expired. Please renew to access this feature.',
          'PLAN_EXPIRED'
        );
      }

      next();
      return;
    }

    // Check if user's plan is in the allowed list
    if (!allowedPlans.includes(currentPlan)) {
      // Check plan hierarchy: platinum includes gold features
      const planHierarchy: Record<Plan, number> = {
        free: 0,
        gold: 1,
        platinum: 2,
      };

      const userLevel = planHierarchy[currentPlan];
      const minRequired = Math.min(...allowedPlans.map((p) => planHierarchy[p]));

      if (userLevel < minRequired) {
        throw new AppError(
          403,
          `This feature requires a ${allowedPlans.join(' or ')} plan. Upgrade to access.`,
          'PLAN_REQUIRED'
        );
      }
    }

    // Update user plan on request in case it was stale
    user.plan = currentPlan;

    next();
  };
}

/**
 * Convenience: require at least gold plan.
 */
export const requireGold = requirePlan('gold', 'platinum');

/**
 * Convenience: require platinum plan.
 */
export const requirePlatinum = requirePlan('platinum');

/**
 * Middleware that attaches fresh plan info but does not block.
 * Useful for routes that behave differently based on plan.
 */
export async function attachPlanInfo(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    next();
    return;
  }

  const { data: freshUser } = await supabase
    .from('users')
    .select('plan, plan_expires')
    .eq('id', user.id)
    .single();

  if (freshUser) {
    const planExpires = freshUser.plan_expires
      ? new Date(freshUser.plan_expires)
      : null;

    if (freshUser.plan !== 'free' && planExpires && planExpires < new Date()) {
      user.plan = 'free';
      await supabase
        .from('users')
        .update({ plan: 'free', plan_expires: null })
        .eq('id', user.id);
    } else {
      user.plan = freshUser.plan as Plan;
    }
  }

  next();
}

export default requirePlan;
