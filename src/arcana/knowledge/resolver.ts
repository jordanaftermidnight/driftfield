// ============================================================================
// DRIFTFIELD — CARD RESOLVER (Stage 3)
// Resolves drawn cards against the knowledge base using context from Stage 1.
// Input: DrawnCard[] + IntentionVector + FieldSnapshot
// Output: ResolvedCard[] (enriched with contextual interpretation)
// ============================================================================

import type { DrawnCard, IntentionVector, FieldSnapshot, Domain, EmotionalTone } from '../types';
import type { CardKnowledge, DomainInterpretation, PositionalModifier, FieldResponseSet } from './types';
import { getKnowledge } from './index';

export interface ResolvedCard {
  card: DrawnCard;
  interpretation: {
    core: string;             // primary interpretation text
    advice: string;
    warning: string;
    affirmation: string;
  };
  positionalFrame: string;    // how position modifies meaning
  emotionalShift: string;     // how querent's emotional state modifies meaning
  fieldResponse: string;      // how entropy state modifies meaning
  chartResonance?: string;    // birth chart correspondence note (if applicable)
  interactionNotes: string[]; // notes from card-to-card interactions in this spread
  pivotScore: number;         // 0.0–1.0, how central this card is to the reading
}

/**
 * Resolve a single drawn card against the knowledge base.
 */
function resolveCard(
  drawn: DrawnCard,
  intention: IntentionVector,
  field: FieldSnapshot,
  allDrawnIds: string[],
  userChartSigns?: { sun?: string; moon?: string; rising?: string }
): ResolvedCard {
  const knowledge = getKnowledge(drawn.card.id);

  // Select domain interpretation
  const domainInterp = selectDomainInterpretation(knowledge, drawn, intention.domain);

  // Select orientation branch
  const orientation = drawn.orientation === 'reversed' || drawn.orientation === 'ill_dignified' ? 'reversed' : 'upright';
  const interp = domainInterp[orientation];

  // Apply positional modifier
  const posKey = mapPositionToKey(drawn.positionName);
  const posModifier = knowledge?.positions?.[posKey];
  const positionalFrame = posModifier?.frame || '';

  // Apply emotional modifier
  const emotionalMod = knowledge?.emotionalModifiers?.[intention.emotionalTone];
  const emotionalShift = emotionalMod?.toneShift || '';

  // Apply field response
  const fieldResponse = selectFieldResponse(knowledge?.fieldResponses, field);

  // Check birth chart resonance
  let chartResonance: string | undefined;
  if (userChartSigns && knowledge?.correspondences) {
    chartResonance = checkChartResonance(knowledge, userChartSigns);
  }

  // Check card-to-card interactions
  const interactionNotes = findInteractions(knowledge, allDrawnIds);

  // Calculate pivot score
  const pivotScore = calculatePivotScore(drawn, knowledge, field, interactionNotes.length, !!chartResonance);

  return {
    card: drawn,
    interpretation: {
      core: interp.core,
      advice: interp.advice,
      warning: interp.warning,
      affirmation: interp.affirmation
    },
    positionalFrame,
    emotionalShift,
    fieldResponse,
    chartResonance,
    interactionNotes,
    pivotScore
  };
}

/**
 * Select the appropriate domain interpretation branch.
 * Falls back to 'general' if the specific domain has no authored content.
 */
function selectDomainInterpretation(
  knowledge: CardKnowledge | null,
  drawn: DrawnCard,
  domain: Domain
): DomainInterpretation {
  if (!knowledge) return fallbackInterpretation(drawn);

  const domainInterp = knowledge.domains[domain];

  // Check if domain branch has real content (not just empty strings from placeholder)
  if (domainInterp?.upright?.core && domainInterp.upright.core.length > 20) {
    return domainInterp;
  }

  // Fall back to general
  const general = knowledge.domains.general;
  if (general?.upright?.core && general.upright.core.length > 20) {
    return general;
  }

  return fallbackInterpretation(drawn);
}

/**
 * Fallback interpretation when no knowledge base entry exists.
 */
function fallbackInterpretation(drawn: DrawnCard): DomainInterpretation {
  return {
    upright: {
      core: `${drawn.card.name} appears in the ${drawn.positionName} position. This card carries themes of ${drawn.card.element || 'transformation'} energy.`,
      advice: 'Reflect on what this card means to you personally.',
      warning: '',
      affirmation: ''
    },
    reversed: {
      core: `${drawn.card.name} reversed appears in the ${drawn.positionName} position. The card's energy may be blocked, internalized, or expressed in shadow form.`,
      advice: 'Consider what aspect of this card\'s energy you may be resisting.',
      warning: '',
      affirmation: ''
    }
  };
}

/**
 * Map a spread position name to a canonical position key.
 */
function mapPositionToKey(positionName: string): string {
  const name = positionName.toLowerCase();

  const mappings: Record<string, string[]> = {
    situation: ['situation', 'the situation', 'current', 'present situation', 'what is'],
    challenge: ['challenge', 'the challenge', 'obstacle', 'what opposes', 'opposition', 'crossing'],
    advice: ['advice', 'the advice', 'guidance', 'what to do', 'action', 'recommendation'],
    outcome: ['outcome', 'the outcome', 'likely outcome', 'result', 'where this leads', 'future'],
    hidden: ['hidden', 'hidden influence', 'the hidden', 'unseen', 'what you don\'t see', 'subconscious'],
    past: ['past', 'the past', 'past influence', 'what has led here', 'foundation', 'root'],
    present: ['present', 'the present', 'where you are', 'now', 'current state'],
    future: ['future', 'the future', 'where this leads', 'what\'s coming', 'direction'],
    hopes_fears: ['hopes', 'fears', 'hopes and fears', 'hopes/fears', 'what you hope or fear'],
    environment: ['environment', 'external', 'others', 'what surrounds you', 'outside influence'],
    foundation: ['foundation', 'root', 'basis', 'hidden foundation', 'what underlies'],
    crossing: ['crossing', 'what crosses', 'the crossing card'],
  };

  for (const [key, names] of Object.entries(mappings)) {
    if (names.some(n => name.includes(n))) return key;
  }

  return 'situation'; // default fallback
}

/**
 * Select field response text based on field polarity and anomaly.
 */
function selectFieldResponse(responses: FieldResponseSet | undefined, field: FieldSnapshot): string {
  if (!responses) return '';

  const sigma = field.anomalySigma;
  const polarity = field.polarity;

  if (polarity > 0.5 && sigma > 1.5) return responses.positiveHigh;
  if (polarity > 0.2) return responses.positiveMild;
  if (polarity < -0.5 && sigma > 1.5) return responses.negativeHigh;
  if (polarity < -0.2) return responses.negativeMild;
  return responses.neutral;
}

/**
 * Check if the card corresponds to any of the user's chart placements.
 */
function checkChartResonance(
  knowledge: CardKnowledge,
  chartSigns: { sun?: string; moon?: string; rising?: string }
): string | undefined {
  const corr = knowledge.correspondences;
  if (!corr) return undefined;

  // Check zodiac match
  if (corr.zodiac) {
    const zodiacLower = corr.zodiac.toLowerCase();
    if (chartSigns.sun?.toLowerCase() === zodiacLower) {
      return `${knowledge.cardName} corresponds to ${corr.zodiac} — your Sun sign. ${corr.birthChartResonance}`;
    }
    if (chartSigns.moon?.toLowerCase() === zodiacLower) {
      return `${knowledge.cardName} corresponds to ${corr.zodiac} — your Moon sign. This adds emotional weight to its appearance.`;
    }
    if (chartSigns.rising?.toLowerCase() === zodiacLower) {
      return `${knowledge.cardName} corresponds to ${corr.zodiac} — your Rising sign. This card speaks to how you present yourself to the world.`;
    }
  }

  return undefined;
}

/**
 * Find interaction notes for cards that are both present in this spread.
 */
function findInteractions(knowledge: CardKnowledge | null, allDrawnIds: string[]): string[] {
  if (!knowledge?.interactions) return [];

  return knowledge.interactions
    .filter(i => allDrawnIds.includes(i.otherCardId))
    .map(i => i.narrativeBridge);
}

/**
 * Calculate pivot score — how central this card is to the reading.
 * Higher score = more central to the narrative.
 */
function calculatePivotScore(
  drawn: DrawnCard,
  knowledge: CardKnowledge | null,
  field: FieldSnapshot,
  interactionCount: number,
  hasChartResonance: boolean
): number {
  let score = 0;

  // Major Arcana are inherently more significant
  if (drawn.card.arcana === 'major') score += 0.3;

  // Charged field amplifies significance
  if (field.isCharged) score += 0.15;

  // More interactions with other cards = more central
  score += Math.min(interactionCount * 0.1, 0.3);

  // Birth chart resonance elevates significance
  if (hasChartResonance) score += 0.2;

  // Certain positions are inherently more significant
  const keyPositions = ['outcome', 'crossing', 'hidden', 'advice'];
  const posKey = mapPositionToKey(drawn.positionName);
  if (keyPositions.includes(posKey)) score += 0.1;

  // Jumper cards are always significant (they "jumped" out)
  if (drawn.isJumper) score += 0.2;

  // Significator is the querent's anchor
  if (drawn.isSignificator) score += 0.15;

  return Math.min(score, 1.0);
}

// ─── MAIN EXPORT: Resolve all drawn cards ─────────────────────────────────────

export function resolveAllCards(
  drawnCards: DrawnCard[],
  intention: IntentionVector,
  field: FieldSnapshot,
  userChartSigns?: { sun?: string; moon?: string; rising?: string }
): ResolvedCard[] {
  const allDrawnIds = drawnCards.map(dc => dc.card.id);

  return drawnCards.map(dc =>
    resolveCard(dc, intention, field, allDrawnIds, userChartSigns)
  );
}

/**
 * Identify the pivot card — the single most significant card in the reading.
 */
export function findPivotCard(resolved: ResolvedCard[]): ResolvedCard | null {
  if (resolved.length === 0) return null;
  return resolved.reduce((a, b) => a.pivotScore >= b.pivotScore ? a : b);
}
