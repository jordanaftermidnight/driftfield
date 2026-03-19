// ============================================================================
// DRIFTFIELD — ENTROPY ENGINE
// The hands. Shuffles and pulls using genuine cryptographic entropy.
// Produces: shuffled deck + drawn cards + field snapshot + entropy metadata.
// ============================================================================

import type {
  Card, DrawnCard, FieldSnapshot, ShuffleConfig, PullConfig,
  ShuffleResult, SpreadTemplate, Orientation
} from '../types';
import { getRandomBytes, randomFloatsWithBytes, randomFloat, randomInt } from './csprng';
import { analyzeEntropy, derivePolarity, deriveAnomalySigma, deriveBearing, bearingToElement } from './stats';
import { simulateShuffle, identifyJumperCandidates, RECOMMENDED_PASSES } from './shuffle';

// Minimum bytes for reliable statistical analysis
const MIN_ENTROPY_BYTES = 256;

/**
 * Generate a field snapshot from fresh entropy.
 * This is the core output of the entropy engine for every reading.
 */
export function generateFieldSnapshot(byteCount: number = 1024): FieldSnapshot {
  const bytes = getRandomBytes(Math.max(byteCount, MIN_ENTROPY_BYTES));
  const entropy = analyzeEntropy(bytes);
  const polarity = derivePolarity(entropy);
  const anomalySigma = deriveAnomalySigma(entropy);
  const bearing = deriveBearing(bytes);

  return {
    polarity,
    anomalySigma,
    bearing,
    bearingElement: bearingToElement(bearing),
    isCharged: anomalySigma > 2.0,
    entropy
  };
}

/**
 * Determine card orientation (upright/reversed) using entropy.
 * For wash shuffle, reversals are more likely (natural consequence of face-down mixing).
 * For other methods, standard 50/50 if reversals are enabled.
 */
function determineOrientation(shuffleMethod: string, reversalsEnabled: boolean): Orientation {
  if (!reversalsEnabled) return 'upright';

  // Wash shuffle produces more natural variation in orientation
  if (shuffleMethod === 'wash') {
    return randomFloat() < 0.55 ? 'upright' : 'reversed';
  }

  return randomFloat() < 0.5 ? 'upright' : 'reversed';
}

/**
 * Execute the full entropy-driven shuffle.
 * Returns the shuffled deck state, the field snapshot, and jumper candidates.
 */
export function executeShufflePhase(
  deck: Card[],
  config: ShuffleConfig
): ShuffleResult {
  const passes = config.passes || RECOMMENDED_PASSES[config.method] || 3;

  // Generate field snapshot from entropy used during this operation
  const fieldSnapshot = generateFieldSnapshot(1024);

  // Simulate the shuffle
  const shuffled = simulateShuffle(deck, config.method, passes, config.pileCounts);

  // Identify jumper candidates
  const jumperCandidates = identifyJumperCandidates(deck.length, 3);

  return {
    deck: shuffled,
    fieldSnapshot,
    jumperCandidates
  };
}

/**
 * Execute the pull phase — draw cards from the shuffled deck.
 * Returns drawn cards with position assignments.
 */
export function executePullPhase(
  shuffleResult: ShuffleResult,
  spread: SpreadTemplate,
  pullConfig: PullConfig,
  reversalsEnabled: boolean = true,
  shuffleMethod: string = 'riffle'
): DrawnCard[] {
  const { deck, jumperCandidates } = shuffleResult;
  const drawn: DrawnCard[] = [];
  const usedIndices = new Set<number>();

  // Remove significator if pre-selected
  let activeDeck = [...deck];
  if (pullConfig.significator) {
    const sigIdx = activeDeck.findIndex(c => c.id === pullConfig.significator!.id);
    if (sigIdx !== -1) {
      activeDeck.splice(sigIdx, 1);
      drawn.push({
        card: pullConfig.significator,
        orientation: 'upright', // significator is always upright
        positionIndex: 0,
        positionName: 'Significator',
        isJumper: false,
        isBottomCard: false,
        isSignificator: true,
        drawEntropy: randomFloat()
      });
    }
  }

  // Handle jumper cards if enabled
  if (pullConfig.readJumpers && jumperCandidates.length > 0) {
    for (const jumperIdx of jumperCandidates) {
      if (jumperIdx < activeDeck.length && !usedIndices.has(jumperIdx)) {
        // Jumper cards are presented before the main draw
        // They don't occupy a spread position — they're additive
        drawn.push({
          card: activeDeck[jumperIdx],
          orientation: determineOrientation(shuffleMethod, reversalsEnabled),
          positionIndex: -1, // special: not a spread position
          positionName: 'Jumper',
          isJumper: true,
          isBottomCard: false,
          isSignificator: false,
          drawEntropy: randomFloat()
        });
        usedIndices.add(jumperIdx);
      }
    }
  }

  // Main draw based on pull method
  const cardsToDraw = spread.cardCount - (pullConfig.significator ? 1 : 0);
  const positionSequence = spread.readingFlow.sequence;

  switch (pullConfig.method) {
    case 'top': {
      // Sequential from top of shuffled deck
      let drawIdx = 0;
      for (let i = 0; i < cardsToDraw; i++) {
        // Skip cards already used as jumpers
        while (usedIndices.has(drawIdx) && drawIdx < activeDeck.length) drawIdx++;
        if (drawIdx >= activeDeck.length) break;

        const posIdx = positionSequence[i] ?? i + 1;
        const pos = spread.positions.find(p => p.id === posIdx);

        drawn.push({
          card: activeDeck[drawIdx],
          orientation: determineOrientation(shuffleMethod, reversalsEnabled),
          positionIndex: posIdx,
          positionName: pos?.name ?? `Position ${posIdx}`,
          isJumper: false,
          isBottomCard: false,
          isSignificator: false,
          drawEntropy: randomFloat()
        });
        usedIndices.add(drawIdx);
        drawIdx++;
      }
      break;
    }

    case 'fan': {
      // Fan selection: user's tap positions map to deck indices
      // If fanSelections provided, use them; otherwise fall back to top-of-deck
      const selections = pullConfig.fanSelections ?? [];
      for (let i = 0; i < cardsToDraw; i++) {
        let deckIdx = i < selections.length ? selections[i] : i;
        let effectiveIdx = Math.min(deckIdx, activeDeck.length - 1);
        // Resolve collisions by scanning forward
        while (usedIndices.has(effectiveIdx) && effectiveIdx < activeDeck.length - 1) effectiveIdx++;
        if (usedIndices.has(effectiveIdx)) continue;

        const posIdx = positionSequence[i] ?? i + 1;
        const pos = spread.positions.find(p => p.id === posIdx);

        drawn.push({
          card: activeDeck[effectiveIdx],
          orientation: determineOrientation('overhand', reversalsEnabled),
          positionIndex: posIdx,
          positionName: pos?.name ?? `Position ${posIdx}`,
          isJumper: false,
          isBottomCard: false,
          isSignificator: false,
          drawEntropy: randomFloat()
        });
        usedIndices.add(effectiveIdx);
      }
      break;
    }

    case 'cut_reveal': {
      // Cut at N points, reveal top card of each section
      const cuts = pullConfig.cutPoints ?? generateCutPoints(activeDeck.length, cardsToDraw);
      for (let i = 0; i < Math.min(cuts.length, cardsToDraw); i++) {
        let cutIdx = cuts[i];
        if (cutIdx >= activeDeck.length) cutIdx = activeDeck.length - 1;
        // Resolve collisions by scanning forward
        while (usedIndices.has(cutIdx) && cutIdx < activeDeck.length - 1) cutIdx++;
        if (usedIndices.has(cutIdx)) continue;

        const posIdx = positionSequence[i] ?? i + 1;
        const pos = spread.positions.find(p => p.id === posIdx);

        drawn.push({
          card: activeDeck[cutIdx],
          orientation: determineOrientation('overhand', reversalsEnabled),
          positionIndex: posIdx,
          positionName: pos?.name ?? `Position ${posIdx}`,
          isJumper: false,
          isBottomCard: false,
          isSignificator: false,
          drawEntropy: randomFloat()
        });
        usedIndices.add(cutIdx);
      }
      break;
    }
  }

  // Bottom card if enabled
  if (pullConfig.readBottomCard && activeDeck.length > 0) {
    const bottomIdx = activeDeck.length - 1;
    if (!usedIndices.has(bottomIdx)) {
      drawn.push({
        card: activeDeck[bottomIdx],
        orientation: determineOrientation('overhand', reversalsEnabled),
        positionIndex: -2, // special: bottom card
        positionName: 'Hidden Foundation',
        isJumper: false,
        isBottomCard: true,
        isSignificator: false,
        drawEntropy: randomFloat()
      });
    }
  }

  return drawn;
}

/**
 * Generate entropy-determined cut points for cut-and-reveal pull method.
 */
function generateCutPoints(deckSize: number, cuts: number): number[] {
  const points: number[] = [];
  const sectionSize = Math.floor(deckSize / (cuts + 1));

  for (let i = 0; i < cuts; i++) {
    // Each cut point is near the expected position but with entropy variation
    const expected = sectionSize * (i + 1);
    const variation = randomInt(Math.max(1, Math.floor(sectionSize / 3))) - Math.floor(sectionSize / 6);
    const point = Math.max(0, Math.min(deckSize - 1, expected + variation));
    points.push(point);
  }

  // Ensure unique and sorted
  return [...new Set(points)].sort((a, b) => a - b);
}

/**
 * MAIN ENTRY POINT: Execute a complete entropy-driven reading draw.
 * This is Stage 2 of the pipeline.
 *
 * Input: deck + settings
 * Output: drawn cards + field snapshot (feeds Stages 3–7)
 */
export function executeEntropyStageFull(
  deck: Card[],
  spread: SpreadTemplate,
  shuffleConfig: ShuffleConfig,
  pullConfig: PullConfig,
  reversalsEnabled: boolean = true
): {
  drawnCards: DrawnCard[];
  fieldSnapshot: FieldSnapshot;
} {
  // Phase 1: Shuffle
  const shuffleResult = executeShufflePhase(deck, shuffleConfig);

  // Phase 2: Pull
  const drawnCards = executePullPhase(shuffleResult, spread, pullConfig, reversalsEnabled, shuffleConfig.method);

  return {
    drawnCards,
    fieldSnapshot: shuffleResult.fieldSnapshot
  };
}
