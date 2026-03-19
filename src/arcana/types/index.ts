// ============================================================================
// DRIFTFIELD ENGINE — CORE TYPES
// ============================================================================

// --- Entropy & Field ---

export interface EntropyMetadata {
  shannon: number;              // 0.0–1.0 normalized Shannon entropy
  chiSquared: {
    statistic: number;
    pValue: number;
    degreesOfFreedom: number;
  };
  serialCorrelation: number;    // -1.0 to +1.0
  monteCarloPI: {
    estimate: number;
    deviation: number;           // absolute deviation from π
  };
  runsTest: {
    zScore: number;
    pValue: number;
  };
  byteCount: number;
  timestamp: number;
}

export interface FieldSnapshot {
  polarity: number;              // -1.0 (negative) to +1.0 (positive)
  anomalySigma: number;          // standard deviations from expected
  bearing: number;               // 0–359 degrees
  bearingElement: Element;       // mapped from bearing quadrant
  isCharged: boolean;            // true when anomalySigma > 2.0
  entropy: EntropyMetadata;
}

// --- Elements & Correspondences ---

export type Element = 'fire' | 'water' | 'air' | 'earth' | 'spirit';

export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles'
  | 'batons' | 'coupes' | 'epees' | 'deniers'       // Marseille
  | 'disks';                                           // Thoth

export type MajorArcana = number;  // 0–21

export type Orientation = 'upright' | 'reversed' | 'dignified' | 'ill_dignified';

// --- Cards ---

export interface Card {
  id: string;                    // 'major-00-fool', 'minor-cups-ace', etc.
  name: string;                  // 'The Fool', 'Ace of Cups'
  arcana: 'major' | 'minor' | 'court';
  suit?: Suit;
  number?: number;               // 0–21 for majors, 1–10 for minors
  courtRank?: 'page' | 'knight' | 'queen' | 'king'
    | 'princess' | 'prince'      // Thoth
    | 'youth' | 'horseman'       // Brotherhood of Light
    | 'valet' | 'cavalier';      // Marseille
  element?: Element;
  zodiac?: string;
  planet?: string;
  hebrewLetter?: string;
  decan?: string;
  gazeDirection?: 'left' | 'right' | 'forward' | 'none';  // Marseille courts
}

export interface DrawnCard {
  card: Card;
  orientation: Orientation;
  positionIndex: number;
  positionName: string;
  isJumper: boolean;
  isBottomCard: boolean;
  isSignificator: boolean;
  drawEntropy: number;           // entropy score at moment of this specific draw
}

// --- Deck ---

export type DeckSystem = 'rws' | 'thoth' | 'marseille' | 'marseille_conver'
  | 'lenormand' | 'lenormand_blue_owl'
  | 'egyptian_bol' | 'egyptian_kier' | 'egyptian_ibis';

export interface DeckState {
  system: DeckSystem;
  cards: Card[];                 // current card order (mutated by shuffle)
  originalOrder: Card[];         // reference for reset
}

// --- Shuffle ---

export type ShuffleMethod = 'overhand' | 'riffle' | 'wash' | 'hindu' | 'pile' | 'cut';

export interface ShuffleConfig {
  method: ShuffleMethod;
  passes: number;                // how many times to repeat the shuffle
  pileCounts?: number;           // for pile shuffle: 3, 5, or 7
}

export interface ShuffleResult {
  deck: Card[];                  // shuffled card order
  fieldSnapshot: FieldSnapshot;
  jumperCandidates: number[];    // indices of cards with anomalous entropy during shuffle
}

// --- Pull ---

export type PullMethod = 'top' | 'fan' | 'cut_reveal';

export interface PullConfig {
  method: PullMethod;
  readJumpers: boolean;
  readBottomCard: boolean;
  significator?: Card;           // pre-selected significator card
  fanSelections?: number[];      // for fan pull: indices selected by user
  cutPoints?: number[];          // for cut_reveal: auto-generated or user-specified
}

// --- Spread ---

export type SpreadLayoutType = 'grid' | 'cross' | 'circle' | 'line' | 'star' | 'tree' | 'fork' | 'column' | 'custom';

export interface SpreadPosition {
  id: number;
  name: string;
  description: string;
  interpretiveFrame: string;
  temporalContext?: 'past' | 'present' | 'future' | 'timeless';
  domainContext?: string;
  crossing?: boolean;
}

export interface CardPlacement {
  positionId: number;
  row: number;
  col: number;
  rotation?: number;
}

export interface SpreadTemplate {
  id: string;
  name: string;
  cardCount: number;
  compatibleSystems: DeckSystem[];
  tier: 'free' | 'premium';
  category: string;
  positions: SpreadPosition[];
  layout: {
    type: SpreadLayoutType;
    rows: number;
    cols: number;
    cardPlacements: CardPlacement[];
  };
  readingFlow: {
    sequence: number[];
    narrativeArc: 'linear' | 'spiral' | 'cross_then_staff' | 'center_out';
    interactionPairs?: [number, number][];
    mirrorPairs?: [number, number][];
  };
  optionalExtensions: {
    significator: boolean;
    bottomCard: boolean;
    jumperCards: boolean;
    clarifierCards: boolean;
  };
}

// --- Tradition ---

export type Tradition = 'standard' | 'thelemic' | 'golden_dawn' | 'hermetic'
  | 'jungian' | 'wiccan' | 'kabbalistic' | 'intuitive'
  | 'cartomantic' | 'astrological' | 'therapeutic';

// --- Interpretation Tone ---

export type InterpretationTone = 'practical' | 'esoteric' | 'poetic' | 'analytical';

// --- Intention ---

export type Domain = 'love' | 'career' | 'spiritual' | 'health'
  | 'creative' | 'family' | 'financial' | 'self' | 'general';

export type EmotionalTone = 'anxious' | 'hopeful' | 'curious' | 'grieving'
  | 'frustrated' | 'neutral' | 'excited' | 'conflicted';

export interface IntentionVector {
  domain: Domain;
  emotionalTone: EmotionalTone;
  specificity: number;           // 0.0 (abstract) to 1.0 (concrete)
  temporalFocus: 'past' | 'present' | 'future' | 'cyclical' | 'liminal';
  implicitQuestions: string[];
  relationalFrame: 'self' | 'dyadic' | 'group' | 'universal';
}

// --- Reading ---

export type InputMode = 'virtual' | 'camera';
export type CompositionTier = 'template' | 'local_model' | 'api';

export interface ReadingInput {
  question?: string;
  deckSystem: DeckSystem;
  tradition: Tradition;
  spread: SpreadTemplate;
  shuffleConfig: ShuffleConfig;
  pullConfig: PullConfig;
  inputMode: InputMode;
  tone: InterpretationTone;
}

export interface ReadingOutput {
  id: string;
  input: ReadingInput;
  intentionVector: IntentionVector;
  drawnCards: DrawnCard[];
  fieldSnapshot: FieldSnapshot;
  narrative: string;
  compositionTier: CompositionTier;
  patterns?: PatternInsight[];
  createdAt: number;
}

export interface PatternInsight {
  type: 'recurrence' | 'suit_dominance' | 'field_correlation'
    | 'temporal_arc' | 'birth_chart_echo' | 'elemental_balance';
  description: string;
  significanceScore: number;
  readingsInvolved: string[];
}
