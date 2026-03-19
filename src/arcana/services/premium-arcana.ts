// ============================================================================
// DRIFTFIELD — PREMIUM GATING (Arcana Engine Extensions)
// Extends existing premium.js with tarot-specific feature gates
// ============================================================================

export type PremiumTier = 'free' | 'premium';

// ─── Feature limits by tier ──────────────────────────────────────────────────

export const ARCANA_LIMITS = {
  free: {
    readingsPerDay: 1,
    spreads: ['single_card', 'two_card', 'three_card_ppf', 'three_card_mbs', 'three_card_sao', 'five_card'],
    deckSystems: ['rws'] as string[],
    traditions: ['standard', 'intuitive'] as string[],
    shuffleMethods: ['overhand', 'riffle'] as string[],
    pullMethods: ['top'] as string[],
    interpretationTones: ['practical'] as string[],
    compositionTier: 'template' as const,
    birthChart: 'sun_only' as const,       // only sun sign
    maxDomainTags: 2,
    readingHistoryDays: 7,
    journalEnabled: false,
    patternMemory: false,
    outcomeTracking: false,
    cameraScansPerDay: 1,
    entropyExportable: false,
  },
  premium: {
    readingsPerDay: Infinity,
    spreads: 'all' as const,
    deckSystems: 'all' as const,
    traditions: 'all' as const,
    shuffleMethods: 'all' as const,
    pullMethods: 'all' as const,
    interpretationTones: 'all' as const,
    compositionTier: 'local_model' as const,  // + optional 'api' add-on
    birthChart: 'full' as const,              // sun, moon, rising, planets
    maxDomainTags: Infinity,
    readingHistoryDays: Infinity,
    journalEnabled: true,
    patternMemory: true,
    outcomeTracking: true,
    cameraScansPerDay: Infinity,
    entropyExportable: true,
  }
} as const;

// ─── Gate checks ──────────────────────────────────────────────────────────────

export function canDoReading(tier: PremiumTier, readingsToday: number): boolean {
  return readingsToday < ARCANA_LIMITS[tier].readingsPerDay;
}

export function canUseSpread(tier: PremiumTier, spreadId: string): boolean {
  const allowed = ARCANA_LIMITS[tier].spreads;
  if (allowed === 'all') return true;
  return allowed.includes(spreadId);
}

export function canUseDeck(tier: PremiumTier, deckSystem: string): boolean {
  const allowed = ARCANA_LIMITS[tier].deckSystems;
  if (allowed === 'all') return true;
  return allowed.includes(deckSystem);
}

export function canUseTradition(tier: PremiumTier, tradition: string): boolean {
  const allowed = ARCANA_LIMITS[tier].traditions;
  if (allowed === 'all') return true;
  return allowed.includes(tradition);
}

export function canUseShuffle(tier: PremiumTier, method: string): boolean {
  const allowed = ARCANA_LIMITS[tier].shuffleMethods;
  if (allowed === 'all') return true;
  return allowed.includes(method);
}

export function canUsePull(tier: PremiumTier, method: string): boolean {
  const allowed = ARCANA_LIMITS[tier].pullMethods;
  if (allowed === 'all') return true;
  return allowed.includes(method);
}

export function canUseTone(tier: PremiumTier, tone: string): boolean {
  const allowed = ARCANA_LIMITS[tier].interpretationTones;
  if (allowed === 'all') return true;
  return allowed.includes(tone);
}

export function canUseCameraScan(tier: PremiumTier, scansToday: number): boolean {
  return scansToday < ARCANA_LIMITS[tier].cameraScansPerDay;
}

export function getMaxDomainTags(tier: PremiumTier): number {
  return ARCANA_LIMITS[tier].maxDomainTags;
}

export function hasJournal(tier: PremiumTier): boolean {
  return ARCANA_LIMITS[tier].journalEnabled;
}

export function hasPatternMemory(tier: PremiumTier): boolean {
  return ARCANA_LIMITS[tier].patternMemory;
}

export function hasOutcomeTracking(tier: PremiumTier): boolean {
  return ARCANA_LIMITS[tier].outcomeTracking;
}

export function getBirthChartLevel(tier: PremiumTier): 'sun_only' | 'full' {
  return ARCANA_LIMITS[tier].birthChart;
}

// ─── Upsell message generator ─────────────────────────────────────────────────

export function getUpsellMessage(feature: string): string {
  const messages: Record<string, string> = {
    reading_limit: 'You\u2019ve used your free reading for today. Unlock unlimited readings with Premium.',
    spread: 'This spread is available with Premium. Unlock all 40+ spreads.',
    deck: 'This deck system is available with Premium. Unlock Thoth, Marseille, Lenormand, and more.',
    tradition: 'This interpretive tradition is available with Premium.',
    shuffle: 'This shuffle method is available with Premium. Unlock all 6 methods.',
    pull: 'This pull method is available with Premium.',
    tone: 'Additional interpretation tones are available with Premium.',
    camera: 'You\u2019ve used your free camera scan for today. Unlock unlimited scans with Premium.',
    journal: 'The reading journal is a Premium feature. Keep notes across your readings.',
    patterns: 'Pattern Memory is a Premium feature. Discover recurring themes across your readings.',
    birth_chart: 'Full birth chart analysis (moon, rising, planets) is available with Premium.',
    outcome: 'Outcome tracking is a Premium feature. Record what actually happened.',
  };
  return messages[feature] || 'This feature is available with Premium.';
}
