// ============================================================================
// DRIFTFIELD — CONVERSATIONAL INTERACTION LAYER
//
// The voice. How Driftfield talks to users — not as a chatbot, not as a
// keyword engine, but as something that understands context, speaks with
// warmth, and reads the room.
//
// This module defines:
// 1. The Question Interface — how users ask and how the system receives
// 2. The Conversational Context Builder — what the system understands
// 3. The Narrative Voice — how readings are delivered
// 4. The System Prompt Architecture — for API-tier narrative generation
// ============================================================================

// ── 1. THE QUESTION INTERFACE ───────────────────────────────────────────────

/**
 * How the user asks their question.
 *
 * This is NOT a chatbot. The user is not having a conversation with an AI.
 * They are performing a ritual: setting an intention, drawing cards,
 * receiving a reading. The interaction has gravity.
 *
 * The question input supports three modes:
 *
 * MODE A: Text Input (primary)
 *   User types their question into a text field.
 *   The field is large, inviting, and has a placeholder that rotates:
 *     "What's on your mind?"
 *     "Ask what you need to know."
 *     "Or leave this empty and let the cards speak."
 *     "What question have you been carrying?"
 *
 * MODE B: Voice Input (Phase 2+)
 *   User speaks their question. Speech-to-text converts it.
 *   The spoken word carries different energy than typed text —
 *   users tend to be more honest when speaking aloud.
 *   Transcription feeds into the same intention parser.
 *
 * MODE C: No Question (open reading)
 *   User leaves the field empty. The system reads without a question.
 *   This is not a lesser mode — it's the "let the cards speak" mode.
 *   The intention parser uses domain tags and recent journal context
 *   to construct a neutral intention vector.
 */

export interface QuestionInput {
  text?: string;                    // the user's question (may be empty)
  inputMethod: 'typed' | 'voice' | 'none';
  voiceTranscription?: string;      // raw transcription before cleanup
  timestamp: number;
}

/**
 * Context the system gathers BEFORE the reading.
 * This is not interrogation — it's attunement.
 *
 * Free tier: question + domain tags (auto-detected or manual)
 * Premium: question + tags + birth chart + journal context + reading history
 */
export interface PreReadingContext {
  question: QuestionInput;

  // Auto-detected from question text (Stage 1 Intention Parser)
  detectedDomain?: string;          // what the question is about
  detectedTone?: string;            // how they're feeling
  detectedSpecificity?: number;     // how specific the question is

  // User-provided context (from profile)
  domainTags: string[];             // active life areas
  birthChart?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
  };

  // System-gathered context (premium)
  recentJournalRelevant?: string;   // semantically relevant journal excerpt
  recentReadingPatterns?: string[];  // "Tower appeared 3 times this month"
  lastReadingDate?: string;
  lastReadingCards?: string[];       // what they drew last time

  // Reading settings
  deckSystem: string;
  tradition: string;
  spreadType: string;
  tone: string;
}


// ── 2. THE CONVERSATIONAL CONTEXT BUILDER ───────────────────────────────────

/**
 * The system doesn't just parse keywords — it understands what the user
 * is actually asking, including what they're NOT saying.
 *
 * "Will I find love?" is not a question about love.
 * It's a question about worthiness, timing, and fear.
 *
 * "Should I take this job?" is not a question about the job.
 * It's a question about identity, risk, and what they're leaving behind.
 *
 * The Context Builder extracts the surface question AND the implicit questions,
 * then feeds both to the Narrative Composer so the reading addresses the
 * real concern, not just the stated one.
 */

export interface ContextAnalysis {
  surfaceQuestion: string;          // what they literally asked
  implicitQuestions: string[];      // what they're actually asking (1–3)
  emotionalSubtext: string;         // what they're feeling but not saying
  decisionPoint?: string;           // if there's a decision, what is it
  timeframe?: string;               // when they need the answer
  stakeholders?: string[];          // who else is involved
  fearBeneath?: string;             // the fear underneath the question
  hopeBeneath?: string;             // the hope underneath the question
}

/**
 * Example context analyses:
 *
 * Input: "Should I quit my job?"
 * Analysis: {
 *   surfaceQuestion: "Should I leave my current employment?",
 *   implicitQuestions: [
 *     "Am I brave enough to try something new?",
 *     "Will I be okay financially?",
 *     "Is my dissatisfaction valid or am I just restless?"
 *   ],
 *   emotionalSubtext: "Frustrated but scared. Looking for permission.",
 *   decisionPoint: "Stay in current role vs. leave for something undefined",
 *   fearBeneath: "What if I leave and it's worse? What if I stay and waste my life?",
 *   hopeBeneath: "There's something better out there and I'm ready for it."
 * }
 *
 * Input: "What do I need to know right now?"
 * Analysis: {
 *   surfaceQuestion: "General guidance for this moment.",
 *   implicitQuestions: [
 *     "What am I missing?",
 *     "What should I be paying attention to?"
 *   ],
 *   emotionalSubtext: "Open but slightly anxious. Wants reassurance more than information.",
 *   fearBeneath: "Something important is happening and I can't see it clearly.",
 *   hopeBeneath: "The cards will show me what my conscious mind is blocking."
 * }
 *
 * Input: "" (no question)
 * Analysis: {
 *   surfaceQuestion: "Open reading — no specific question.",
 *   implicitQuestions: ["What energy is active in my life right now?"],
 *   emotionalSubtext: "Receptive. Willing to hear whatever comes.",
 * }
 */


// ── 3. THE NARRATIVE VOICE ──────────────────────────────────────────────────

/**
 * THE CRITICAL DESIGN DECISION:
 *
 * Driftfield readings must feel like they were written by a person
 * who knows tarot deeply and cares about the querent genuinely.
 *
 * NOT like:
 * - A fortune cookie ("New beginnings await!")
 * - A textbook ("The Fool represents the archetype of...")
 * - A chatbot ("Based on your query about career, here are some insights:")
 * - A keyword dump ("New beginnings. Innocence. Leap of faith.")
 *
 * LIKE:
 * - A wise friend who reads cards and speaks plainly
 * - Someone who says "look" and "here's the thing" and "I know that's hard to hear"
 * - Someone who addresses what you're actually feeling, not just what you asked
 * - Someone who can be direct without being cold, gentle without being vague
 *
 * The voice has these qualities:
 * - Direct but warm. Says the hard thing kindly.
 * - Assumes intelligence. Never condescending, never oversimplifying.
 * - Addresses the implicit question, not just the surface one.
 * - Uses "you" freely. This is personal.
 * - Occasionally asks rhetorical questions that land.
 * - Connects cards to each other — sees the whole spread as one statement.
 * - Grounded. Even when discussing esoteric concepts, stays practical.
 * - Has a sense of the querent as a real person with real stakes.
 */

export interface NarrativeStructure {
  // The reading is structured but doesn't feel structured.
  // These sections flow into each other as continuous prose.

  opening: string;
  // 1–2 sentences that acknowledge the question and set the tone.
  // Not "Let's look at your cards." More like:
  // "You asked about the job. But the cards are talking about something
  //  bigger than a career decision."

  spreadOverview: string;
  // The whole-spread read. What story do these cards tell together?
  // This is the paragraph that separates Driftfield from every competitor.
  // 3–5 sentences that treat the entire spread as one coherent statement.
  // "Three of these five cards are Major Arcana. That's unusual — and it means
  //  the forces at work here are larger than day-to-day. The Fool in your past
  //  and The World in your outcome tell a complete journey story. You started
  //  something without knowing where it would lead. It's leading somewhere real."

  cardReadings: CardNarrative[];
  // Individual card interpretations, but written as flowing prose,
  // not as bullet points. Each card section transitions naturally into the next.

  synthesis: string;
  // The "so what does this mean" section. 2–3 sentences that bring
  // everything together into a single, actionable insight.
  // "The reading is pointing you toward a decision you already know
  //  you need to make. The cards aren't telling you WHAT to choose —
  //  they're telling you that the choice itself is the point."

  closing: string;
  // 1 sentence. Warm, grounding, final.
  // "Sit with this. The reading will make more sense tomorrow."

  // Optional sections
  patternNote?: string;
  // If Pattern Memory detected something relevant:
  // "One more thing — The Tower has appeared in four of your last six readings.
  //  That's statistically significant. Whatever structure needs to fall has been
  //  asking to fall for weeks."

  fieldNote?: string;
  // If the field state is notable:
  // "Your draw happened during a charged field state — the entropy engine
  //  registered an anomaly at the moment of shuffle. Make of that what you will."
}

export interface CardNarrative {
  positionName: string;
  cardName: string;
  orientation: string;
  narrative: string;
  // Not: "The Tower in the Challenge position represents sudden upheaval."
  // But: "In the position of what's opposing you — The Tower. Reversed.
  //       Here's the thing about the Tower reversed: it's not that the
  //       disruption isn't coming. It's that you're bracing for it so hard
  //       that the bracing itself is the problem."
}


// ── 4. SYSTEM PROMPT ARCHITECTURE ───────────────────────────────────────────

/**
 * For Tier C (API) narrative generation, the system prompt defines
 * Driftfield's voice and the reading context.
 *
 * The prompt is NOT:
 * "You are a tarot reading AI assistant."
 *
 * The prompt IS:
 * A detailed character and voice definition that produces readings
 * indistinguishable from a skilled human reader who happens to be
 * very good with words.
 */

export function buildReadingSystemPrompt(tone: string): string {
  const baseVoice = `You are the reading voice of Driftfield — a tarot reading system that uses cryptographic entropy to draw cards.

Your job: deliver a tarot reading that feels like it was written by a person who genuinely knows this subject and genuinely cares about the person asking.

Voice characteristics:
- Direct but warm. You say hard things kindly. You never dodge the difficult interpretation.
- Assume the querent is intelligent. Never condescend. Never oversimplify.
- Use "you" freely. This is personal, not academic.
- Address what they're actually asking, which is often not what they literally typed. A question about a job is usually a question about identity. A question about love is usually a question about worthiness.
- Connect the cards to each other. See the whole spread as one statement, not a collection of individual meanings. The Tower next to The Star means something different than The Tower next to The Devil. Name these relationships.
- Be grounded. Even when discussing esoteric correspondences, keep one foot on the ground. The querent needs insight they can use, not a lecture on Qabalistic paths.
- Occasionally ask a rhetorical question that lands. "But here's what I want you to notice—" or "The question is whether—"
- Never use the phrase "this card represents" or "this card symbolizes." The card IS something, not a symbol of something.
- Never list keywords. Never use bullet points. Write in flowing prose.
- The reading should feel like a letter written to one specific person, not a horoscope written for millions.
- You know tarot deeply — correspondences, elemental dignities, card interactions, astrological attributions. Use this knowledge naturally, not as display. Mention Saturn's influence because it matters for the reading, not because it makes you sound knowledgeable.

Structure:
1. Opening (1–2 sentences): Acknowledge the question and set the reading's direction. If the cards are talking about something deeper than what was asked, say so immediately.
2. Spread overview (3–5 sentences): What do these cards say as a WHOLE? What's the arc, the dominant energy, the surprising element? This paragraph is the most important one.
3. Card-by-card (2–4 sentences per card): Each card in reading order. Transition naturally between cards. Reference how each card relates to the ones around it.
4. Synthesis (2–3 sentences): The "so what." One clear, actionable insight that ties everything together.
5. Closing (1 sentence): Warm, grounding, final.

Do NOT:
- Use exclamation marks
- Say "great question" or "interesting spread"
- Begin with "Based on your reading" or "The cards indicate"
- Use the word "journey" more than once
- Provide a disclaimer about tarot not being real
- Be falsely positive. If the reading is hard, say so with compassion.
- List card meanings in order without connecting them to each other`;

  const toneModifiers: Record<string, string> = {
    practical: `\n\nTone: PRACTICAL
- Emphasize what the querent should actually DO
- Keep language plain and grounded
- Advice should be specific enough to act on
- Example energy: "Look, the Five of Swords in your advice position is telling you to walk away from this particular fight. Not because you'd lose — because winning it costs more than it's worth."`,

    esoteric: `\n\nTone: ESOTERIC
- Weave in Qabalistic correspondences, elemental dignities, and astrological attributions naturally
- Use the language of the tradition (Thelemic for Thoth, Golden Dawn for RWS)
- Go deeper into symbolic layers — the alchemical reading, the Tree of Life path, the Hebrew letter
- But STILL be warm and personal. Esoteric doesn't mean cold or academic.
- Example energy: "The Chariot sits on the 18th path — Cheth, the fence, the enclosure. Cancer. The armor is the shell. You've built this protection for good reason, but the path forward requires you to drive THROUGH the fence, not live inside it."`,

    poetic: `\n\nTone: POETIC
- Lyrical, atmospheric, feeling-forward
- Use imagery and metaphor more than analysis
- Let the reading breathe. Shorter sentences. Space between ideas.
- The feeling of the reading matters as much as the content.
- Example energy: "Something in you already knows. The Fool at the cliff edge isn't falling — they're the only one who sees the bridge. And you, with your question about whether to leap — you've already leapt. This reading is just the ground confirming it caught you."`,

    analytical: `\n\nTone: ANALYTICAL
- Foreground the statistical and entropy data
- Reference field state, anomaly scores, Shannon entropy naturally
- Mention card recurrence patterns and probability
- Still personal, but with a data-informed edge
- Example energy: "Three Major Arcana in a five-card spread occurs roughly 6% of the time. Your Shannon entropy at the moment of draw was 0.997 — nearly optimal randomness. The field was positive at +1.8σ. Statistically, this is an unusual draw. The cards: Fool, Tower, World — the complete journey from innocence through destruction to completion. That this specific sequence appeared in this specific field state is, at minimum, worth paying attention to."`,
  };

  return baseVoice + (toneModifiers[tone] || toneModifiers['practical']);
}

/**
 * Build the user prompt for a specific reading.
 * This is what gets sent alongside the system prompt.
 */
export function buildReadingUserPrompt(context: {
  question?: string;
  contextAnalysis?: ContextAnalysis;
  cards: Array<{
    positionName: string;
    cardName: string;
    orientation: string;
    element?: string;
    zodiac?: string;
    planet?: string;
    coreMeaning: string;
    domainMeaning: string;
    positionalFrame: string;
    fieldResponse: string;
    chartResonance?: string;
  }>;
  fieldState: {
    polarity: number;
    anomalySigma: number;
    bearing: number;
    bearingElement: string;
    isCharged: boolean;
    shannon: number;
  };
  spreadName: string;
  deckSystem: string;
  tradition: string;
  userContext?: {
    sunSign?: string;
    moonSign?: string;
    risingSign?: string;
    domainTags?: string[];
    recentPatterns?: string[];
  };
}): string {
  let prompt = `READING CONTEXT:\n`;

  if (context.question) {
    prompt += `Question: "${context.question}"\n`;
  } else {
    prompt += `No question provided — open reading.\n`;
  }

  if (context.contextAnalysis) {
    const ca = context.contextAnalysis;
    if (ca.implicitQuestions.length > 0) {
      prompt += `What they're probably actually asking: ${ca.implicitQuestions.join('; ')}\n`;
    }
    if (ca.emotionalSubtext) {
      prompt += `Emotional tone: ${ca.emotionalSubtext}\n`;
    }
    if (ca.fearBeneath) {
      prompt += `Fear beneath the question: ${ca.fearBeneath}\n`;
    }
  }

  prompt += `\nSpread: ${context.spreadName} (${context.deckSystem}/${context.tradition})\n`;

  if (context.userContext?.sunSign) {
    prompt += `Querent: Sun in ${context.userContext.sunSign}`;
    if (context.userContext.moonSign) prompt += `, Moon in ${context.userContext.moonSign}`;
    if (context.userContext.risingSign) prompt += `, Rising ${context.userContext.risingSign}`;
    prompt += `\n`;
  }

  prompt += `\nFIELD STATE AT DRAW:\n`;
  prompt += `Polarity: ${context.fieldState.polarity.toFixed(3)} (${context.fieldState.polarity > 0 ? 'positive' : context.fieldState.polarity < 0 ? 'negative' : 'neutral'})\n`;
  prompt += `Anomaly: ${context.fieldState.anomalySigma.toFixed(2)}σ${context.fieldState.isCharged ? ' — CHARGED READING' : ''}\n`;
  prompt += `Shannon entropy: ${context.fieldState.shannon.toFixed(4)}\n`;
  prompt += `Compass: ${context.fieldState.bearing.toFixed(0)}° (${context.fieldState.bearingElement})\n`;

  prompt += `\nCARDS DRAWN:\n`;
  for (const card of context.cards) {
    prompt += `\n[${card.positionName}] ${card.cardName} (${card.orientation})`;
    if (card.element) prompt += ` — ${card.element}`;
    if (card.zodiac) prompt += ` / ${card.zodiac}`;
    if (card.planet) prompt += ` / ${card.planet}`;
    prompt += `\n`;
    prompt += `Core: ${card.coreMeaning}\n`;
    prompt += `In this domain: ${card.domainMeaning}\n`;
    prompt += `Position frame: ${card.positionalFrame}\n`;
    prompt += `Field modulation: ${card.fieldResponse}\n`;
    if (card.chartResonance) {
      prompt += `Birth chart resonance: ${card.chartResonance}\n`;
    }
  }

  if (context.userContext?.recentPatterns && context.userContext.recentPatterns.length > 0) {
    prompt += `\nPATTERN MEMORY:\n`;
    for (const pattern of context.userContext.recentPatterns) {
      prompt += `- ${pattern}\n`;
    }
  }

  prompt += `\nDeliver the reading now. Write as flowing prose. Address the person directly.`;

  return prompt;
}


// ── 5. TEMPLATE COMPOSITION (Tier A — no API call) ──────────────────────────

/**
 * For free tier users (Tier A composition), the narrative is assembled
 * from pre-authored templates + resolved card interpretations.
 *
 * The goal: even without an LLM, the reading should feel authored,
 * not generated. The templates are written with the same voice.
 */

export const OPENING_TEMPLATES = {
  with_question: {
    specific: [
      "You asked about {domain}. Let's see what the cards have to say — and whether they agree with you about what the real question is.",
      "Your question is clear, and the cards are responding to it. But they're also responding to something underneath it.",
      "{spread_name} for your question about {domain}. The cards are being direct today.",
      "You want to know about {domain}. The cards heard you. Here's what they're saying.",
    ],
    vague: [
      "You have something on your mind but you're not sure how to frame it. That's fine — the cards don't need perfect questions.",
      "The question is open, and so is the reading. Let's see what wants to be seen.",
      "Sometimes not knowing what to ask is the most honest starting point.",
    ],
  },
  no_question: [
    "No question — just cards. Let's see what's active in the field right now.",
    "You didn't ask a question, which means the cards get to choose what to talk about. Let's see where they went.",
    "Open reading. The cards speak for themselves today.",
  ],
};

export const TRANSITION_TEMPLATES = [
  "Moving to {position_name} —",
  "Next, in the position of {position_name}:",
  "And then there's {card_name} in {position_name}.",
  "The {position_name} position holds {card_name}, and this is where it gets interesting.",
  "Now, {card_name}. {orientation}. In {position_name}.",
];

export const SYNTHESIS_TEMPLATES = {
  coherent: [
    "The reading is consistent. The cards are saying one thing from multiple angles: {insight}.",
    "Everything here points in the same direction. {insight}.",
    "The cards agree with each other. That's worth noting. {insight}.",
  ],
  tension: [
    "There's tension in this reading — {card_a} and {card_b} are pulling in different directions. The resolution lies in {resolution}.",
    "Not everything here agrees. {card_a} says one thing; {card_b} says another. The truth is probably in the space between them.",
    "This reading has a contradiction at its center, and that contradiction IS the message.",
  ],
  transformation: [
    "This is a transformation reading. Something is ending; something is beginning. The cards are showing you the hinge point.",
    "The arc here is change — from {from} to {to}. You're somewhere in the middle of that arc right now.",
  ],
};

export const CLOSING_TEMPLATES = [
  "Sit with this. The reading will make more sense tomorrow.",
  "That's the reading. Take what resonates; leave what doesn't.",
  "Let this settle before you act on it.",
  "The cards said what they said. Your move.",
  "Come back to this reading in a few days. See what stuck.",
  "The reading is done. The decision is yours.",
];

export const CHARGED_FIELD_NOTES = [
  "One more thing — the entropy engine flagged this as a charged reading. The randomness source itself was anomalous at the moment of your draw. That doesn't happen often. Take this one seriously.",
  "Worth noting: the field state during your draw was statistically unusual. The reading carries extra weight.",
  "The field was charged when you drew. Whatever this reading is telling you, the system's own entropy is underlining it.",
];

export const PATTERN_TEMPLATES = {
  recurrence: "A pattern: {card_name} has appeared in {count} of your last {total} readings. The expected frequency is about 1 in {expected}. Something is trying to get your attention.",
  suit_dominance: "Interesting: {percentage}% of your cards this {period} have been {suit}. That's a lot of {element} energy. Your readings are saturated with {theme}.",
  elemental_absence: "You haven't drawn a {element} card in {count} readings. {element_meaning} may be dormant or suppressed right now.",
};
