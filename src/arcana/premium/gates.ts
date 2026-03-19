// ============================================================================
// DRIFTFIELD — PREMIUM FEATURE GATING (Client-side)
// Controls what UI elements to show/hide based on tier.
// NOTE: DB enforces actual limits. This is for UX only — never trust client.
// ============================================================================

export type SubscriptionTier = 'free' | 'premium';

export interface FeatureGates {
  // Readings
  readingsPerDay: number;           // free: 1, premium: Infinity
  canCreateReading: boolean;        // based on today's count

  // Spreads
  availableSpreads: string[];       // spread IDs accessible to this tier
  canUseSpread: (spreadId: string) => boolean;

  // Decks
  availableDecks: string[];
  canUseDeck: (deckSystem: string) => boolean;

  // Traditions
  availableTraditions: string[];

  // Shuffle/Pull
  availableShuffleMethods: string[];
  availablePullMethods: string[];

  // Camera
  camerascansPerDay: number;
  canUseCamera: boolean;

  // Tones
  availableTones: string[];

  // Composition
  compositionTier: 'template' | 'local_model' | 'api';

  // Birth chart
  birthChartDepth: 'sun_only' | 'full_chart';

  // Domain tags
  maxDomainTags: number;

  // History
  readingHistoryDays: number;       // free: 7, premium: Infinity

  // Journal
  journalEnabled: boolean;

  // Patterns
  patternsEnabled: boolean;

  // Outcome tracking
  outcomeTrackingEnabled: boolean;

  // Entropy metadata
  entropyExportable: boolean;
}

const FREE_SPREADS = ['single_card', 'two_card_duality', 'three_card_ppf', 'three_card_mbs', 'three_card_sao', 'five_card'];
const ALL_SPREADS = [...FREE_SPREADS, 'horseshoe', 'celtic_cross', 'relationship_mirror', 'shadow_work'];
const FREE_DECKS = ['rws'];
const ALL_DECKS = ['rws', 'thoth', 'marseille_conver', 'lenormand_blue_owl', 'egyptian_bol'];
const FREE_TRADITIONS = ['standard', 'intuitive'];
const ALL_TRADITIONS = ['standard', 'intuitive', 'thelemic', 'golden_dawn', 'hermetic', 'jungian', 'astrological', 'therapeutic', 'wiccan', 'cartomantic'];
const FREE_SHUFFLES = ['overhand', 'riffle'];
const ALL_SHUFFLES = ['overhand', 'riffle', 'wash', 'hindu', 'pile', 'cut'];
const FREE_PULLS = ['top'];
const ALL_PULLS = ['top', 'fan', 'cut_reveal'];
const FREE_TONES = ['practical'];
const ALL_TONES = ['practical', 'esoteric', 'poetic', 'analytical'];

export function getFeatureGates(
  tier: SubscriptionTier,
  todayReadingCount: number = 0,
  todayCameraCount: number = 0,
): FeatureGates {
  const isPremium = tier === 'premium';

  return {
    readingsPerDay: isPremium ? Infinity : 1,
    canCreateReading: isPremium || todayReadingCount < 1,

    availableSpreads: isPremium ? ALL_SPREADS : FREE_SPREADS,
    canUseSpread: (id) => isPremium || FREE_SPREADS.includes(id),

    availableDecks: isPremium ? ALL_DECKS : FREE_DECKS,
    canUseDeck: (ds) => isPremium || FREE_DECKS.includes(ds),

    availableTraditions: isPremium ? ALL_TRADITIONS : FREE_TRADITIONS,

    availableShuffleMethods: isPremium ? ALL_SHUFFLES : FREE_SHUFFLES,
    availablePullMethods: isPremium ? ALL_PULLS : FREE_PULLS,

    camerascansPerDay: isPremium ? Infinity : 1,
    canUseCamera: isPremium || todayCameraCount < 1,

    availableTones: isPremium ? ALL_TONES : FREE_TONES,
    compositionTier: isPremium ? 'api' : 'template',
    birthChartDepth: isPremium ? 'full_chart' : 'sun_only',
    maxDomainTags: isPremium ? 8 : 2,
    readingHistoryDays: isPremium ? Infinity : 7,
    journalEnabled: isPremium,
    patternsEnabled: isPremium,
    outcomeTrackingEnabled: isPremium,
    entropyExportable: isPremium,
  };
}
