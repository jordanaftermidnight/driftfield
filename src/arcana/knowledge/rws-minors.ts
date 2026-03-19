// ============================================================================
// DRIFTFIELD — RWS MINOR ARCANA KNOWLEDGE FRAMEWORK
// Structured interpretation system for 40 pip cards + 16 court cards
// Uses compositional approach: suit meaning × number meaning × domain
// ============================================================================

import type { CardKnowledge, DomainInterpretation, FieldResponseSet } from './types';
import type { Domain, Element } from '../types';

// ── SUIT ARCHETYPES ─────────────────────────────────────────────────────────

interface SuitArchetype {
  suit: string;
  element: Element;
  domain_primary: Domain;
  theme: string;
  upright_energy: string;
  reversed_energy: string;
  field_amplified: string;
  field_dampened: string;
  love: { up: string; rev: string };
  career: { up: string; rev: string };
  spiritual: { up: string; rev: string };
  health: { up: string; rev: string };
  creative: { up: string; rev: string };
  financial: { up: string; rev: string };
  family: { up: string; rev: string };
  self: { up: string; rev: string };
}

const SUIT_ARCHETYPES: Record<string, SuitArchetype> = {
  wands: {
    suit: 'wands', element: 'fire', domain_primary: 'career',
    theme: 'will, ambition, creative fire, initiative, passion, drive',
    upright_energy: 'Fiery energy directed toward creation and action.',
    reversed_energy: 'Fire turned inward — burnout, blocked will, frustrated ambition.',
    field_amplified: 'The field feeds the fire. Creative and willful energy intensified.',
    field_dampened: 'The field dampens the flame. Initiative meets resistance.',
    love: { up: 'Passionate, adventurous love. The spark that ignites connection.', rev: 'Passion without direction. Arguments, jealousy, or burnout in the relationship.' },
    career: { up: 'Professional ambition, new ventures, entrepreneurial energy.', rev: 'Career burnout, thwarted ambition, or projects that won\'t ignite.' },
    spiritual: { up: 'The fire of spiritual will. Active seeking, kundalini energy, the path of action.', rev: 'Spiritual burnout or loss of spiritual motivation.' },
    health: { up: 'Vitality, energy, and active physical engagement.', rev: 'Exhaustion, inflammation, or energy depletion.' },
    creative: { up: 'Creative fire at its peak. Inspiration flowing into action.', rev: 'Creative burnout, blocked inspiration, projects that stall.' },
    financial: { up: 'Financial enterprise, bold investments, new income streams.', rev: 'Financial risk without reward, or entrepreneurial failure.' },
    family: { up: 'Family leadership, protective energy, active family building.', rev: 'Family conflict, power struggles, or domineering behavior.' },
    self: { up: 'Personal power, confidence, and the courage to act on desire.', rev: 'Self-doubt masking as aggression, or willpower depleted.' },
  },
  cups: {
    suit: 'cups', element: 'water', domain_primary: 'love',
    theme: 'emotion, intuition, relationships, dreams, the heart, connection',
    upright_energy: 'Emotional flow, receptivity, and the capacity for deep feeling.',
    reversed_energy: 'Emotional blockage, overflow, or feelings disconnected from reality.',
    field_amplified: 'The field deepens emotional resonance. Feelings carry extra weight.',
    field_dampened: 'The field restricts emotional flow. Numbness or emotional flatness.',
    love: { up: 'Emotional depth, genuine connection, love in its many forms.', rev: 'Emotional overwhelm, unrequited feelings, or emotional manipulation.' },
    career: { up: 'Work that feeds the soul. Creative professions, care-based careers.', rev: 'Emotional over-investment in work, or work that drains emotional reserves.' },
    spiritual: { up: 'The path of the heart. Devotion, compassion, mystical feeling.', rev: 'Spiritual emotionalism without depth, or emotional wounds blocking spiritual growth.' },
    health: { up: 'Emotional well-being, hydration, flow states in the body.', rev: 'Emotional eating, substance use, depression, or blocked emotional processing.' },
    creative: { up: 'Art that comes from genuine feeling. Emotional truth in creative work.', rev: 'Sentimentality replacing genuine feeling. Emotional self-indulgence in art.' },
    financial: { up: 'Generosity, emotional relationship with money, abundance mindset.', rev: 'Emotional spending, financial decisions driven by feelings not facts.' },
    family: { up: 'Family love, emotional bonds, nurturing relationships.', rev: 'Family emotional dysfunction, codependency, or emotional neglect.' },
    self: { up: 'Emotional intelligence, self-compassion, and inner richness.', rev: 'Emotional overwhelm, mood instability, or disconnection from feelings.' },
  },
  swords: {
    suit: 'swords', element: 'air', domain_primary: 'self',
    theme: 'thought, truth, conflict, communication, mental clarity, pain that teaches',
    upright_energy: 'Mental clarity, decisive thinking, and truth that cuts through illusion.',
    reversed_energy: 'Mental confusion, harsh self-talk, deception, or thought patterns turned toxic.',
    field_amplified: 'The field sharpens the mind. Clarity intensified, communication precise.',
    field_dampened: 'The field dulls the blade. Confusion, indecision, or mental fog.',
    love: { up: 'Honest communication in love. The truth that strengthens relationship.', rev: 'Harsh words, mental games, or communication breakdown in relationship.' },
    career: { up: 'Strategic thinking, clear communication, intellectual achievement.', rev: 'Office politics, backstabbing, or analysis paralysis.' },
    spiritual: { up: 'The path of discernment. Cutting through illusion to find truth.', rev: 'Over-intellectualizing the spiritual path. The mind as obstacle.' },
    health: { up: 'Mental health awareness, sharp diagnosis, clear medical communication.', rev: 'Anxiety, insomnia, mental health crisis, or overthinking health concerns.' },
    creative: { up: 'Intellectual rigor in creative work. Editing, critique, sharp writing.', rev: 'Creative self-criticism that prevents creation. The inner critic unleashed.' },
    financial: { up: 'Financial analysis, clear-eyed assessment, strategic planning.', rev: 'Financial anxiety, worst-case thinking, or deceptive financial practices.' },
    family: { up: 'Honest family communication, setting boundaries with clarity.', rev: 'Family arguments, cruel words, or communication breakdown.' },
    self: { up: 'Mental clarity, self-honesty, and the courage to think independently.', rev: 'Negative self-talk, anxiety spirals, or mental exhaustion.' },
  },
  pentacles: {
    suit: 'pentacles', element: 'earth', domain_primary: 'financial',
    theme: 'material world, money, body, craft, patience, manifestation, the physical',
    upright_energy: 'Grounded manifestation, material security, and patient building.',
    reversed_energy: 'Material insecurity, greed, physical neglect, or blocked manifestation.',
    field_amplified: 'The field grounds energy. Material efforts gain traction.',
    field_dampened: 'The field destabilizes material foundations. Plans don\'t hold.',
    love: { up: 'Stable, committed, tangible love. The relationship that shows up.', rev: 'Materialistic approach to love, or relationship lacking substance.' },
    career: { up: 'Career stability, skilled work, tangible professional achievement.', rev: 'Job insecurity, underemployment, or work without purpose.' },
    spiritual: { up: 'The sacred in the material. Embodied spirituality, nature-based practice.', rev: 'Spiritual materialism, or disconnection from the body in spiritual practice.' },
    health: { up: 'Physical health, grounded body awareness, practical health management.', rev: 'Physical neglect, body dissatisfaction, or health problems from material excess.' },
    creative: { up: 'Craft and skill. The patient, material side of creative work.', rev: 'Creative work stalled by perfectionism or material constraints.' },
    financial: { up: 'Financial growth, material security, wise money management.', rev: 'Financial loss, debt, material insecurity, or greed.' },
    family: { up: 'Material provision for family, stable home environment, generational wealth.', rev: 'Family financial stress, material deprivation, or money controlling family dynamics.' },
    self: { up: 'Self-worth grounded in reality, body confidence, practical self-care.', rev: 'Self-worth tied to material status, body neglect, or feeling ungrounded.' },
  },
};

// ── NUMBER ARCHETYPES ───────────────────────────────────────────────────────

interface NumberArchetype {
  number: number;
  name: string;
  theme: string;
  upright: string;
  reversed: string;
  positional_advice: string;
  positional_challenge: string;
}

const NUMBER_ARCHETYPES: NumberArchetype[] = [
  { number: 1, name: 'Ace', theme: 'Pure potential, seed, gift, beginning',
    upright: 'A new beginning arrives as a gift. The purest form of the suit\'s energy — undiluted, potent, waiting to be shaped by will and circumstance.',
    reversed: 'Blocked potential, missed opportunity, or a beginning that hasn\'t materialized yet. The seed exists but conditions aren\'t right.',
    positional_advice: 'Accept the gift. The opportunity won\'t wait forever.',
    positional_challenge: 'The new beginning requires you to release something old to make room.' },
  { number: 2, name: 'Two', theme: 'Duality, choice, balance, partnership',
    upright: 'A choice or partnership. Two forces in dialogue — cooperation or tension, balance or imbalance. The dynamic relationship between things.',
    reversed: 'Indecision, imbalanced partnership, or a choice avoided. The dialogue has broken down.',
    positional_advice: 'Make the choice, or tend the partnership. Balance requires active effort.',
    positional_challenge: 'The duality is the challenge. Two directions, two people, two possibilities.' },
  { number: 3, name: 'Three', theme: 'Growth, expression, collaboration, first fruits',
    upright: 'Initial growth and expression. The seed has sprouted; the first results are visible. Collaboration and creativity.',
    reversed: 'Stalled growth, creative blocks, or collaboration breaking down.',
    positional_advice: 'Express what you\'ve been developing. Share the early work.',
    positional_challenge: 'Growth requires continued attention. Don\'t assume the first fruits mean the harvest is done.' },
  { number: 4, name: 'Four', theme: 'Stability, structure, foundation, rest',
    upright: 'A foundation has been established. Stability, order, and the security that comes from having built something solid.',
    reversed: 'Stagnation, rigidity, or instability. The foundation is either too rigid or cracking.',
    positional_advice: 'Consolidate what you\'ve built. Rest if needed.',
    positional_challenge: 'Stability that becomes stagnation is the trap. Know when to rest and when to move.' },
  { number: 5, name: 'Five', theme: 'Conflict, change, loss, challenge, growth through adversity',
    upright: 'Disruption and challenge. The comfortable structure of the Four is shaken. Conflict, loss, or a necessary upheaval that drives growth.',
    reversed: 'Recovery from conflict, or conflict avoided but festering. The storm is passing or hasn\'t been faced.',
    positional_advice: 'Face the challenge directly. Fives are uncomfortable but transformative.',
    positional_challenge: 'The loss or conflict is the growth mechanism. Don\'t numb it.' },
  { number: 6, name: 'Six', theme: 'Harmony, healing, generosity, restoration',
    upright: 'Harmony restored after the Five\'s disruption. Healing, generosity, and the warmth of connection re-established.',
    reversed: 'Unequal exchange, self-serving generosity, or healing that hasn\'t completed.',
    positional_advice: 'Give and receive in balance. The Six heals through reciprocity.',
    positional_challenge: 'Generosity that creates dependency isn\'t healing — it\'s enabling.' },
  { number: 7, name: 'Seven', theme: 'Assessment, strategy, inner work, faith tested',
    upright: 'Evaluation and strategy. The halfway point of the journey where you assess what you\'ve built and plan the next phase. Faith and courage required.',
    reversed: 'Deception (of others or self), lack of strategy, or faith failing.',
    positional_advice: 'Assess honestly. The Seven asks for both strategy and faith.',
    positional_challenge: 'The assessment may reveal uncomfortable truths. Face them.' },
  { number: 8, name: 'Eight', theme: 'Movement, mastery, change, power in motion',
    upright: 'Rapid movement and approaching mastery. The energy is flowing fast — events accelerating, skills sharpening, change in motion.',
    reversed: 'Movement blocked, premature action, or change happening too fast to control.',
    positional_advice: 'Move with purpose. The Eight\'s speed demands direction.',
    positional_challenge: 'Speed without direction wastes energy. Channel the momentum.' },
  { number: 9, name: 'Nine', theme: 'Near-completion, attainment, solitary achievement',
    upright: 'Near completion. The solitary achievement that comes from sustained effort. Almost there — the view from the summit, just before the final step.',
    reversed: 'So close but falling short, or the fear that arrives right before attainment.',
    positional_advice: 'You\'re closer than you think. One more push.',
    positional_challenge: 'The last stretch is often the hardest. Don\'t quit at the 90% mark.' },
  { number: 10, name: 'Ten', theme: 'Completion, fullness, cycle end, culmination',
    upright: 'The cycle completes. The suit\'s energy has reached its fullest expression — for better or worse. Endings that make new beginnings possible.',
    reversed: 'Incomplete cycle, burden of carrying too much, or resistance to completion.',
    positional_advice: 'Let the cycle complete. What\'s full is ready to be released.',
    positional_challenge: 'Completion requires letting go of what the cycle provided. Are you ready?' },
];

// ── COURT ARCHETYPES ────────────────────────────────────────────────────────

interface CourtArchetype {
  rank: string;
  maturity: string;
  upright: string;
  reversed: string;
  as_person: string;
  as_energy: string;
}

const COURT_ARCHETYPES: Record<string, CourtArchetype> = {
  page: {
    rank: 'Page', maturity: 'Student, beginner, messenger',
    upright: 'A new beginning, a message arriving, or the youthful energy of curiosity and exploration in the suit\'s domain.',
    reversed: 'Immaturity, scattered energy, or a message delayed or misunderstood.',
    as_person: 'A young or emotionally immature person — curious, eager, sometimes naive. Can also represent the inner child.',
    as_energy: 'The energy of beginning something new in this domain. Learning, exploring, asking questions.',
  },
  knight: {
    rank: 'Knight', maturity: 'Activist, pursuer, quester',
    upright: 'Pursuit, action, and single-minded drive in the suit\'s domain. The energy of charging forward with conviction.',
    reversed: 'Reckless action, obsessive pursuit, or energy directed without wisdom.',
    as_person: 'A young adult or someone in the "charging forward" phase of life. Passionate, sometimes impulsive, always in motion.',
    as_energy: 'The energy of active pursuit. Going after what you want with force and conviction.',
  },
  queen: {
    rank: 'Queen', maturity: 'Nurturer, master of the inner world',
    upright: 'Mastery of the suit\'s energy expressed through nurturing, intuition, and emotional intelligence. Power exercised through influence rather than force.',
    reversed: 'Manipulative, smothering, or disconnected from the suit\'s emotional truth.',
    as_person: 'A mature, emotionally intelligent person — often female-presenting but not necessarily. The person who leads through understanding.',
    as_energy: 'The energy of mature, internalized mastery. Knowing without needing to prove.',
  },
  king: {
    rank: 'King', maturity: 'Authority, master of the outer world',
    upright: 'External mastery and authority in the suit\'s domain. Wisdom expressed through action, leadership, and the responsible exercise of power.',
    reversed: 'Abuse of power, tyranny, or authority without wisdom. The leader who has lost touch with what they lead.',
    as_person: 'A person of authority and experience — often male-presenting but not necessarily. The person who has earned their position.',
    as_energy: 'The energy of mature, externalized mastery. Decisive authority grounded in experience.',
  },
};

// ── CARD GENERATOR ──────────────────────────────────────────────────────────

function generateDomain(suit: SuitArchetype, numArch: NumberArchetype, dom: Domain): DomainInterpretation {
  const suitDom = suit[dom as keyof SuitArchetype] as { up: string; rev: string } | undefined;
  if (!suitDom || typeof suitDom === 'string') {
    return { upright: { core: `${numArch.upright} ${suit.upright_energy}`, advice: numArch.positional_advice, warning: '', affirmation: '' },
             reversed: { core: `${numArch.reversed} ${suit.reversed_energy}`, advice: '', warning: '', affirmation: '' } };
  }
  return {
    upright: {
      core: `${numArch.upright} In the realm of ${dom}: ${suitDom.up}`,
      advice: numArch.positional_advice,
      warning: `Be aware that ${suit.theme.split(',')[0]} energy at this level can become overwhelming.`,
      affirmation: `The ${suit.element} element supports your ${dom} journey.`,
    },
    reversed: {
      core: `${numArch.reversed} In the realm of ${dom}: ${suitDom.rev}`,
      advice: `Address the blocked ${suit.element} energy in your ${dom} life.`,
      warning: `Reversed ${suit.suit} energy in ${dom} suggests an imbalance that needs attention.`,
      affirmation: `The blockage is temporary. ${suit.element} energy can be restored.`,
    },
  };
}

function generateFieldResponses(suit: SuitArchetype): FieldResponseSet {
  return {
    positiveHigh: suit.field_amplified,
    positiveMild: `Mild positive field gently supports ${suit.element} energy.`,
    neutral: `The field is balanced. ${suit.suit} energy operates on its own.`,
    negativeMild: suit.field_dampened,
    negativeHigh: `Strong negative field challenges ${suit.element} energy. ${suit.reversed_energy}`,
  };
}

const DOMAINS: Domain[] = ['love', 'career', 'spiritual', 'health', 'creative', 'financial', 'family', 'self', 'general'];

function generatePipCard(suit: SuitArchetype, numArch: NumberArchetype): CardKnowledge {
  const suitName = suit.suit.charAt(0).toUpperCase() + suit.suit.slice(1);
  const cardName = `${numArch.name} of ${suitName}`;
  const cardId = `minor-${suit.suit}-${String(numArch.number).padStart(2, '0')}`;

  const domains: Record<Domain, DomainInterpretation> = {} as any;
  for (const dom of DOMAINS) {
    domains[dom] = generateDomain(suit, numArch, dom);
  }

  return {
    cardId, cardName,
    coreMeaning: { upright: `${numArch.upright} Through the lens of ${suit.theme}.`, reversed: `${numArch.reversed} The ${suit.element} energy is blocked or misdirected.` },
    keywords: { upright: [numArch.theme.split(',')[0].trim(), suit.theme.split(',')[0].trim(), 'growth'], reversed: ['blocked ' + suit.element, numArch.theme.split(',').pop()!.trim(), 'stagnation'] },
    domains,
    positions: {
      situation: { positionKey: 'situation', frame: `The situation involves ${suit.theme.split(',')[0]} energy at the ${numArch.name} level.`, emphasis: `${suit.element} × ${numArch.theme.split(',')[0].trim()}` },
      challenge: { positionKey: 'challenge', frame: numArch.positional_challenge, emphasis: 'growth edge' },
      advice: { positionKey: 'advice', frame: numArch.positional_advice, emphasis: `${suit.element} wisdom` },
      outcome: { positionKey: 'outcome', frame: `The ${numArch.name}\'s energy resolves: ${numArch.upright.split('.')[0]}.`, emphasis: 'resolution' },
      hidden: { positionKey: 'hidden', frame: `Hidden ${suit.element} energy at the ${numArch.name} level is influencing events.`, emphasis: 'unseen force' },
    },
    emotionalModifiers: {},
    interactions: [],
    fieldResponses: generateFieldResponses(suit),
    correspondences: { element: suit.element, numerology: numArch.number, birthChartResonance: `Cards of ${suitName} resonate with ${suit.element} signs in your chart.` },
  };
}

function generateCourtCard(suit: SuitArchetype, court: CourtArchetype): CardKnowledge {
  const suitName = suit.suit.charAt(0).toUpperCase() + suit.suit.slice(1);
  const cardName = `${court.rank} of ${suitName}`;
  const cardId = `court-${suit.suit}-${court.rank.toLowerCase()}`;

  const domains: Record<Domain, DomainInterpretation> = {} as any;
  for (const dom of DOMAINS) {
    const suitDom = suit[dom as keyof SuitArchetype] as { up: string; rev: string } | undefined;
    const upContext = suitDom && typeof suitDom !== 'string' ? suitDom.up : suit.upright_energy;
    const revContext = suitDom && typeof suitDom !== 'string' ? suitDom.rev : suit.reversed_energy;
    domains[dom] = {
      upright: {
        core: `${court.upright} ${court.as_energy} In ${dom}: ${upContext}`,
        advice: `Embody the ${court.rank}\'s ${suit.element} wisdom in your ${dom} life.`,
        warning: `The ${court.rank}\'s strength can become their weakness when unchecked.`,
        affirmation: `You carry the ${court.rank} of ${suitName}\'s energy. It serves you well.`,
      },
      reversed: {
        core: `${court.reversed} ${dom}: ${revContext}`,
        advice: `The ${court.rank}\'s ${suit.element} energy needs redirection, not suppression.`,
        warning: `A reversed court card often indicates a person (possibly you) acting out the suit\'s shadow.`,
        affirmation: `Even reversed, the ${court.rank}\'s core qualities are available to you.`,
      },
    };
  }

  return {
    cardId, cardName,
    coreMeaning: { upright: `${court.upright} ${court.as_person}`, reversed: `${court.reversed}` },
    keywords: { upright: [court.maturity.split(',')[0].trim(), suit.theme.split(',')[0].trim(), 'mastery'], reversed: ['immaturity', 'shadow ' + suit.element, 'misdirected energy'] },
    domains,
    positions: {
      situation: { positionKey: 'situation', frame: `${court.as_person} This person or energy is central to the situation.`, emphasis: 'person or archetype' },
      challenge: { positionKey: 'challenge', frame: `The ${court.rank}\'s shadow side is the obstacle.`, emphasis: `reversed ${court.rank} energy` },
      advice: { positionKey: 'advice', frame: `Embody the ${court.rank} of ${suitName}\'s upright qualities.`, emphasis: `channel this energy` },
      outcome: { positionKey: 'outcome', frame: `A ${court.rank}-level expression of ${suit.element} energy defines the outcome.`, emphasis: 'mastery level' },
      hidden: { positionKey: 'hidden', frame: `A ${court.rank} of ${suitName} energy is operating behind the scenes.`, emphasis: 'hidden influence' },
    },
    emotionalModifiers: {},
    interactions: [],
    fieldResponses: generateFieldResponses(suit),
    correspondences: { element: suit.element, birthChartResonance: `${court.rank} of ${suitName} resonates with ${suit.element} placements in your chart.` },
  };
}

// ── EXPORT: COMPLETE MINOR ARCANA ───────────────────────────────────────────

export function generateMinorArcanaKnowledge(): CardKnowledge[] {
  const cards: CardKnowledge[] = [];

  for (const suitKey of ['wands', 'cups', 'swords', 'pentacles']) {
    const suit = SUIT_ARCHETYPES[suitKey];

    // 10 pip cards per suit
    for (const numArch of NUMBER_ARCHETYPES) {
      cards.push(generatePipCard(suit, numArch));
    }

    // 4 court cards per suit
    for (const courtKey of ['page', 'knight', 'queen', 'king']) {
      cards.push(generateCourtCard(suit, COURT_ARCHETYPES[courtKey]));
    }
  }

  return cards;
}

// Pre-generated for import
export const RWS_MINOR_ARCANA: CardKnowledge[] = generateMinorArcanaKnowledge();
