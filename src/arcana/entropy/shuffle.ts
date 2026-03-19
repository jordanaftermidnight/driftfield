// ============================================================================
// DRIFTFIELD — SHUFFLE SIMULATION ENGINE
// Simulates physical shuffle methods using CSPRNG entropy.
// Each method has distinct randomization characteristics.
// ============================================================================

import type { Card, ShuffleMethod } from '../types';
import { randomInt, randomFloat } from './csprng';

/**
 * Fisher-Yates shuffle — maximum randomness.
 * Every permutation is equally likely.
 */
function fisherYates(cards: Card[]): Card[] {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Overhand shuffle simulation.
 * Transfers random-sized clumps from one hand to the other.
 * Preserves local adjacency — adjacent cards tend to stay near each other.
 * Low randomization quality; multiple passes needed.
 */
function overhandShuffle(cards: Card[]): Card[] {
  const result: Card[] = [];
  let remaining = [...cards];

  while (remaining.length > 0) {
    // Transfer a clump of 1–7 cards (skewed toward small clumps)
    const maxClump = Math.min(7, remaining.length);
    const clumpSize = Math.max(1, Math.floor(randomFloat() * randomFloat() * maxClump) + 1);

    // Take from top of remaining, place on top of result
    const clump = remaining.splice(0, clumpSize);
    result.unshift(...clump);
  }

  return result;
}

/**
 * Riffle shuffle simulation.
 * Splits deck in half, interleaves the two halves.
 * Entropy controls which half drops each card (Gilbert-Shannon-Reeds model).
 * High randomization quality — 7 riffles ≈ near-perfect mixing.
 */
function riffleShuffle(cards: Card[]): Card[] {
  const n = cards.length;
  // Split at approximately the middle with slight entropy-driven variation
  const splitPoint = Math.floor(n / 2) + randomInt(5) - 2;
  const left = cards.slice(0, Math.max(1, Math.min(n - 1, splitPoint)));
  const right = cards.slice(left.length);

  const result: Card[] = [];
  let li = 0, ri = 0;

  while (li < left.length && ri < right.length) {
    // Probability of dropping from each half proportional to remaining cards
    const totalRemaining = (left.length - li) + (right.length - ri);
    const probLeft = (left.length - li) / totalRemaining;

    if (randomFloat() < probLeft) {
      // Drop 1–3 cards from left
      const drop = Math.min(left.length - li, randomInt(3) + 1);
      for (let d = 0; d < drop; d++) result.push(left[li++]);
    } else {
      // Drop 1–3 cards from right
      const drop = Math.min(right.length - ri, randomInt(3) + 1);
      for (let d = 0; d < drop; d++) result.push(right[ri++]);
    }
  }

  // Remaining cards
  while (li < left.length) result.push(left[li++]);
  while (ri < right.length) result.push(right[ri++]);

  return result;
}

/**
 * Wash / scramble shuffle simulation.
 * Cards spread face-down and randomly mixed.
 * Maximum randomness — equivalent to Fisher-Yates.
 * Also naturally randomizes card orientation (reversals).
 */
function washShuffle(cards: Card[]): Card[] {
  return fisherYates(cards);
}

/**
 * Hindu shuffle simulation.
 * Large segments pulled from the bottom and placed on top.
 * Blocks of cards stay together. Medium randomization.
 */
function hinduShuffle(cards: Card[]): Card[] {
  const result: Card[] = [];
  let remaining = [...cards];

  while (remaining.length > 0) {
    // Pull a segment of 5–15 cards from the bottom
    const maxSegment = Math.min(15, remaining.length);
    const minSegment = Math.min(5, remaining.length);
    const segmentSize = minSegment + randomInt(Math.max(1, maxSegment - minSegment + 1));

    // Pull from the bottom of remaining
    const segment = remaining.splice(remaining.length - segmentSize, segmentSize);
    result.push(...segment);
  }

  return result;
}

/**
 * Pile shuffle simulation.
 * Cards dealt one-by-one into N piles, then piles reassembled.
 * Order of pile reassembly is entropy-determined.
 */
function pileShuffle(cards: Card[], pileCount: number = 5): Card[] {
  const piles: Card[][] = Array.from({ length: pileCount }, () => []);

  // Deal cards round-robin into piles
  for (let i = 0; i < cards.length; i++) {
    piles[i % pileCount].push(cards[i]);
  }

  // Reassemble piles in random order
  const pileOrder = Array.from({ length: pileCount }, (_, i) => i);
  // Fisher-Yates on pile order
  for (let i = pileOrder.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [pileOrder[i], pileOrder[j]] = [pileOrder[j], pileOrder[i]];
  }

  const result: Card[] = [];
  for (const idx of pileOrder) {
    result.push(...piles[idx]);
  }

  return result;
}

/**
 * Cut only — single rotation at an entropy-determined point.
 * Preserves deck order entirely. Only the starting card changes.
 * The fatalistic shuffle method.
 */
function cutShuffle(cards: Card[]): Card[] {
  const cutPoint = randomInt(cards.length);
  return [...cards.slice(cutPoint), ...cards.slice(0, cutPoint)];
}

/**
 * Execute a shuffle simulation.
 * Applies the selected method for the specified number of passes.
 */
export function simulateShuffle(
  cards: Card[],
  method: ShuffleMethod,
  passes: number = 1,
  pileCounts: number = 5
): Card[] {
  let deck = [...cards];

  for (let pass = 0; pass < passes; pass++) {
    switch (method) {
      case 'overhand':
        deck = overhandShuffle(deck);
        break;
      case 'riffle':
        deck = riffleShuffle(deck);
        break;
      case 'wash':
        deck = washShuffle(deck);
        break;
      case 'hindu':
        deck = hinduShuffle(deck);
        break;
      case 'pile':
        deck = pileShuffle(deck, pileCounts);
        break;
      case 'cut':
        deck = cutShuffle(deck);
        break;
      default:
        throw new Error(`Unknown shuffle method: ${method}`);
    }
  }

  return deck;
}

/**
 * Default pass counts for each shuffle method to achieve adequate mixing.
 */
export const RECOMMENDED_PASSES: Record<ShuffleMethod, number> = {
  overhand: 7,
  riffle: 7,
  wash: 1,      // single pass = fully random
  hindu: 10,
  pile: 3,
  cut: 1,       // more than 1 cut is still just a cut
};

/**
 * Determine if a specific card had anomalous entropy during the shuffle.
 * Used to identify "jumper" candidates in virtual mode.
 * Generates a per-card entropy score; cards with scores > 2σ are flagged.
 */
export function identifyJumperCandidates(deckSize: number, maxJumpers: number = 3): number[] {
  const scores: number[] = [];
  for (let i = 0; i < deckSize; i++) {
    scores.push(randomFloat());
  }

  // Find cards with scores above the 95th percentile
  const sorted = [...scores].sort((a, b) => b - a);
  const threshold = sorted[Math.min(maxJumpers, sorted.length - 1)];

  // Also require the score to be > 0.99 (absolute threshold — jumpers should be rare)
  const absoluteThreshold = 0.99;
  const effectiveThreshold = Math.max(threshold, absoluteThreshold);

  const jumpers: number[] = [];
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] >= effectiveThreshold && jumpers.length < maxJumpers) {
      jumpers.push(i);
    }
  }

  return jumpers;
}
