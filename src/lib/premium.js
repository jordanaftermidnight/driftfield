// ============================================================
// DRIFTFIELD: Premium Feature Gating
// ============================================================
// Centralised feature flags based on subscription tier.
// Server-side enforcement happens via Supabase RLS + functions.
// This file handles client-side UI gating (what to show/hide).
// ============================================================

export const TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  LIFETIME: 'lifetime',
};

export const LIMITS = {
  free: {
    probesPerDay: 1,
    eventHistoryDays: 7,
    decisionMaxOptions: 2,
    entropyAnalysisDepth: 'summary', // 'summary' | 'full'
    patternDetection: 'basic', // 'basic' | 'full'
    probeCardStyling: 'default', // 'default' | 'custom'
    cloudSync: false,
    pushNotifications: false,
    exportData: false,
    continuousScanning: false,
    decisionHistory: false,
    streakDashboard: false,
  },
  premium: {
    probesPerDay: Infinity,
    eventHistoryDays: Infinity,
    decisionMaxOptions: Infinity,
    entropyAnalysisDepth: 'full',
    patternDetection: 'full',
    probeCardStyling: 'custom',
    cloudSync: true,
    pushNotifications: true,
    exportData: true,
    continuousScanning: true,
    decisionHistory: true,
    streakDashboard: true,
  },
  lifetime: {
    // Same as premium
    probesPerDay: Infinity,
    eventHistoryDays: Infinity,
    decisionMaxOptions: Infinity,
    entropyAnalysisDepth: 'full',
    patternDetection: 'full',
    probeCardStyling: 'custom',
    cloudSync: true,
    pushNotifications: true,
    exportData: true,
    continuousScanning: true,
    decisionHistory: true,
    streakDashboard: true,
  },
};

/**
 * Get the feature limits for a user's subscription tier.
 * @param {string} tier - 'free' | 'premium' | 'lifetime'
 * @param {string} status - 'active' | 'inactive' | 'past_due' | 'cancelled'
 * @returns {object} Feature limits object
 */
export function getFeatureLimits(tier = 'free', status = 'inactive') {
  // Past due gets a 3-day grace period (handled server-side),
  // but client-side we still show premium features
  const isPremiumActive =
    (tier === 'premium' || tier === 'lifetime') &&
    (status === 'active' || status === 'past_due');

  return isPremiumActive ? LIMITS.premium : LIMITS.free;
}

/**
 * Check if a specific feature is available.
 * @param {string} feature - Feature key from LIMITS
 * @param {object} profile - User profile with subscription_tier and subscription_status
 * @returns {boolean}
 */
export function hasFeature(feature, profile) {
  if (!profile) return LIMITS.free[feature];
  const limits = getFeatureLimits(profile.subscription_tier, profile.subscription_status);
  const value = limits[feature];
  // Boolean features
  if (typeof value === 'boolean') return value;
  // Numeric features (Infinity means unlimited)
  if (typeof value === 'number') return value > 0;
  // String features (anything not 'default' or 'basic' or 'summary')
  return value !== 'default' && value !== 'basic' && value !== 'summary';
}

/**
 * Check if user can fire a probe right now.
 * Uses the server-side response from check_probe_limit for accuracy.
 * This is a client-side fallback for optimistic UI.
 * @param {object} profile - User profile
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function canFireProbe(profile) {
  if (!profile) return { allowed: false, remaining: 0 };
  const limits = getFeatureLimits(profile.subscription_tier, profile.subscription_status);
  const remaining = Math.max(0, limits.probesPerDay - (profile.probes_fired_today || 0));
  return {
    allowed: remaining > 0,
    remaining,
    isUnlimited: limits.probesPerDay === Infinity,
  };
}

// ============================================================
// Premium pricing constants
// ============================================================
export const PRICING = {
  monthly: {
    amount: 199, // cents
    display: '$1.99',
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
  },
  yearly: {
    amount: 1199, // cents
    display: '$11.99',
    interval: 'year',
    savings: '50%',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_YEARLY || '',
  },
};
