// ============================================================================
// DRIFTFIELD — KNOWLEDGE BASE TYPES
// Defines the interpretation tree structure for the Arcana Engine
// Each card has deep, branching interpretations based on context
// ============================================================================

import type { Domain, EmotionalTone, Element } from '../types';

/**
 * Complete interpretation entry for a single card.
 * This is the atomic unit of the knowledge base.
 */
export interface CardKnowledge {
  cardId: string;
  cardName: string;

  // Core meanings (tradition-agnostic summary)
  coreMeaning: {
    upright: string;           // 1–2 sentence distilled meaning
    reversed: string;
  };

  // Keywords (for quick reference, not used in narrative)
  keywords: {
    upright: string[];         // e.g. ['new beginnings', 'innocence', 'leap of faith']
    reversed: string[];        // e.g. ['recklessness', 'fear of change', 'naivety']
  };

  // Domain-specific interpretation branches
  domains: Record<Domain, DomainInterpretation>;

  // Positional modifiers
  positions: Record<string, PositionalModifier>;

  // Emotional tone modifiers
  emotionalModifiers: Partial<Record<EmotionalTone, EmotionalModifier>>;

  // Card-to-card interaction rules
  interactions: CardInteraction[];

  // Field response text (entropy state modulation)
  fieldResponses: FieldResponseSet;

  // Astrological correspondence notes
  correspondences: {
    element?: Element;
    zodiac?: string;
    planet?: string;
    decan?: string;
    hebrewLetter?: string;
    treeOfLifePath?: string;
    numerology?: number;
    birthChartResonance: string;  // text shown when card matches user's chart
  };
}

/**
 * Domain-specific interpretation branch.
 * Each card reads differently depending on the question's domain.
 */
export interface DomainInterpretation {
  upright: {
    core: string;              // 2–4 sentence interpretation for this domain
    advice: string;            // what the card suggests the user do
    warning: string;           // shadow side / what to watch for
    affirmation: string;       // positive framing
  };
  reversed: {
    core: string;
    advice: string;
    warning: string;
    affirmation: string;
  };
}

/**
 * Positional modifier — how meaning shifts based on spread position.
 * These don't replace the domain interpretation; they bend it.
 */
export interface PositionalModifier {
  positionKey: string;         // 'situation', 'challenge', 'advice', 'outcome', etc.
  frame: string;               // interpretive framing text (1–2 sentences)
  emphasis: string;            // what aspect of the card to emphasize in this position
}

/**
 * Emotional tone modifier.
 * When the Intention Parser detects a specific emotional state,
 * these modifiers shift interpretation weight.
 */
export interface EmotionalModifier {
  toneShift: string;           // how interpretation changes for this emotion
  gentleOpening: string;       // softer opening when querent is in this state
}

/**
 * Card-to-card interaction rules.
 * When two specific cards appear in the same spread, their meanings interact.
 */
export interface CardInteraction {
  otherCardId: string;
  relationship: 'amplified_by' | 'opposed_by' | 'transformed_by' | 'mirrored_by' | 'bridges_to';
  description: string;         // how the interaction modifies meaning
  narrativeBridge: string;     // transition text for the composer
}

/**
 * Field response set — how entropy state modulates the card's meaning.
 */
export interface FieldResponseSet {
  positiveHigh: string;        // σ > +2: strong positive field
  positiveMild: string;        // +1 < σ < +2
  neutral: string;             // -1 < σ < +1
  negativeMild: string;        // -2 < σ < -1
  negativeHigh: string;        // σ < -2: strong negative field
}

/**
 * Positional keys used across all spread types.
 * The Card Resolver maps spread position names to these keys.
 */
export const POSITION_KEYS = [
  'situation',       // current state / what is
  'challenge',       // obstacle / what opposes
  'advice',          // guidance / what to do
  'outcome',         // likely result / where this leads
  'hidden',          // hidden influence / what you don't see
  'past',            // what has led here
  'present',         // where you are now
  'future',          // where this is heading
  'hopes_fears',     // what you hope for or fear
  'environment',     // external influences / other people
  'foundation',      // root cause / underlying basis
  'crown',           // best possible outcome / aspiration
  'crossing',        // what crosses you (Celtic Cross specific)
  'self_perception', // how you see yourself
  'external',        // how others see you / external forces
  'above',           // conscious thoughts
  'below',           // subconscious / what's underneath
] as const;

export type PositionKey = typeof POSITION_KEYS[number];
