// Power-Up Credit Packages Configuration

export interface PowerUpPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // in GBP
  priceId: string; // Stripe Price ID (set in environment or here)
  popular?: boolean;
  savings?: string; // e.g., "Save 20%"
  description: string;
}

export const POWERUP_PACKAGES: PowerUpPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 10,
    price: 3.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_POWERUP_10_PRICE_ID || 'price_starter',
    description: 'Perfect for trying out power-ups',
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 50,
    price: 15.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_POWERUP_50_PRICE_ID || 'price_popular',
    popular: true,
    savings: 'Save 20%',
    description: 'Most popular choice for regular users',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 100,
    price: 27.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_POWERUP_100_PRICE_ID || 'price_pro',
    savings: 'Save 30%',
    description: 'Best value for power users',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 250,
    price: 63.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_POWERUP_250_PRICE_ID || 'price_enterprise',
    savings: 'Save 36%',
    description: 'Maximum credits for teams and heavy users',
  },
];

// Calculate price per credit
export function getPricePerCredit(packageItem: PowerUpPackage): number {
  return packageItem.price / packageItem.credits;
}

// Get the best value package
export function getBestValuePackage(): PowerUpPackage {
  return POWERUP_PACKAGES.reduce((best, current) => {
    const bestPrice = getPricePerCredit(best);
    const currentPrice = getPricePerCredit(current);
    return currentPrice < bestPrice ? current : best;
  });
}

// Calculate savings percentage compared to starter pack
export function calculateSavings(packageItem: PowerUpPackage): number {
  const starterPricePerCredit = getPricePerCredit(POWERUP_PACKAGES[0]);
  const currentPricePerCredit = getPricePerCredit(packageItem);
  return Math.round(((starterPricePerCredit - currentPricePerCredit) / starterPricePerCredit) * 100);
}

