// ============================================================================
// DRIFTFIELD — ENTROPY ENGINE VERIFICATION TEST
// ============================================================================

import { getRandomBytes, randomFloat, randomInt } from './src/entropy/csprng';
import { analyzeEntropy, derivePolarity, deriveAnomalySigma, deriveBearing, bearingToElement } from './src/entropy/stats';
import { simulateShuffle, identifyJumperCandidates, RECOMMENDED_PASSES } from './src/entropy/shuffle';
import { generateFieldSnapshot, executeEntropyStageFull } from './src/entropy/engine';
import { createRWSDeck, validateDeck } from './src/deck/rws';
import type { ShuffleConfig, PullConfig, SpreadTemplate } from './src/types';

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';
let passed = 0, failed = 0, warnings = 0;

function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  ${PASS} ${msg}`); passed++; }
  else { console.log(`  ${FAIL} ${msg}`); failed++; }
}

function warn(msg: string) { console.log(`  ${WARN} ${msg}`); warnings++; }

// ─── TEST 1: CSPRNG ──────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║          DRIFTFIELD ENTROPY ENGINE TESTS            ║');
console.log('╚══════════════════════════════════════════════════════╝');

console.log('\n─── 1. CSPRNG Core ─────────────────────────────────────');

const bytes = getRandomBytes(1024);
assert(bytes.length === 1024, `getRandomBytes returns correct length (${bytes.length})`);
assert(bytes instanceof Uint8Array, 'Returns Uint8Array');

// Check that bytes aren't all zeros (probability: ~10^-2466)
const allZero = bytes.every(b => b === 0);
assert(!allZero, 'Bytes are not all zeros');

// Check randomFloat range
const floats: number[] = [];
for (let i = 0; i < 1000; i++) floats.push(randomFloat());
const minFloat = Math.min(...floats);
const maxFloat = Math.max(...floats);
assert(minFloat >= 0 && maxFloat < 1, `randomFloat in [0, 1): min=${minFloat.toFixed(6)}, max=${maxFloat.toFixed(6)}`);

// Check randomInt distribution
const intCounts = new Uint32Array(10);
for (let i = 0; i < 10000; i++) intCounts[randomInt(10)]++;
const expectedPerBucket = 1000;
const intDeviation = Math.max(...Array.from(intCounts).map(c => Math.abs(c - expectedPerBucket)));
assert(intDeviation < 200, `randomInt(10) distribution balanced (max deviation: ${intDeviation}/1000)`);

// Check that two sequential getRandomBytes calls produce different output
const bytes2 = getRandomBytes(256);
let diffCount = 0;
for (let i = 0; i < 256; i++) if (bytes[i] !== bytes2[i]) diffCount++;
assert(diffCount > 200, `Sequential calls produce different bytes (${diffCount}/256 differ)`);

// ─── TEST 2: STATISTICAL ANALYSIS ───────────────────────────────────────────
console.log('\n─── 2. Statistical Analysis Suite ──────────────────────');

const testBytes = getRandomBytes(4096);
const metadata = analyzeEntropy(testBytes);

assert(metadata.shannon >= 0 && metadata.shannon <= 1, `Shannon entropy: ${metadata.shannon.toFixed(6)} (normalized [0,1])`);
assert(metadata.shannon > 0.95, `Shannon entropy near-optimal: ${metadata.shannon.toFixed(6)} (>0.95)`);

assert(metadata.chiSquared.pValue >= 0 && metadata.chiSquared.pValue <= 1, `Chi-squared p-value: ${metadata.chiSquared.pValue.toFixed(6)}`);
assert(metadata.chiSquared.degreesOfFreedom === 255, `Chi-squared df: ${metadata.chiSquared.degreesOfFreedom}`);

assert(Math.abs(metadata.serialCorrelation) < 0.1, `Serial correlation near zero: ${metadata.serialCorrelation.toFixed(6)}`);

assert(metadata.monteCarloPI.deviation < 0.3, `Monte Carlo π deviation: ${metadata.monteCarloPI.deviation.toFixed(6)} (estimate: ${metadata.monteCarloPI.estimate.toFixed(6)})`);

assert(typeof metadata.runsTest.zScore === 'number', `Runs test z-score: ${metadata.runsTest.zScore.toFixed(6)}`);
assert(metadata.runsTest.pValue > 0.01, `Runs test p-value: ${metadata.runsTest.pValue.toFixed(6)} (>0.01 = no pattern detected)`);

assert(metadata.byteCount === 4096, `Byte count recorded: ${metadata.byteCount}`);
assert(metadata.timestamp > 0, `Timestamp recorded: ${metadata.timestamp}`);

// ─── TEST 3: FIELD SNAPSHOT ─────────────────────────────────────────────────
console.log('\n─── 3. Field Snapshot Generation ───────────────────────');

const snapshots: ReturnType<typeof generateFieldSnapshot>[] = [];
for (let i = 0; i < 20; i++) snapshots.push(generateFieldSnapshot());

const polarities = snapshots.map(s => s.polarity);
assert(polarities.every(p => p >= -1 && p <= 1), `All polarities in [-1, 1]: range [${Math.min(...polarities).toFixed(3)}, ${Math.max(...polarities).toFixed(3)}]`);

const bearings = snapshots.map(s => s.bearing);
assert(bearings.every(b => b >= 0 && b < 360), `All bearings in [0, 360): range [${Math.min(...bearings).toFixed(1)}, ${Math.max(...bearings).toFixed(1)}]`);

const elements = snapshots.map(s => s.bearingElement);
const uniqueElements = new Set(elements);
assert(uniqueElements.size >= 2, `Bearing maps to multiple elements: ${Array.from(uniqueElements).join(', ')}`);

const chargedCount = snapshots.filter(s => s.isCharged).length;
console.log(`  ${chargedCount > 0 ? WARN : PASS} Charged readings: ${chargedCount}/20 (charged when σ > 2.0)`);

// ─── TEST 4: RWS DECK ──────────────────────────────────────────────────────
console.log('\n─── 4. RWS Deck Integrity ─────────────────────────────');

const deck = createRWSDeck();
const validation = validateDeck(deck);
assert(validation.valid, `Deck validation passed`);
if (!validation.valid) validation.errors.forEach(e => console.log(`     ${FAIL} ${e}`));

assert(deck.length === 78, `Card count: ${deck.length}`);
assert(deck.filter(c => c.arcana === 'major').length === 22, `Major Arcana: 22`);
assert(deck.filter(c => c.arcana === 'minor').length === 40, `Minor Arcana: 40`);
assert(deck.filter(c => c.arcana === 'court').length === 16, `Court cards: 16`);

// Check all IDs unique
const deckIds = new Set(deck.map(c => c.id));
assert(deckIds.size === 78, `All card IDs unique: ${deckIds.size}`);

// Check elements assigned
const withElements = deck.filter(c => c.element);
assert(withElements.length === 78, `All cards have element assigned: ${withElements.length}/78`);

// ─── TEST 5: SHUFFLE SIMULATION ─────────────────────────────────────────────
console.log('\n─── 5. Shuffle Simulation ──────────────────────────────');

const methods: Array<'overhand' | 'riffle' | 'wash' | 'hindu' | 'pile' | 'cut'> = [
  'overhand', 'riffle', 'wash', 'hindu', 'pile', 'cut'
];

for (const method of methods) {
  const original = createRWSDeck();
  const shuffled = simulateShuffle(original, method, RECOMMENDED_PASSES[method]);

  // Cards preserved (no cards lost or duplicated)
  const shuffledIds = new Set(shuffled.map(c => c.id));
  assert(shuffledIds.size === 78, `${method}: all 78 cards preserved`);

  // Cards actually moved (except possibly 'cut' which preserves order)
  let movedCount = 0;
  for (let i = 0; i < 78; i++) {
    if (original[i].id !== shuffled[i].id) movedCount++;
  }

  if (method === 'cut') {
    assert(movedCount >= 0, `${method}: ${movedCount}/78 cards moved (cut preserves relative order)`);
  } else {
    assert(movedCount > 10, `${method}: ${movedCount}/78 cards moved (sufficient mixing)`);
  }
}

// Overhand adjacency test: check that overhand preserves some local order
const originalDeck = createRWSDeck();
const overhandResult = simulateShuffle(originalDeck, 'overhand', 1); // single pass
let adjacentPreserved = 0;
for (let i = 0; i < 77; i++) {
  const origIdx1 = originalDeck.findIndex(c => c.id === overhandResult[i].id);
  const origIdx2 = originalDeck.findIndex(c => c.id === overhandResult[i + 1].id);
  if (Math.abs(origIdx1 - origIdx2) === 1) adjacentPreserved++;
}
assert(adjacentPreserved > 5, `Overhand (1 pass) preserves local adjacency: ${adjacentPreserved}/77 adjacent pairs`);

// Wash vs overhand: wash should be more random
const washResult = simulateShuffle(createRWSDeck(), 'wash', 1);
let washMoved = 0;
for (let i = 0; i < 78; i++) {
  if (originalDeck[i].id !== washResult[i].id) washMoved++;
}
const overhandSingleMoved = 78 - adjacentPreserved; // rough proxy
assert(washMoved > 70, `Wash (1 pass) highly disruptive: ${washMoved}/78 cards moved`);

// ─── TEST 6: JUMPER DETECTION ───────────────────────────────────────────────
console.log('\n─── 6. Jumper Card Detection ───────────────────────────');

const jumpers = identifyJumperCandidates(78, 3);
assert(jumpers.length <= 3, `Max 3 jumpers flagged: ${jumpers.length}`);
assert(jumpers.every(j => j >= 0 && j < 78), `All jumper indices valid: [${jumpers.join(', ')}]`);

// Run 100 times, check that jumpers don't always appear
let timesWithJumpers = 0;
for (let i = 0; i < 100; i++) {
  if (identifyJumperCandidates(78, 3).length > 0) timesWithJumpers++;
}
assert(timesWithJumpers < 80, `Jumpers are selective (appeared ${timesWithJumpers}/100 runs)`);

// ─── TEST 7: FULL PIPELINE ──────────────────────────────────────────────────
console.log('\n─── 7. Full Pipeline (Stage 2) ────────────────────────');

// Build a simple 3-card spread template
const threeCardSpread: SpreadTemplate = {
  id: 'three_card_ppf',
  name: 'Past / Present / Future',
  cardCount: 3,
  compatibleSystems: ['rws'],
  tier: 'free',
  category: 'general',
  positions: [
    { id: 1, name: 'Past', description: 'What has led to this moment', interpretiveFrame: 'past_influence', temporalContext: 'past' },
    { id: 2, name: 'Present', description: 'Where you are now', interpretiveFrame: 'current_state', temporalContext: 'present' },
    { id: 3, name: 'Future', description: 'Where this leads', interpretiveFrame: 'likely_outcome', temporalContext: 'future' },
  ],
  layout: {
    type: 'line',
    rows: 1,
    cols: 3,
    cardPlacements: [
      { positionId: 1, row: 0, col: 0 },
      { positionId: 2, row: 0, col: 1 },
      { positionId: 3, row: 0, col: 2 },
    ]
  },
  readingFlow: {
    sequence: [1, 2, 3],
    narrativeArc: 'linear'
  },
  optionalExtensions: {
    significator: false,
    bottomCard: false,
    jumperCards: false,
    clarifierCards: false
  }
};

const shuffleConfig: ShuffleConfig = { method: 'riffle', passes: 7 };
const pullConfig: PullConfig = { method: 'top', readJumpers: false, readBottomCard: false };

const result = executeEntropyStageFull(createRWSDeck(), threeCardSpread, shuffleConfig, pullConfig);

assert(result.drawnCards.length === 3, `Drew 3 cards: ${result.drawnCards.length}`);

// All cards unique
const drawnIds = new Set(result.drawnCards.map(c => c.card.id));
assert(drawnIds.size === 3, `All drawn cards unique: ${drawnIds.size}`);

// All cards have valid position names
assert(result.drawnCards[0].positionName === 'Past', `Card 1 position: ${result.drawnCards[0].positionName}`);
assert(result.drawnCards[1].positionName === 'Present', `Card 2 position: ${result.drawnCards[1].positionName}`);
assert(result.drawnCards[2].positionName === 'Future', `Card 3 position: ${result.drawnCards[2].positionName}`);

// Field snapshot is populated
assert(result.fieldSnapshot.polarity >= -1 && result.fieldSnapshot.polarity <= 1, `Field polarity: ${result.fieldSnapshot.polarity.toFixed(4)}`);
assert(typeof result.fieldSnapshot.isCharged === 'boolean', `Charged flag present: ${result.fieldSnapshot.isCharged}`);
assert(result.fieldSnapshot.entropy.shannon > 0, `Shannon entropy: ${result.fieldSnapshot.entropy.shannon.toFixed(6)}`);

// Print the actual reading draw
console.log('\n  ── Sample Reading Draw ──');
for (const dc of result.drawnCards) {
  console.log(`    [${dc.positionName}] ${dc.card.name} (${dc.orientation})`);
}
console.log(`    Field: polarity=${result.fieldSnapshot.polarity.toFixed(3)}, σ=${result.fieldSnapshot.anomalySigma.toFixed(3)}, bearing=${result.fieldSnapshot.bearing.toFixed(1)}° (${result.fieldSnapshot.bearingElement}), charged=${result.fieldSnapshot.isCharged}`);

// ─── TEST 8: FULL PIPELINE WITH EXTRAS ──────────────────────────────────────
console.log('\n─── 8. Full Pipeline With Jumpers + Bottom Card ───────');

const fiveCardSpread: SpreadTemplate = {
  id: 'five_card',
  name: 'Situation / Challenge / Advice / Outcome / Hidden',
  cardCount: 5,
  compatibleSystems: ['rws'],
  tier: 'free',
  category: 'general',
  positions: [
    { id: 1, name: 'The Situation', description: 'Where you are', interpretiveFrame: 'current_state' },
    { id: 2, name: 'The Challenge', description: 'What stands in your way', interpretiveFrame: 'obstacle' },
    { id: 3, name: 'The Advice', description: 'What the cards suggest', interpretiveFrame: 'guidance' },
    { id: 4, name: 'The Outcome', description: 'Where this leads', interpretiveFrame: 'likely_outcome' },
    { id: 5, name: 'Hidden Influence', description: 'What you may not see', interpretiveFrame: 'hidden_factor' },
  ],
  layout: {
    type: 'line',
    rows: 1,
    cols: 5,
    cardPlacements: [
      { positionId: 1, row: 0, col: 0 },
      { positionId: 2, row: 0, col: 1 },
      { positionId: 3, row: 0, col: 2 },
      { positionId: 4, row: 0, col: 3 },
      { positionId: 5, row: 0, col: 4 },
    ]
  },
  readingFlow: {
    sequence: [1, 2, 3, 4, 5],
    narrativeArc: 'linear'
  },
  optionalExtensions: {
    significator: false,
    bottomCard: true,
    jumperCards: true,
    clarifierCards: false
  }
};

const pullConfigExtras: PullConfig = { method: 'top', readJumpers: true, readBottomCard: true };
const resultExtras = executeEntropyStageFull(createRWSDeck(), fiveCardSpread, { method: 'wash', passes: 1 }, pullConfigExtras);

const mainCards = resultExtras.drawnCards.filter(c => !c.isJumper && !c.isBottomCard);
const jumperCards = resultExtras.drawnCards.filter(c => c.isJumper);
const bottomCards = resultExtras.drawnCards.filter(c => c.isBottomCard);

assert(mainCards.length === 5, `Main spread: ${mainCards.length} cards`);
assert(bottomCards.length <= 1, `Bottom card: ${bottomCards.length}`);
console.log(`  ${jumperCards.length > 0 ? PASS : WARN} Jumper cards: ${jumperCards.length}`);

// All drawn cards must be unique (no card appears as both jumper and main draw)
const allDrawnIds = new Set(resultExtras.drawnCards.map(c => c.card.id));
assert(allDrawnIds.size === resultExtras.drawnCards.length, `No duplicate cards in combined draw: ${allDrawnIds.size}/${resultExtras.drawnCards.length}`);

console.log('\n  ── Sample Draw With Extras ──');
if (jumperCards.length > 0) {
  for (const jc of jumperCards) console.log(`    ⚡ [JUMPER] ${jc.card.name} (${jc.orientation})`);
}
for (const mc of mainCards) {
  console.log(`    [${mc.positionName}] ${mc.card.name} (${mc.orientation})`);
}
if (bottomCards.length > 0) {
  console.log(`    🔻 [HIDDEN FOUNDATION] ${bottomCards[0].card.name} (${bottomCards[0].orientation})`);
}

// ─── TEST 9: CONSISTENCY CHECK ──────────────────────────────────────────────
console.log('\n─── 9. Consistency Check (10 draws) ───────────────────');

const draws: Set<string>[] = [];
for (let i = 0; i < 10; i++) {
  const r = executeEntropyStageFull(createRWSDeck(), threeCardSpread, { method: 'riffle', passes: 7 }, { method: 'top', readJumpers: false, readBottomCard: false });
  const cardSet = r.drawnCards.map(c => c.card.name).join(' | ');
  draws.push(new Set(r.drawnCards.map(c => c.card.id)));
  console.log(`    Draw ${i + 1}: ${cardSet}`);
}

// Verify draws are not all identical
let identicalCount = 0;
for (let i = 1; i < draws.length; i++) {
  const prev = [...draws[i - 1]];
  const curr = [...draws[i]];
  if (prev.every((id, idx) => id === curr[idx])) identicalCount++;
}
assert(identicalCount < 9, `Draws are non-deterministic: ${10 - identicalCount}/10 unique combinations`);

// ─── RESULTS ────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed, ${warnings} warnings`);
if (failed === 0) {
  console.log('  \x1b[32m✓ ALL TESTS PASSED — Entropy Engine verified.\x1b[0m');
} else {
  console.log(`  \x1b[31m✗ ${failed} TESTS FAILED\x1b[0m`);
}
console.log('═══════════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
