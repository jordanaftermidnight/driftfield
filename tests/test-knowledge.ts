import { getKnowledge, getAllKnowledge, validateKnowledgeBase } from './src/knowledge/index';

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
let passed = 0, failed = 0;

function assert(c: boolean, m: string) { if (c) { console.log(`  ${PASS} ${m}`); passed++; } else { console.log(`  ${FAIL} ${m}`); failed++; } }

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║        DRIFTFIELD KNOWLEDGE BASE TESTS              ║');
console.log('╚══════════════════════════════════════════════════════╝');

// 1. Validate coverage
console.log('\n─── 1. Knowledge Base Coverage ────────────────────────');
const validation = validateKnowledgeBase();
assert(validation.stats.total === 78, `Total cards: ${validation.stats.total}/78`);
assert(validation.stats.majors === 22, `Major Arcana: ${validation.stats.majors}/22`);
assert(validation.stats.minors === 40, `Minor Arcana: ${validation.stats.minors}/40`);
assert(validation.stats.courts === 16, `Court Cards: ${validation.stats.courts}/16`);
console.log(`  ℹ Deeply authored: ${validation.stats.deeplyAuthored}/78`);

if (validation.errors.length > 0) {
  console.log(`  ${FAIL} Validation errors:`);
  validation.errors.slice(0, 5).forEach(e => console.log(`     ${e}`));
  if (validation.errors.length > 5) console.log(`     ... and ${validation.errors.length - 5} more`);
} else {
  assert(true, 'All cards have core meanings');
}

// 2. Spot check Major Arcana
console.log('\n─── 2. Major Arcana Spot Checks ───────────────────────');
const fool = getKnowledge('major-00');
assert(!!fool, 'The Fool exists');
assert(fool!.cardName === 'The Fool', `Name: ${fool!.cardName}`);
assert(fool!.domains.love.upright.core.length > 50, `Love upright core: ${fool!.domains.love.upright.core.length} chars`);
assert(fool!.domains.love.upright.warning.length > 10, `Love upright warning authored`);
assert(fool!.interactions.length > 0, `Interactions: ${fool!.interactions.length}`);
assert(!!fool!.fieldResponses.positiveHigh, 'Field responses present');
assert(!!fool!.correspondences.element, `Element: ${fool!.correspondences.element}`);

const tower = getKnowledge('major-16');
assert(!!tower, 'The Tower exists');
assert(tower!.domains.love.upright.core.length > 50, `Tower love core: ${tower!.domains.love.upright.core.length} chars`);
assert(tower!.domains.career.reversed.advice.length > 10, 'Tower career reversed advice authored');

const world = getKnowledge('major-21');
assert(!!world, 'The World exists');
assert(world!.domains.self.upright.affirmation.length > 10, 'World self affirmation authored');

// 3. Check all 22 majors have full domains
console.log('\n─── 3. Major Arcana Domain Completeness ───────────────');
const domains = ['love', 'career', 'spiritual', 'health', 'creative', 'financial', 'family', 'self', 'general'] as const;
let majorComplete = 0;
for (let i = 0; i <= 21; i++) {
  const id = `major-${String(i).padStart(2, '0')}`;
  const card = getKnowledge(id);
  if (!card) { console.log(`  ${FAIL} Missing: ${id}`); failed++; continue; }
  let complete = true;
  for (const dom of domains) {
    if (!card.domains[dom]?.upright?.core || card.domains[dom].upright.core.length < 20) {
      complete = false;
      break;
    }
  }
  if (complete) majorComplete++;
}
assert(majorComplete === 22, `Majors with all 9 domains populated: ${majorComplete}/22`);

// 4. Spot check Minor Arcana
console.log('\n─── 4. Minor Arcana Spot Checks ───────────────────────');
const aceWands = getKnowledge('minor-wands-01');
assert(!!aceWands, 'Ace of Wands exists');
assert(aceWands!.cardName === 'Ace of Wands', `Name: ${aceWands!.cardName}`);
assert(aceWands!.correspondences.element === 'fire', `Element: ${aceWands!.correspondences.element}`);
assert(!!aceWands!.domains.love, 'Love domain present');

const tenCups = getKnowledge('minor-cups-10');
assert(!!tenCups, 'Ten of Cups exists');
assert(tenCups!.domains.career.upright.core.length > 20, `Career core length: ${tenCups!.domains.career.upright.core.length}`);

const fiveSwords = getKnowledge('minor-swords-05');
assert(!!fiveSwords, 'Five of Swords exists');
assert(fiveSwords!.correspondences.element === 'air', `Element: ${fiveSwords!.correspondences.element}`);

// 5. Spot check Court Cards
console.log('\n─── 5. Court Card Spot Checks ─────────────────────────');
const queenCups = getKnowledge('court-cups-queen');
assert(!!queenCups, 'Queen of Cups exists');
assert(queenCups!.cardName === 'Queen of Cups', `Name: ${queenCups!.cardName}`);
assert(queenCups!.correspondences.element === 'water', `Element: ${queenCups!.correspondences.element}`);
assert(queenCups!.domains.love.upright.core.length > 20, 'Love domain authored');

const kingPentacles = getKnowledge('court-pentacles-king');
assert(!!kingPentacles, 'King of Pentacles exists');
assert(kingPentacles!.domains.financial.upright.core.length > 20, 'Financial domain authored');

// 6. Sample reading simulation
console.log('\n─── 6. Sample Reading Simulation ──────────────────────');
const sampleCards = ['major-16', 'minor-cups-03', 'court-swords-knight'];
const samplePositions = ['Situation', 'Advice', 'Outcome'];
console.log('  ── Three-Card Reading ──');
for (let i = 0; i < sampleCards.length; i++) {
  const card = getKnowledge(sampleCards[i])!;
  const dom = card.domains.career;
  console.log(`  [${samplePositions[i]}] ${card.cardName} (upright)`);
  console.log(`    → ${dom.upright.core.substring(0, 120)}...`);
}

// Results
console.log('\n═══════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('  \x1b[32m✓ ALL TESTS PASSED — Knowledge Base verified.\x1b[0m');
} else {
  console.log(`  \x1b[31m✗ ${failed} TESTS FAILED\x1b[0m`);
}
console.log('═══════════════════════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);
