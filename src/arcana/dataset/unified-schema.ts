// ============================================================================
// DRIFTFIELD — UNIFIED MULTI-TRADITION CARD DATASET
// Consistent labeling schema across all deck systems.
// Enables: ML training across traditions, cross-deck translation,
// unified interpretation pipeline regardless of source deck.
// ============================================================================

/**
 * CANONICAL CARD IDENTIFIER
 * Every card in every tradition maps to a canonical ID.
 * This is the Rosetta Stone that lets the system treat
 * a Thoth "Princess of Disks" and an RWS "Page of Pentacles"
 * as the same structural position with different interpretive content.
 */
export interface CanonicalCard {
  // Universal identifiers
  canonicalId: string;              // 'major-00', 'minor-fire-01', 'court-water-queen'
  universalName: string;            // 'The Fool', 'Ace of Fire', 'Queen of Water'
  arcana: 'major' | 'minor' | 'court';
  sequenceNumber: number;           // 0–21 for majors, 1–10 for minors, 1–4 for courts

  // Elemental mapping (universal across all traditions)
  element?: 'fire' | 'water' | 'air' | 'earth' | 'spirit';

  // Court rank (normalized)
  courtRank?: 'youth' | 'warrior' | 'mature_inner' | 'mature_outer';  // maps to page/knight/queen/king etc.

  // Astrological correspondences (Golden Dawn system as baseline)
  zodiac?: string;
  planet?: string;
  decan?: string;

  // Qabalistic
  hebrewLetter?: string;
  treeOfLifePath?: string;
  sephirah?: string;                // for pip cards: sephirah by number
}

/**
 * TRADITION-SPECIFIC CARD VARIANT
 * How a specific tradition names, depicts, and interprets this canonical card.
 */
export interface TraditionVariant {
  canonicalId: string;              // links to CanonicalCard
  tradition: TraditionId;
  deckSystem: DeckSystemId;

  // Tradition-specific naming
  cardName: string;                 // 'The Fool' (RWS), 'The Fool' (Thoth), 'Le Mat' (Marseille)
  alternateNames: string[];         // ['Il Matto', 'Der Narr', 'Le Fou']
  thothTitle?: string;              // 'The Spirit of Ether' (Thoth-specific titles)

  // Numbering (may differ between traditions)
  number: number;                   // RWS: Strength=8, Justice=11; Thoth: Adjustment=8, Lust=11
  traditionalNumeral?: string;      // 'VIII', 'XI', 'none' (Fool has no number in some traditions)

  // Suit naming
  suitName?: string;                // 'Wands', 'Batons', 'Clubs', 'Staves'
  courtRankName?: string;           // 'Page', 'Princess', 'Valet', 'Youth', 'Horseman'

  // Visual description (for AI art generation and ML training)
  visualDescription: string;        // Prose description of what the card depicts
  keySymbols: string[];             // ['white rose', 'cliff edge', 'small dog', 'mountains']
  dominantColors: string[];         // ['yellow', 'white', 'red', 'blue sky']
  figureCount: number;              // number of human/divine figures depicted
  gazeDirection?: 'left' | 'right' | 'forward' | 'upward' | 'downward' | 'none';

  // Tradition-specific interpretation modifiers
  reversalSystem: 'standard' | 'elemental_dignity' | 'ill_dignified' | 'none';
  specialRules?: string[];          // e.g., ['horseman_represents_thoughts_not_people'] for BoL
}

/**
 * ML TRAINING LABEL
 * Standardized label format for card recognition training data.
 * One label per image in the training set.
 */
export interface MLTrainingLabel {
  // Image metadata
  imageId: string;                  // unique identifier for this training image
  imagePath: string;                // relative path in dataset
  imageWidth: number;
  imageHeight: number;

  // Card identification
  canonicalId: string;              // universal card identity
  deckSystem: DeckSystemId;         // which deck system this image is from
  deckEdition?: string;             // 'pam-a', 'pam-b', '1971-usg', 'green-tin' etc.

  // Classification labels
  cardName: string;                 // human-readable
  arcana: 'major' | 'minor' | 'court';
  suit?: string;                    // tradition-specific suit name
  number?: number;
  courtRank?: string;

  // Orientation
  orientation: 'upright' | 'reversed';
  rotationDegrees: number;          // actual rotation from upright (0–360)

  // Image quality metadata
  source: 'scan' | 'photograph' | 'synthetic' | 'user_contributed';
  quality: 'archival' | 'high' | 'medium' | 'low';
  background: 'isolated' | 'table' | 'cloth' | 'mixed' | 'unknown';
  lighting: 'studio' | 'natural' | 'artificial' | 'mixed' | 'unknown';
  occlusion: 'none' | 'partial' | 'significant';

  // Bounding box (for object detection training)
  boundingBox?: {
    x: number;      // top-left x (normalized 0–1)
    y: number;      // top-left y (normalized 0–1)
    width: number;  // width (normalized 0–1)
    height: number; // height (normalized 0–1)
  };

  // Augmentation metadata (if synthetic)
  augmentation?: {
    perspectiveWarp: boolean;
    brightnessJitter: number;       // -1 to +1
    gaussianBlur: number;           // sigma
    backgroundComposited: boolean;
    shadowAdded: boolean;
    colorJitter: number;            // 0–1
  };
}

// ── TRADITION AND DECK SYSTEM IDS ───────────────────────────────────────────

export type DeckSystemId =
  | 'rws'               // Rider-Waite-Smith (1909)
  | 'rws_usg'           // US Games 1971 recolor
  | 'thoth'             // Crowley-Harris Thoth
  | 'marseille_noblet'  // Jean Noblet (c.1650)
  | 'marseille_conver'  // Nicolas Conver (1760)
  | 'marseille_cbd'     // Conver-Ben-Dov restoration
  | 'marseille_jodo'    // Jodorowsky-Camoin
  | 'lenormand_blue_owl'// Blue Owl Lenormand
  | 'lenormand_petit'   // Petit Lenormand
  | 'egyptian_bol'      // Brotherhood of Light
  | 'egyptian_kier'     // Egipcios Kier
  | 'egyptian_ibis'     // Ibis Tarot
  | 'visconti_sforza'   // Visconti-Sforza (c.1450)
  | 'sola_busca'        // Sola Busca (1491)
  | 'golden_dawn'       // GD Magical Tarot
  | 'rohrig'            // Röhrig Thoth
  | 'tabula_mundi'      // M.M. Meleen
  | 'driftfield'        // Driftfield original (procedural/commissioned)
  | 'custom';           // User-submitted deck

export type TraditionId =
  | 'standard'          // Generic/modern
  | 'thelemic'          // Crowley/Thelema
  | 'golden_dawn'       // Hermetic Order of the GD
  | 'hermetic'          // Broader Hermetic tradition
  | 'jungian'           // Archetypal psychology
  | 'kabbalistic'       // Jewish mystical Kabbalah
  | 'wiccan'            // Wiccan/Pagan
  | 'cartomantic'       // French fortune-telling
  | 'astrological'      // Astrology-primary
  | 'therapeutic'       // Counseling/non-predictive
  | 'intuitive'         // No formal tradition
  | 'egyptian'          // Egyptian esoteric
  | 'etteilla'          // Etteilla system
  | 'historical';       // Pre-occult Renaissance

// ── CROSS-TRADITION MAPPING TABLE ───────────────────────────────────────────

/**
 * Maps structural equivalents across deck systems.
 * The canonical ID is the bridge.
 *
 * Example: canonicalId 'major-08' maps to:
 *   RWS: 'Strength' (VIII)
 *   Thoth: 'Lust' (XI)
 *   Marseille: 'La Force' (XI)
 *   Egyptian BoL: 'Enchantment' (VIII, swapped like Thoth)
 *
 * The mapping handles the Strength/Justice swap and the Tzaddi/Star swap.
 */
export interface CrossTraditionMapping {
  canonicalId: string;
  mappings: Record<DeckSystemId, {
    cardName: string;
    number: number;
    suitName?: string;
    courtRankName?: string;
  } | undefined>;
}

// Major Arcana numbering swaps
export const NUMBERING_SWAPS: Record<string, Record<DeckSystemId, number>> = {
  // Strength/Justice swap: RWS has Strength=8, Justice=11; Thoth/Marseille/BoL have them swapped
  'major-08': { rws: 8, thoth: 11, marseille_conver: 11, egyptian_bol: 8, rws_usg: 8, marseille_noblet: 11, marseille_cbd: 11, marseille_jodo: 11, lenormand_blue_owl: 8, lenormand_petit: 8, egyptian_kier: 8, egyptian_ibis: 8, visconti_sforza: 8, sola_busca: 8, golden_dawn: 8, rohrig: 11, tabula_mundi: 11, driftfield: 8, custom: 8 },
  'major-11': { rws: 11, thoth: 8, marseille_conver: 8, egyptian_bol: 11, rws_usg: 11, marseille_noblet: 8, marseille_cbd: 8, marseille_jodo: 8, lenormand_blue_owl: 11, lenormand_petit: 11, egyptian_kier: 11, egyptian_ibis: 11, visconti_sforza: 11, sola_busca: 11, golden_dawn: 11, rohrig: 8, tabula_mundi: 8, driftfield: 11, custom: 11 },
};

// Thoth card name translations
export const THOTH_CARD_NAMES: Record<string, string> = {
  'major-02': 'The Priestess',
  'major-05': 'The Hierophant',
  'major-08': 'Lust',           // Strength → Lust, numbered XI in Thoth
  'major-10': 'Fortune',
  'major-11': 'Adjustment',     // Justice → Adjustment, numbered VIII in Thoth
  'major-14': 'Art',            // Temperance → Art
  'major-20': 'The Aeon',       // Judgement → The Aeon
  'major-21': 'The Universe',   // The World → The Universe
};

// Thoth court card rank translations
export const THOTH_COURT_RANKS: Record<string, string> = {
  'page': 'Princess',
  'knight': 'Prince',      // RWS Knight → Thoth Prince
  'queen': 'Queen',         // Same
  'king': 'Knight',         // RWS King → Thoth Knight (!)
};

// Thoth suit translations
export const THOTH_SUIT_NAMES: Record<string, string> = {
  'wands': 'Wands',
  'cups': 'Cups',
  'swords': 'Swords',
  'pentacles': 'Disks',     // Pentacles → Disks
};

// Marseille suit translations
export const MARSEILLE_SUIT_NAMES: Record<string, string> = {
  'wands': 'Batons',
  'cups': 'Coupes',
  'swords': 'Épées',
  'pentacles': 'Deniers',
};

// Marseille court rank translations
export const MARSEILLE_COURT_RANKS: Record<string, string> = {
  'page': 'Valet',
  'knight': 'Cavalier',
  'queen': 'Reine',
  'king': 'Roi',
};

// Brotherhood of Light Egyptian court rank translations
export const BOL_COURT_RANKS: Record<string, string> = {
  'page': 'Youth',
  'knight': 'Horseman',     // Special: represents thoughts, not people
  'queen': 'Queen',
  'king': 'King',
};

// ── LENORMAND SYSTEM (36 cards, completely different structure) ──────────────

export interface LenormandCard {
  canonicalId: string;       // 'lenormand-01' through 'lenormand-36'
  number: number;
  name: string;              // 'Rider', 'Clover', 'Ship', etc.
  playingCardCorrespondence: string; // '9 of Hearts', 'Six of Diamonds', etc.
  keywords: string[];
  pairMeanings: Record<string, string>; // canonicalId → combined meaning with that card
  houseMeaning: string;      // meaning when in its own house position (Grand Tableau)
  timing?: string;           // timing association if applicable
  direction: 'positive' | 'negative' | 'neutral';
}

// ── DATASET MANIFEST ────────────────────────────────────────────────────────

/**
 * Manifest file for a complete training dataset.
 * Sits at the root of the dataset directory.
 */
export interface DatasetManifest {
  version: string;
  createdAt: string;
  updatedAt: string;

  // Coverage
  deckSystems: DeckSystemId[];
  totalImages: number;
  totalCards: number;                // unique cards represented

  // Per-deck breakdown
  deckBreakdown: Record<DeckSystemId, {
    totalImages: number;
    cardsRepresented: number;        // out of 78 (or 36 for Lenormand, 80 for Thoth)
    sourceBreakdown: Record<string, number>; // scan: N, photograph: N, synthetic: N, etc.
    orientationBreakdown: { upright: number; reversed: number };
    averageResolution: { width: number; height: number };
  }>;

  // Quality metrics
  minImagesPerCard: number;
  maxImagesPerCard: number;
  averageImagesPerCard: number;

  // Split info
  splits: {
    train: number;
    validation: number;
    test: number;
  };

  // Label format
  labelFormat: 'yolo' | 'coco' | 'pascal_voc' | 'custom';
  classMapping: Record<string, number>;  // canonicalId → class index
}

// ── DATASET BUILDER UTILITIES ───────────────────────────────────────────────

/**
 * Generate a canonical card ID from tradition-specific identifiers.
 */
export function toCanonicalId(
  arcana: 'major' | 'minor' | 'court',
  options: {
    majorNumber?: number;
    suit?: string;
    pipNumber?: number;
    courtRank?: string;
    deckSystem?: DeckSystemId;
  }
): string {
  if (arcana === 'major') {
    return `major-${String(options.majorNumber ?? 0).padStart(2, '0')}`;
  }

  // Normalize suit to element
  const suitToElement: Record<string, string> = {
    wands: 'fire', batons: 'fire', staves: 'fire', clubs: 'fire',
    cups: 'water', coupes: 'water', chalices: 'water',
    swords: 'air', epees: 'air', spades: 'air',
    pentacles: 'earth', disks: 'earth', deniers: 'earth', coins: 'earth',
  };

  const suit = options.suit?.toLowerCase() ?? '';
  const element = suitToElement[suit] ?? suit;

  if (arcana === 'minor') {
    return `minor-${element}-${String(options.pipNumber ?? 1).padStart(2, '0')}`;
  }

  // Normalize court rank
  const rankToCanonical: Record<string, string> = {
    page: 'youth', princess: 'youth', valet: 'youth', youth: 'youth', fante: 'youth',
    knight: 'warrior', prince: 'warrior', cavalier: 'warrior', horseman: 'warrior', cavallo: 'warrior',
    queen: 'mature_inner', reine: 'mature_inner', regina: 'mature_inner',
    king: 'mature_outer', roi: 'mature_outer', re: 'mature_outer',
  };

  const rank = rankToCanonical[options.courtRank?.toLowerCase() ?? ''] ?? 'youth';
  return `court-${element}-${rank}`;
}

/**
 * Translate a canonical ID to tradition-specific naming.
 */
export function fromCanonical(
  canonicalId: string,
  deckSystem: DeckSystemId
): { cardName: string; suitName?: string; courtRank?: string; number?: number } {
  // Major Arcana
  if (canonicalId.startsWith('major-')) {
    const num = parseInt(canonicalId.split('-')[1], 10);
    const thothName = THOTH_CARD_NAMES[canonicalId];
    const swappedNum = NUMBERING_SWAPS[canonicalId]?.[deckSystem];

    if (deckSystem === 'thoth' || deckSystem === 'rohrig' || deckSystem === 'tabula_mundi') {
      return {
        cardName: thothName ?? RWS_MAJOR_NAMES[num] ?? `Major ${num}`,
        number: swappedNum ?? num,
      };
    }

    return {
      cardName: RWS_MAJOR_NAMES[num] ?? `Major ${num}`,
      number: swappedNum ?? num,
    };
  }

  // Minor and Court cards: translate suit and rank names
  const parts = canonicalId.split('-');
  const element = parts[1];

  const elementToSuit: Record<string, Record<string, string>> = {
    rws: { fire: 'Wands', water: 'Cups', air: 'Swords', earth: 'Pentacles' },
    thoth: { fire: 'Wands', water: 'Cups', air: 'Swords', earth: 'Disks' },
    marseille_conver: { fire: 'Batons', water: 'Coupes', air: 'Épées', earth: 'Deniers' },
  };

  const suitName = elementToSuit[deckSystem]?.[element]
    ?? elementToSuit['rws']?.[element]
    ?? element;

  if (canonicalId.startsWith('minor-')) {
    const num = parseInt(parts[2], 10);
    const pipNames = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
    return { cardName: `${pipNames[num] ?? num} of ${suitName}`, suitName, number: num };
  }

  if (canonicalId.startsWith('court-')) {
    const rank = parts[2];
    const rankNames: Record<string, Record<string, string>> = {
      rws: { youth: 'Page', warrior: 'Knight', mature_inner: 'Queen', mature_outer: 'King' },
      thoth: { youth: 'Princess', warrior: 'Prince', mature_inner: 'Queen', mature_outer: 'Knight' },
      marseille_conver: { youth: 'Valet', warrior: 'Cavalier', mature_inner: 'Reine', mature_outer: 'Roi' },
    };
    const courtRank = rankNames[deckSystem]?.[rank] ?? rankNames['rws']?.[rank] ?? rank;
    return { cardName: `${courtRank} of ${suitName}`, suitName, courtRank };
  }

  return { cardName: canonicalId };
}

// RWS Major Arcana name lookup
const RWS_MAJOR_NAMES: Record<number, string> = {
  0: 'The Fool', 1: 'The Magician', 2: 'The High Priestess', 3: 'The Empress',
  4: 'The Emperor', 5: 'The Hierophant', 6: 'The Lovers', 7: 'The Chariot',
  8: 'Strength', 9: 'The Hermit', 10: 'Wheel of Fortune', 11: 'Justice',
  12: 'The Hanged Man', 13: 'Death', 14: 'Temperance', 15: 'The Devil',
  16: 'The Tower', 17: 'The Star', 18: 'The Moon', 19: 'The Sun',
  20: 'Judgement', 21: 'The World',
};
