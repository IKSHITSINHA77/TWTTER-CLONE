// src/lib/subscriptionConfig.ts

export type SubscriptionTier = 'free' | 'bronze' | 'silver' | 'gold';

export interface PlanDetails {
  id: SubscriptionTier;
  name: string;
  priceINR: number;
  tweetLimit: number | null; // null represents unlimited
  description: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    priceINR: 0,
    tweetLimit: 1,
    description: 'Allows posting 1 tweet.',
  },
  bronze: {
    id: 'bronze',
    name: 'Bronze Plan',
    priceINR: 100,
    tweetLimit: 3,
    description: 'Allows posting up to 3 tweets per month.',
  },
  silver: {
    id: 'silver',
    name: 'Silver Plan',
    priceINR: 300,
    tweetLimit: 5,
    description: 'Allows posting up to 5 tweets per month.',
  },
  gold: {
    id: 'gold',
    name: 'Gold Plan',
    priceINR: 1000,
    tweetLimit: null, // Unlimited
    description: 'Unlimited tweet posting.',
  },
};

/**
 * Validates if the user is allowed to post based on their current count and plan.
 */
export const canUserPostTweet = (
  tier: SubscriptionTier = 'free',
  currentPostCount: number = 0
): { allowed: boolean; remaining: number | 'Unlimited'; message?: string } => {
  const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.free;

  if (plan.tweetLimit === null) {
    return { allowed: true, remaining: 'Unlimited' };
  }

  if (currentPostCount >= plan.tweetLimit) {
    return {
      allowed: false,
      remaining: 0,
      message: `You have reached the posting limit of ${plan.tweetLimit} tweet(s) for the ${plan.name}. Please upgrade to continue posting.`,
    };
  }

  return {
    allowed: true,
    remaining: plan.tweetLimit - currentPostCount,
  };
};

// Global shared store for tracking usage across API routes
export const userPostUsage = new Map<string, { count: number; plan: SubscriptionTier }>();

export const getUserUsage = (userId: string) => {
  if (!userPostUsage.has(userId)) {
    userPostUsage.set(userId, { count: 0, plan: 'free' });
  }
  return userPostUsage.get(userId)!;
};