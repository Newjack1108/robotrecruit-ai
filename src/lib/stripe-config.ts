/**
 * Stripe Configuration
 * Define your subscription plans and pricing here
 */

export const STRIPE_PLANS = {
  pro: {
    name: 'Pro',
    tier: 2,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!, // Monthly price ID from Stripe
    price: 7.99, // £7.99/month
    currency: 'GBP',
    features: [
      'Unlimited bot conversations',
      'Hire up to 5 specialist bots',
      'Create up to 3 custom bots',
      '20 FREE power-up credits included',
      'File uploads (up to 10MB per bot)',
      'Priority support',
      'No ads',
    ],
  },
  premium: {
    name: 'Premium',
    tier: 3,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!, // Monthly price ID from Stripe
    price: 16.99, // £16.99/month
    currency: 'GBP',
    features: [
      'Everything in Pro',
      'Unlimited specialist bot hires',
      'Create up to 10 custom bots',
      '50 FREE power-up credits included',
      'File uploads (up to 50MB per bot)',
      'Premium support',
      'Early access to new features',
    ],
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;

export const getTierFromPriceId = (priceId: string): number => {
  for (const [_, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.priceId === priceId) {
      return plan.tier;
    }
  }
  return 1; // Default to free tier
};

export const getPlanByTier = (tier: number): (typeof STRIPE_PLANS)[StripePlanKey] | null => {
  for (const [_, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.tier === tier) {
      return plan;
    }
  }
  return null;
};

