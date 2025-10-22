/**
 * Get the initial powerup credits for a given tier
 * Free tier: 5 credits to try features
 * Pro tier: 20 credits for regular use
 * Premium/Enterprise: 50 credits for power users
 */
export function getTierPowerUpCredits(tier: number): number {
  const credits: Record<number, number> = {
    1: 5,    // Free tier - 5 credits to try
    2: 20,   // Pro tier - 20 credits
    3: 50,   // Premium/Enterprise - 50 credits
  };
  return credits[tier] || 0;
}

/**
 * Get the additional credits when upgrading from one tier to another
 * Only grants the difference to avoid double-crediting
 */
export function getTierUpgradeCredits(fromTier: number, toTier: number): number {
  const fromCredits = getTierPowerUpCredits(fromTier);
  const toCredits = getTierPowerUpCredits(toTier);
  
  // Only give additional credits if upgrading, not downgrading
  return Math.max(0, toCredits - fromCredits);
}

/**
 * Get the tier name for display purposes
 */
export function getTierName(tier: number): string {
  const names: Record<number, string> = {
    1: 'Free',
    2: 'Pro',
    3: 'Premium',
  };
  return names[tier] || 'Unknown';
}

