// ============================================================================
// DRIFTFIELD — PIPELINE ORCHESTRATOR
// The single entry point: question → reading.
// Ties Stages 1–7 into one function call.
// This is what CCLI calls from the React frontend.
// ============================================================================

import type {
  DeckSystem, Tradition, InterpretationTone, ShuffleMethod, PullMethod,
  InputMode, SpreadTemplate, DrawnCard, FieldSnapshot, IntentionVector,
  CompositionTier, Card
} from '../types';
import type { ResolvedCard } from '../knowledge/resolver';
import type { NarrativeStructure, PreReadingContext, ContextAnalysis } from '../narrative/voice';
import { executeEntropyStageFull, generateFieldSnapshot } from '../entropy/engine';
import { createRWSDeck } from '../deck/rws';
import { resolveAllCards } from '../knowledge/resolver';
import { getSpread } from '../spread/templates';
import {
  buildReadingSystemPrompt, buildReadingUserPrompt,
  OPENING_TEMPLATES, TRANSITION_TEMPLATES, SYNTHESIS_TEMPLATES,
  CLOSING_TEMPLATES, CHARGED_FIELD_NOTES,
} from '../narrative/voice';

// ── READING REQUEST ─────────────────────────────────────────────────────────

export interface ReadingRequest {
  // User input
  question?: string;                // empty = open reading
  inputMethod: 'typed' | 'voice' | 'none';

  // Settings (pre-filled from user's reading profile defaults)
  deckSystem: DeckSystem;
  tradition: Tradition;
  spreadId: string;                 // from spread template library
  shuffleMethod: ShuffleMethod;
  pullMethod: PullMethod;
  inputMode: InputMode;             // 'virtual' or 'camera'
  tone: InterpretationTone;

  // Pull options
  readJumpers: boolean;
  readBottomCard: boolean;
  significatorCardId?: string;      // pre-selected significator
  fanSelections?: number[];         // for fan pull: user's tap positions
  reversalsEnabled: boolean;

  // Camera mode input (if inputMode === 'camera')
  cameraCards?: Array<{
    cardId: string;
    positionIndex: number;
    orientation: 'upright' | 'reversed';
    mlConfidence?: number;
    userCorrected?: boolean;
  }>;

  // User context (loaded from Supabase before calling)
  userContext: {
    userId: string;
    isPremium: boolean;
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    domainTags: string[];
    recentJournalExcerpt?: string;  // semantically relevant journal content
    recentPatterns?: string[];      // pattern descriptions from last analysis
    lastReadingCards?: string[];    // card IDs from most recent reading
  };
}

// ── READING RESULT ──────────────────────────────────────────────────────────

export interface ReadingResult {
  // Identifiers
  readingId: string;                // generated UUID
  timestamp: number;

  // Stage 1: Intention
  intentionVector: IntentionVector;
  contextAnalysis?: ContextAnalysis;

  // Stage 2: Entropy
  drawnCards: DrawnCard[];
  fieldSnapshot: FieldSnapshot;

  // Stage 3: Resolution
  resolvedCards: ResolvedCard[];

  // Stage 4: Field Integration (embedded in resolved cards)
  // Stage 5: Context Weaving (embedded in resolved cards)

  // Stage 6: Narrative
  narrative: NarrativeStructure;
  compositionTier: CompositionTier;

  // Stage 7: Patterns (appended asynchronously, may be empty)
  patterns: string[];

  // Tier C prompts (for premium API narrative upgrade)
  apiPrompts?: {
    system: string;
    user: string;
  };

  // Metadata for display
  spreadTemplate: SpreadTemplate;
  settings: {
    deckSystem: DeckSystem;
    tradition: Tradition;
    shuffleMethod: ShuffleMethod;
    pullMethod: PullMethod;
    inputMode: InputMode;
    tone: InterpretationTone;
  };
}

// ── STAGE 1: INTENTION PARSER ───────────────────────────────────────────────

/**
 * Rule-based intention parser for Phase 1.
 * Replaced by ML model (DistilBERT/MiniLM) in Phase 3.
 * Extracts domain, emotional tone, specificity, temporal focus,
 * implicit questions, and relational frame from the question text.
 */
function parseIntention(question: string | undefined, domainTags: string[]): IntentionVector {
  const text = (question || '').toLowerCase().trim();

  // Domain detection via keyword matching
  const domainKeywords: Record<string, string[]> = {
    love: ['love', 'relationship', 'partner', 'dating', 'marriage', 'boyfriend', 'girlfriend', 'husband', 'wife', 'romance', 'crush', 'ex', 'breakup', 'heart', 'soulmate', 'twin flame', 'intimacy', 'commitment'],
    career: ['job', 'career', 'work', 'boss', 'promotion', 'business', 'company', 'interview', 'hired', 'fired', 'quit', 'resign', 'project', 'freelance', 'entrepreneur', 'salary', 'profession', 'colleague'],
    financial: ['money', 'financial', 'debt', 'savings', 'invest', 'income', 'afford', 'budget', 'wealth', 'poverty', 'rent', 'mortgage', 'bills', 'crypto', 'stock', 'bank'],
    health: ['health', 'sick', 'illness', 'doctor', 'hospital', 'recovery', 'energy', 'tired', 'sleep', 'exercise', 'weight', 'diagnosis', 'pain', 'anxiety', 'depression', 'mental health', 'body'],
    spiritual: ['spiritual', 'soul', 'purpose', 'meaning', 'meditation', 'practice', 'faith', 'divine', 'god', 'universe', 'awakening', 'enlightenment', 'karma', 'dharma', 'path', 'calling'],
    creative: ['creative', 'art', 'music', 'writing', 'project', 'inspiration', 'muse', 'block', 'album', 'book', 'paint', 'perform', 'studio', 'craft'],
    family: ['family', 'mother', 'father', 'parent', 'child', 'sibling', 'sister', 'brother', 'daughter', 'son', 'home', 'household', 'grandparent'],
    self: ['myself', 'identity', 'who am i', 'self', 'growth', 'change', 'transform', 'direction', 'lost', 'stuck', 'confused', 'purpose'],
  };

  let detectedDomain: string = 'general';
  let maxScore = 0;
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    const score = keywords.filter(k => text.includes(k)).length;
    if (score > maxScore) { maxScore = score; detectedDomain = domain; }
  }

  // Fall back to domain tags if no keyword match
  if (detectedDomain === 'general' && domainTags.length > 0) {
    detectedDomain = domainTags[0];
  }

  // Emotional tone detection
  const toneKeywords: Record<string, string[]> = {
    anxious: ['worried', 'scared', 'afraid', 'anxious', 'nervous', 'panic', 'terrified', 'dread', 'fear', 'what if'],
    hopeful: ['hope', 'wish', 'dream', 'optimistic', 'excited', 'looking forward', 'positive', 'maybe things'],
    curious: ['wonder', 'curious', 'what', 'how', 'why', 'interested', 'tell me', 'show me'],
    grieving: ['lost', 'died', 'grief', 'miss', 'gone', 'mourning', 'passed away', 'never again'],
    frustrated: ['frustrated', 'angry', 'mad', 'fed up', 'tired of', 'sick of', 'enough', 'can\'t stand', 'unfair'],
    conflicted: ['torn', 'conflicted', 'both', 'either', 'can\'t decide', 'split', 'dilemma', 'on one hand'],
    excited: ['exciting', 'thrilled', 'amazing', 'can\'t wait', 'new', 'finally', 'ready'],
  };

  let detectedTone: string = 'neutral';
  let toneMax = 0;
  for (const [tone, keywords] of Object.entries(toneKeywords)) {
    const score = keywords.filter(k => text.includes(k)).length;
    if (score > toneMax) { toneMax = score; detectedTone = tone; }
  }

  // Specificity: how concrete is the question?
  const specificIndicators = ['should i', 'will i', 'when will', 'is he', 'is she', 'does he', 'does she', 'am i', 'can i'];
  const vagueIndicators = ['what do i need', 'what should i know', 'general', 'anything', 'whatever', 'open'];
  const specificScore = specificIndicators.filter(k => text.includes(k)).length;
  const vagueScore = vagueIndicators.filter(k => text.includes(k)).length;
  const specificity = text.length === 0 ? 0.0 : Math.min(1.0, Math.max(0.1, (specificScore - vagueScore + 3) / 6));

  // Temporal focus
  const pastWords = ['was', 'did', 'happened', 'before', 'used to', 'back when', 'past'];
  const futureWords = ['will', 'going to', 'when', 'future', 'next', 'soon', 'eventually', 'ahead'];
  const presentWords = ['now', 'currently', 'right now', 'today', 'at the moment', 'is'];
  const pastScore = pastWords.filter(k => text.includes(k)).length;
  const futureScore = futureWords.filter(k => text.includes(k)).length;
  const presentScore = presentWords.filter(k => text.includes(k)).length;
  let temporalFocus: 'past' | 'present' | 'future' | 'cyclical' | 'liminal' = 'present';
  if (futureScore > pastScore && futureScore > presentScore) temporalFocus = 'future';
  else if (pastScore > futureScore && pastScore > presentScore) temporalFocus = 'past';

  // Implicit questions
  const implicitQuestions: string[] = [];
  if (detectedDomain === 'love' && detectedTone === 'anxious') {
    implicitQuestions.push('Am I worthy of being loved?');
  }
  if (text.includes('should i quit') || text.includes('should i leave')) {
    implicitQuestions.push('Am I brave enough to make this change?');
    implicitQuestions.push('Will I be okay on the other side?');
  }
  if (text.includes('will i find') || text.includes('when will i')) {
    implicitQuestions.push('Is there something wrong with me for not having this yet?');
  }
  if (text.length === 0) {
    implicitQuestions.push('What energy is active in my life right now?');
  }

  // Relational frame
  const dyadicWords = ['us', 'we', 'our', 'between', 'together', 'partner', 'relationship'];
  const groupWords = ['family', 'team', 'group', 'everyone', 'community'];
  let relationalFrame: 'self' | 'dyadic' | 'group' | 'universal' = 'self';
  if (dyadicWords.some(w => text.includes(w))) relationalFrame = 'dyadic';
  else if (groupWords.some(w => text.includes(w))) relationalFrame = 'group';

  return {
    domain: detectedDomain as any,
    emotionalTone: detectedTone as any,
    specificity,
    temporalFocus,
    implicitQuestions,
    relationalFrame,
  };
}

// ── STAGE 5: CONTEXT WEAVER ─────────────────────────────────────────────────

interface WeavedContext {
  chartResonances: Map<string, string>;  // cardId → resonance note
  historyNotes: string[];                // relevant historical observations
  journalRelevance?: string;             // journal context if relevant
}

function weaveContext(
  drawnCards: DrawnCard[],
  userContext: ReadingRequest['userContext'],
): WeavedContext {
  const chartResonances = new Map<string, string>();
  const historyNotes: string[] = [];

  // Birth chart resonance: check if drawn cards match user's signs
  if (userContext.sunSign) {
    for (const dc of drawnCards) {
      if (dc.card.zodiac && dc.card.zodiac.toLowerCase() === userContext.sunSign.toLowerCase()) {
        chartResonances.set(dc.card.id, `This card corresponds to ${dc.card.zodiac} — your Sun sign. It speaks directly to your core identity.`);
      }
      if (userContext.moonSign && dc.card.zodiac && dc.card.zodiac.toLowerCase() === userContext.moonSign.toLowerCase()) {
        chartResonances.set(dc.card.id, `This card corresponds to ${dc.card.zodiac} — your Moon sign. It touches your emotional foundation.`);
      }
    }
  }

  // Check if any drawn card appeared in the last reading
  if (userContext.lastReadingCards && userContext.lastReadingCards.length > 0) {
    for (const dc of drawnCards) {
      if (userContext.lastReadingCards.includes(dc.card.id)) {
        historyNotes.push(`${dc.card.name} also appeared in your last reading. When the same card returns, it's asking you to pay closer attention.`);
      }
    }
  }

  // Pattern context
  if (userContext.recentPatterns) {
    historyNotes.push(...userContext.recentPatterns);
  }

  return {
    chartResonances,
    historyNotes,
    journalRelevance: userContext.recentJournalExcerpt,
  };
}

// ── STAGE 6: TEMPLATE COMPOSER (Tier A) ─────────────────────────────────────

function composeNarrativeTierA(
  resolvedCards: ResolvedCard[],
  intention: IntentionVector,
  fieldSnapshot: FieldSnapshot,
  spread: SpreadTemplate,
  question?: string,
  weavedContext?: WeavedContext,
): NarrativeStructure {
  // Opening
  let opening: string;
  if (!question || question.trim().length === 0) {
    const pool = OPENING_TEMPLATES.no_question;
    opening = pool[Math.floor(Math.random() * pool.length)];
  } else {
    const pool = intention.specificity > 0.5
      ? OPENING_TEMPLATES.with_question.specific
      : OPENING_TEMPLATES.with_question.vague;
    opening = pool[Math.floor(Math.random() * pool.length)]
      .replace('{domain}', intention.domain)
      .replace('{spread_name}', spread.name);
  }

  // Spread overview: count majors, identify dominant suit
  const majorCount = resolvedCards.filter(r => r.card.card.arcana === 'major' && !r.card.isJumper && !r.card.isBottomCard).length;
  const mainCards = resolvedCards.filter(r => !r.card.isJumper && !r.card.isBottomCard && !r.card.isSignificator);
  const suitCounts: Record<string, number> = {};
  for (const rc of mainCards) {
    const suit = rc.card.card.suit || 'major';
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
  }
  const suitEntries = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
  const dominantSuit = suitEntries.length > 0 ? suitEntries[0] : null;

  let spreadOverview = '';
  if (majorCount >= Math.ceil(mainCards.length / 2)) {
    spreadOverview = `${majorCount} of your ${mainCards.length} cards are Major Arcana. That's significant — the forces at work here are larger than day-to-day concerns. This reading is about the big picture.`;
  } else if (dominantSuit && dominantSuit[1] >= Math.ceil(mainCards.length * 0.6)) {
    const suitThemes: Record<string, string> = {
      wands: 'fire energy — passion, ambition, creative drive',
      cups: 'water energy — emotion, relationships, intuition',
      swords: 'air energy — thought, communication, conflict',
      pentacles: 'earth energy — material concerns, work, the physical world',
    };
    spreadOverview = `The reading is dominated by ${dominantSuit[0]} — ${suitThemes[dominantSuit[0]] || dominantSuit[0]}. That gives the whole spread a particular flavor.`;
  } else {
    spreadOverview = `The cards are a mix of energies. No single element dominates, which suggests a balanced situation — or one where multiple forces are at play.`;
  }

  // Card narratives
  const cardReadings = resolvedCards
    .filter(r => !r.card.isJumper && !r.card.isBottomCard)
    .map(rc => {
      const chartNote = weavedContext?.chartResonances.get(rc.card.card.id);
      let narrative = rc.interpretation.core;
      if (rc.positionalFrame) narrative += ' ' + rc.positionalFrame;
      if (rc.fieldResponse) narrative += ' ' + rc.fieldResponse;
      if (chartNote) narrative += ' ' + chartNote;
      if (rc.interpretation.advice) narrative += ' ' + rc.interpretation.advice;

      return {
        positionName: rc.card.positionName,
        cardName: rc.card.card.name,
        orientation: rc.card.orientation,
        narrative,
      };
    });

  // Synthesis
  const synthPool = SYNTHESIS_TEMPLATES.coherent;
  const synthesis = synthPool[Math.floor(Math.random() * synthPool.length)]
    .replace('{insight}', resolvedCards[0]?.interpretation.advice || 'Trust the process.');

  // Closing
  const closing = CLOSING_TEMPLATES[Math.floor(Math.random() * CLOSING_TEMPLATES.length)];

  // Optional sections
  let fieldNote: string | undefined;
  if (fieldSnapshot.isCharged) {
    fieldNote = CHARGED_FIELD_NOTES[Math.floor(Math.random() * CHARGED_FIELD_NOTES.length)];
  }

  let patternNote: string | undefined;
  if (weavedContext?.historyNotes && weavedContext.historyNotes.length > 0) {
    patternNote = weavedContext.historyNotes[0]; // show the most relevant one
  }

  return { opening, spreadOverview, cardReadings, synthesis, closing, fieldNote, patternNote };
}

// ── STAGE 7: PATTERN DETECTION ──────────────────────────────────────────────

/**
 * Pattern detection runs AFTER the reading is saved to the database.
 * It queries reading history and surfaces statistical anomalies.
 * This is a client-side trigger that calls the DB helper functions.
 *
 * For Phase 1: returns empty array. The DB functions exist;
 * the detection logic runs as a background job after save.
 * CCLI should call detectPatterns() after saveReading() completes.
 */
async function detectPatterns(
  userId: string,
  currentCards: DrawnCard[],
  db: any // DriftfieldDB instance
): Promise<string[]> {
  const patterns: string[] = [];

  try {
    // Card frequency check
    const frequencies = await db.getCardFrequencies(userId, 30);
    for (const freq of frequencies) {
      // Expected frequency: 1 draw per ~11 cards for a 5-card spread with 78-card deck
      const expectedRate = (freq.total_readings * 5) / 78;
      if (freq.frequency > expectedRate * 2.5 && freq.frequency >= 3) {
        patterns.push(
          `${freq.card_name} has appeared in ${freq.frequency} of your last ${freq.total_readings} readings. That's unusual — this card is trying to get your attention.`
        );
      }
    }

    // Suit distribution check
    const suitDist = await db.getSuitDistribution(userId, 30);
    for (const suit of suitDist) {
      if (suit.percentage > 40 && suit.count >= 5) {
        const themes: Record<string, string> = {
          wands: 'will and ambition', cups: 'emotion and relationships',
          swords: 'thought and conflict', pentacles: 'material and physical concerns',
          major: 'major life forces',
        };
        patterns.push(
          `${suit.percentage}% of your cards this month are ${suit.suit}. Your readings are saturated with ${themes[suit.suit] || suit.suit} energy.`
        );
      }
    }
  } catch (e) {
    // Pattern detection is non-critical; don't break the reading
    console.warn('Pattern detection failed:', e);
  }

  return patterns;
}

// ── MAIN ENTRY POINT ────────────────────────────────────────────────────────

/**
 * Execute a complete reading.
 *
 * Call this from the React frontend after the user has:
 * 1. Typed/spoken their question (or left it empty)
 * 2. Confirmed their settings (deck, spread, shuffle, pull, tone)
 * 3. Tapped "Draw" (virtual) or photographed their spread (camera)
 *
 * Returns the complete ReadingResult ready for display.
 */
export async function executeReading(request: ReadingRequest): Promise<ReadingResult> {
  const readingId = crypto.randomUUID();
  const timestamp = Date.now();

  // Get spread template
  const spread = getSpread(request.spreadId);
  if (!spread) throw new Error(`Unknown spread: ${request.spreadId}`);

  // ── Stage 1: Parse intention ──────────────────────────────────────────
  const intentionVector = parseIntention(request.question, request.userContext.domainTags);

  // ── Stage 2: Entropy + Draw ───────────────────────────────────────────
  let drawnCards: DrawnCard[];
  let fieldSnapshot: FieldSnapshot;

  if (request.inputMode === 'virtual') {
    // Virtual mode: entropy engine handles everything
    const deck = getDeckForSystem(request.deckSystem);
    const result = executeEntropyStageFull(
      deck, spread,
      { method: request.shuffleMethod, passes: undefined as any }, // uses recommended passes
      {
        method: request.pullMethod,
        readJumpers: request.readJumpers,
        readBottomCard: request.readBottomCard,
        significator: request.significatorCardId ? deck.find(c => c.id === request.significatorCardId) : undefined,
        fanSelections: request.fanSelections,
      },
      request.reversalsEnabled
    );
    drawnCards = result.drawnCards;
    fieldSnapshot = result.fieldSnapshot;
  } else {
    // Camera mode: cards provided by ML vision, field snapshot generated fresh
    fieldSnapshot = generateFieldSnapshot();
    drawnCards = (request.cameraCards || []).map(cc => {
      const deck = getDeckForSystem(request.deckSystem);
      const card = deck.find(c => c.id === cc.cardId);
      if (!card) throw new Error(`Unknown card: ${cc.cardId}`);
      return {
        card,
        orientation: cc.orientation as any,
        positionIndex: cc.positionIndex,
        positionName: spread.positions.find(p => p.id === cc.positionIndex)?.name || `Position ${cc.positionIndex}`,
        isJumper: false,
        isBottomCard: false,
        isSignificator: false,
        drawEntropy: Math.random(),
      };
    });
  }

  // ── Stage 3: Resolve cards against knowledge base ─────────────────────
  const resolvedCards = resolveAllCards(
    drawnCards,
    intentionVector,
    fieldSnapshot,
    { sun: request.userContext.sunSign, moon: request.userContext.moonSign, rising: request.userContext.risingSign }
  );

  // ── Stage 5: Weave user context ───────────────────────────────────────
  const weavedContext = weaveContext(drawnCards, request.userContext);

  // ── Stage 6: Compose narrative ────────────────────────────────────────
  let narrative: NarrativeStructure;
  let compositionTier: CompositionTier;

  // Always generate Tier A (template) as baseline/fallback
  narrative = composeNarrativeTierA(resolvedCards, intentionVector, fieldSnapshot, spread, request.question, weavedContext);
  compositionTier = 'template';

  // Build Tier C prompts for premium users (API call happens client-side via hook)
  let apiPrompts: { system: string; user: string } | undefined;
  if (request.userContext.isPremium) {
    const systemPrompt = buildReadingSystemPrompt(request.tone);
    const userPrompt = buildReadingUserPrompt({
      question: request.question,
      cards: resolvedCards.map(rc => ({
        positionName: rc.card.positionName,
        cardName: rc.card.card.name,
        orientation: rc.card.orientation,
        element: rc.card.card.element,
        zodiac: rc.card.card.zodiac,
        planet: rc.card.card.planet,
        coreMeaning: rc.interpretation.core,
        domainMeaning: rc.interpretation.core,
        positionalFrame: rc.positionalFrame,
        fieldResponse: rc.fieldResponse,
        chartResonance: rc.chartResonance,
      })),
      fieldState: {
        polarity: fieldSnapshot.polarity,
        anomalySigma: fieldSnapshot.anomalySigma,
        bearing: fieldSnapshot.bearing,
        bearingElement: fieldSnapshot.bearingElement,
        isCharged: fieldSnapshot.isCharged,
        shannon: fieldSnapshot.entropy.shannon,
      },
      spreadName: spread.name,
      deckSystem: request.deckSystem,
      tradition: request.tradition,
      userContext: {
        sunSign: request.userContext.sunSign,
        moonSign: request.userContext.moonSign,
        risingSign: request.userContext.risingSign,
        domainTags: request.userContext.domainTags,
      },
    });
    apiPrompts = { system: systemPrompt, user: userPrompt };
  }

  return {
    readingId,
    timestamp,
    intentionVector,
    drawnCards,
    fieldSnapshot,
    resolvedCards,
    narrative,
    compositionTier,
    patterns: [], // populated asynchronously after save
    apiPrompts,
    spreadTemplate: spread,
    settings: {
      deckSystem: request.deckSystem,
      tradition: request.tradition,
      shuffleMethod: request.shuffleMethod,
      pullMethod: request.pullMethod,
      inputMode: request.inputMode,
      tone: request.tone,
    },
  };
}

// ── DECK LOADER ─────────────────────────────────────────────────────────────

function getDeckForSystem(system: DeckSystem): Card[] {
  switch (system) {
    case 'rws': return createRWSDeck();
    // Future: case 'thoth': return createThothDeck();
    // Future: case 'marseille': return createMarseilleDeck();
    default: return createRWSDeck(); // fallback to RWS
  }
}

// ── POST-READING: SAVE + DETECT PATTERNS ────────────────────────────────────

/**
 * After displaying the reading, call this to:
 * 1. Save to Supabase
 * 2. Run pattern detection (premium only)
 * 3. Return any patterns found (to append to the reading UI)
 *
 * This is async and non-blocking — the reading displays immediately,
 * patterns append after save completes.
 */
export async function saveAndAnalyze(
  result: ReadingResult,
  request: ReadingRequest,
  db: any // DriftfieldDB instance
): Promise<{ savedId: string; patterns: string[] }> {
  // Flatten narrative to single text for storage
  const narrativeText = [
    result.narrative.opening,
    result.narrative.spreadOverview,
    ...result.narrative.cardReadings.map(cr => `[${cr.positionName}] ${cr.cardName} (${cr.orientation}): ${cr.narrative}`),
    result.narrative.synthesis,
    result.narrative.closing,
    result.narrative.fieldNote || '',
    result.narrative.patternNote || '',
  ].filter(Boolean).join('\n\n');

  // Save to database
  const saved = await db.saveReading({
    userId: request.userContext.userId,
    question: request.question,
    intentionVector: result.intentionVector,
    deckSystem: request.deckSystem,
    tradition: request.tradition,
    spreadType: request.spreadId,
    spreadName: result.spreadTemplate.name,
    shuffleMethod: request.shuffleMethod,
    pullMethod: request.pullMethod,
    inputMode: request.inputMode,
    interpretationTone: request.tone,
    fieldSnapshot: result.fieldSnapshot,
    entropyMetadata: result.fieldSnapshot.entropy,
    isCharged: result.fieldSnapshot.isCharged,
    narrative: narrativeText,
    compositionTier: result.compositionTier,
    drawnCards: result.drawnCards,
  });

  // Pattern detection (premium only, non-blocking)
  let patterns: string[] = [];
  if (request.userContext.isPremium) {
    patterns = await detectPatterns(request.userContext.userId, result.drawnCards, db);
  }

  return { savedId: saved.reading.id, patterns };
}
