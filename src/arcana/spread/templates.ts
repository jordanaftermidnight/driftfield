// ============================================================================
// DRIFTFIELD — SPREAD TEMPLATE LIBRARY
// Actual spread definitions for Phase 1 launch (10 spreads)
// ============================================================================

import type { SpreadTemplate } from '../types';

export const SPREAD_LIBRARY: SpreadTemplate[] = [

  // ── FREE TIER ─────────────────────────────────────────────────────────────

  {
    id: 'single_card',
    name: 'Daily Draw',
    cardCount: 1,
    compatibleSystems: ['rws', 'thoth', 'marseille_conver', 'lenormand_blue_owl'],
    tier: 'free',
    category: 'general',
    positions: [
      { id: 1, name: 'The Card', description: 'Your message for today', interpretiveFrame: 'situation', temporalContext: 'present' },
    ],
    layout: { type: 'grid', rows: 1, cols: 1, cardPlacements: [{ positionId: 1, row: 0, col: 0 }] },
    readingFlow: { sequence: [1], narrativeArc: 'linear' },
    optionalExtensions: { significator: false, bottomCard: false, jumperCards: false, clarifierCards: false },
  },

  {
    id: 'two_card_duality',
    name: 'Duality',
    cardCount: 2,
    compatibleSystems: ['rws', 'thoth', 'marseille_conver'],
    tier: 'free',
    category: 'general',
    positions: [
      { id: 1, name: 'This', description: 'One side of the tension', interpretiveFrame: 'situation' },
      { id: 2, name: 'That', description: 'The other side', interpretiveFrame: 'challenge' },
    ],
    layout: { type: 'line', rows: 1, cols: 2, cardPlacements: [{ positionId: 1, row: 0, col: 0 }, { positionId: 2, row: 0, col: 1 }] },
    readingFlow: { sequence: [1, 2], narrativeArc: 'linear', interactionPairs: [[1, 2]] },
    optionalExtensions: { significator: false, bottomCard: false, jumperCards: false, clarifierCards: false },
  },

  {
    id: 'three_card_ppf',
    name: 'Past / Present / Future',
    cardCount: 3,
    compatibleSystems: ['rws', 'thoth', 'marseille_conver'],
    tier: 'free',
    category: 'general',
    positions: [
      { id: 1, name: 'Past', description: 'What has led to this moment', interpretiveFrame: 'past', temporalContext: 'past' },
      { id: 2, name: 'Present', description: 'Where you are now', interpretiveFrame: 'situation', temporalContext: 'present' },
      { id: 3, name: 'Future', description: 'Where this leads', interpretiveFrame: 'outcome', temporalContext: 'future' },
    ],
    layout: { type: 'line', rows: 1, cols: 3, cardPlacements: [{ positionId: 1, row: 0, col: 0 }, { positionId: 2, row: 0, col: 1 }, { positionId: 3, row: 0, col: 2 }] },
    readingFlow: { sequence: [1, 2, 3], narrativeArc: 'linear' },
    optionalExtensions: { significator: false, bottomCard: false, jumperCards: false, clarifierCards: false },
  },

  {
    id: 'three_card_mbs',
    name: 'Mind / Body / Spirit',
    cardCount: 3,
    compatibleSystems: ['rws', 'thoth', 'marseille_conver'],
    tier: 'free',
    category: 'spiritual',
    positions: [
      { id: 1, name: 'Mind', description: 'Your mental state', interpretiveFrame: 'above', domainContext: 'self' },
      { id: 2, name: 'Body', description: 'Your physical reality', interpretiveFrame: 'situation', domainContext: 'health' },
      { id: 3, name: 'Spirit', description: 'Your spiritual condition', interpretiveFrame: 'foundation', domainContext: 'spiritual' },
    ],
    layout: { type: 'line', rows: 1, cols: 3, cardPlacements: [{ positionId: 1, row: 0, col: 0 }, { positionId: 2, row: 0, col: 1 }, { positionId: 3, row: 0, col: 2 }] },
    readingFlow: { sequence: [1, 2, 3], narrativeArc: 'linear' },
    optionalExtensions: { significator: false, bottomCard: false, jumperCards: false, clarifierCards: false },
  },

  {
    id: 'three_card_sao',
    name: 'Situation / Action / Outcome',
    cardCount: 3,
    compatibleSystems: ['rws', 'thoth', 'marseille_conver'],
    tier: 'free',
    category: 'general',
    positions: [
      { id: 1, name: 'Situation', description: 'What is happening', interpretiveFrame: 'situation' },
      { id: 2, name: 'Action', description: 'What to do about it', interpretiveFrame: 'advice' },
      { id: 3, name: 'Outcome', description: 'Where this leads', interpretiveFrame: 'outcome', temporalContext: 'future' },
    ],
    layout: { type: 'line', rows: 1, cols: 3, cardPlacements: [{ positionId: 1, row: 0, col: 0 }, { positionId: 2, row: 0, col: 1 }, { positionId: 3, row: 0, col: 2 }] },
    readingFlow: { sequence: [1, 2, 3], narrativeArc: 'linear' },
    optionalExtensions: { significator: false, bottomCard: false, jumperCards: false, clarifierCards: false },
  },

  {
    id: 'five_card',
    name: 'Five Card',
    cardCount: 5,
    compatibleSystems: ['rws', 'thoth', 'marseille_conver'],
    tier: 'free',
    category: 'general',
    positions: [
      { id: 1, name: 'The Situation', description: 'Where you are', interpretiveFrame: 'situation', temporalContext: 'present' },
      { id: 2, name: 'The Challenge', description: 'What stands in your way', interpretiveFrame: 'challenge' },
      { id: 3, name: 'The Advice', description: 'What the cards suggest', interpretiveFrame: 'advice' },
      { id: 4, name: 'The Outcome', description: 'Where this leads', interpretiveFrame: 'outcome', temporalContext: 'future' },
      { id: 5, name: 'Hidden Influence', description: 'What you may not see', interpretiveFrame: 'hidden' },
    ],
    layout: { type: 'cross', rows: 3, cols: 3, cardPlacements: [
      { positionId: 1, row: 1, col: 1 },  // center
      { positionId: 2, row: 0, col: 1 },  // top
      { positionId: 3, row: 1, col: 2 },  // right
      { positionId: 4, row: 2, col: 1 },  // bottom
      { positionId: 5, row: 1, col: 0 },  // left
    ] },
    readingFlow: { sequence: [1, 2, 3, 4, 5], narrativeArc: 'center_out', interactionPairs: [[1, 2], [1, 5], [3, 4]] },
    optionalExtensions: { significator: false, bottomCard: true, jumperCards: true, clarifierCards: false },
  },

  // ── PREMIUM TIER ──────────────────────────────────────────────────────────

  {
    id: 'horseshoe',
    name: 'Horseshoe',
    cardCount: 7,
    compatibleSystems: ['rws', 'thoth', 'marseille_conver'],
    tier: 'premium',
    category: 'general',
    positions: [
      { id: 1, name: 'Past', description: 'Past influences still active', interpretiveFrame: 'past', temporalContext: 'past' },
      { id: 2, name: 'Present', description: 'Current state of affairs', interpretiveFrame: 'situation', temporalContext: 'present' },
      { id: 3, name: 'Hidden Influences', description: 'What operates beneath the surface', interpretiveFrame: 'hidden' },
      { id: 4, name: 'Obstacles', description: 'What blocks your path', interpretiveFrame: 'challenge' },
      { id: 5, name: 'Environment', description: 'External influences and other people', interpretiveFrame: 'environment' },
      { id: 6, name: 'Advice', description: 'Recommended course of action', interpretiveFrame: 'advice' },
      { id: 7, name: 'Outcome', description: 'Most likely result on current path', interpretiveFrame: 'outcome', temporalContext: 'future' },
    ],
    layout: { type: 'line', rows: 1, cols: 7, cardPlacements: [
      { positionId: 1, row: 0, col: 0 }, { positionId: 2, row: 0, col: 1 }, { positionId: 3, row: 0, col: 2 },
      { positionId: 4, row: 0, col: 3 }, { positionId: 5, row: 0, col: 4 }, { positionId: 6, row: 0, col: 5 },
      { positionId: 7, row: 0, col: 6 },
    ] },
    readingFlow: { sequence: [1, 2, 3, 4, 5, 6, 7], narrativeArc: 'linear' },
    optionalExtensions: { significator: false, bottomCard: true, jumperCards: true, clarifierCards: true },
  },

  {
    id: 'celtic_cross',
    name: 'Celtic Cross',
    cardCount: 10,
    compatibleSystems: ['rws', 'thoth'],
    tier: 'premium',
    category: 'general',
    positions: [
      { id: 1, name: 'The Situation', description: 'The heart of the matter', interpretiveFrame: 'situation', temporalContext: 'present' },
      { id: 2, name: 'The Challenge', description: 'What crosses you — the immediate obstacle', interpretiveFrame: 'crossing' },
      { id: 3, name: 'Foundation', description: 'The root cause, the basis of the situation', interpretiveFrame: 'foundation' },
      { id: 4, name: 'Recent Past', description: 'What is passing away', interpretiveFrame: 'past', temporalContext: 'past' },
      { id: 5, name: 'Crown', description: 'Best possible outcome, what you aspire to', interpretiveFrame: 'crown' },
      { id: 6, name: 'Near Future', description: 'What is approaching', interpretiveFrame: 'future', temporalContext: 'future' },
      { id: 7, name: 'Your Attitude', description: 'How you see yourself in this situation', interpretiveFrame: 'self_perception' },
      { id: 8, name: 'External Influences', description: 'How others see you, environmental factors', interpretiveFrame: 'external' },
      { id: 9, name: 'Hopes and Fears', description: 'What you hope for or fear most', interpretiveFrame: 'hopes_fears' },
      { id: 10, name: 'Final Outcome', description: 'Where this leads given all factors', interpretiveFrame: 'outcome', temporalContext: 'future' },
    ],
    layout: { type: 'custom', rows: 5, cols: 6, cardPlacements: [
      { positionId: 1, row: 2, col: 1 },                    // center
      { positionId: 2, row: 2, col: 1, rotation: 90 },      // crossing (rotated 90°)
      { positionId: 3, row: 4, col: 1 },                    // below
      { positionId: 4, row: 2, col: 0 },                    // left
      { positionId: 5, row: 0, col: 1 },                    // above
      { positionId: 6, row: 2, col: 2 },                    // right
      { positionId: 7, row: 4, col: 4 },                    // staff bottom
      { positionId: 8, row: 3, col: 4 },                    // staff lower-mid
      { positionId: 9, row: 1, col: 4 },                    // staff upper-mid
      { positionId: 10, row: 0, col: 4 },                   // staff top
    ] },
    readingFlow: {
      sequence: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      narrativeArc: 'cross_then_staff',
      interactionPairs: [[1, 2], [3, 5], [4, 6], [7, 8], [9, 10]],
      mirrorPairs: [[3, 5], [4, 6]],
    },
    optionalExtensions: { significator: true, bottomCard: true, jumperCards: true, clarifierCards: true },
  },

  {
    id: 'relationship_mirror',
    name: 'Relationship Mirror',
    cardCount: 6,
    compatibleSystems: ['rws', 'thoth'],
    tier: 'premium',
    category: 'relationship',
    positions: [
      { id: 1, name: 'You — Feelings', description: 'How you feel in this relationship', interpretiveFrame: 'self_perception', domainContext: 'love' },
      { id: 2, name: 'You — Wants', description: 'What you want from this relationship', interpretiveFrame: 'hopes_fears', domainContext: 'love' },
      { id: 3, name: 'You — Gives', description: 'What you bring to the relationship', interpretiveFrame: 'situation', domainContext: 'love' },
      { id: 4, name: 'Them — Feelings', description: 'How they feel in this relationship', interpretiveFrame: 'external', domainContext: 'love' },
      { id: 5, name: 'Them — Wants', description: 'What they want from this relationship', interpretiveFrame: 'hopes_fears', domainContext: 'love' },
      { id: 6, name: 'Them — Gives', description: 'What they bring to the relationship', interpretiveFrame: 'environment', domainContext: 'love' },
    ],
    layout: { type: 'column', rows: 3, cols: 2, cardPlacements: [
      { positionId: 1, row: 0, col: 0 }, { positionId: 4, row: 0, col: 1 },
      { positionId: 2, row: 1, col: 0 }, { positionId: 5, row: 1, col: 1 },
      { positionId: 3, row: 2, col: 0 }, { positionId: 6, row: 2, col: 1 },
    ] },
    readingFlow: {
      sequence: [1, 2, 3, 4, 5, 6],
      narrativeArc: 'linear',
      mirrorPairs: [[1, 4], [2, 5], [3, 6]],
    },
    optionalExtensions: { significator: false, bottomCard: false, jumperCards: false, clarifierCards: true },
  },

  {
    id: 'shadow_work',
    name: 'Shadow Work',
    cardCount: 5,
    compatibleSystems: ['rws', 'thoth'],
    tier: 'premium',
    category: 'spiritual',
    positions: [
      { id: 1, name: 'Persona', description: 'The face you show the world', interpretiveFrame: 'self_perception' },
      { id: 2, name: 'Shadow', description: 'What you deny, suppress, or project', interpretiveFrame: 'hidden' },
      { id: 3, name: 'Trigger', description: 'What activates the shadow', interpretiveFrame: 'challenge' },
      { id: 4, name: 'Integration', description: 'How to reclaim this energy', interpretiveFrame: 'advice' },
      { id: 5, name: 'Gift', description: 'What the shadow offers when integrated', interpretiveFrame: 'outcome' },
    ],
    layout: { type: 'line', rows: 1, cols: 5, cardPlacements: [
      { positionId: 1, row: 0, col: 0 }, { positionId: 2, row: 0, col: 1 }, { positionId: 3, row: 0, col: 2 },
      { positionId: 4, row: 0, col: 3 }, { positionId: 5, row: 0, col: 4 },
    ] },
    readingFlow: { sequence: [1, 2, 3, 4, 5], narrativeArc: 'linear', interactionPairs: [[1, 2], [2, 5]] },
    optionalExtensions: { significator: false, bottomCard: true, jumperCards: false, clarifierCards: false },
  },
];

export function getSpread(id: string): SpreadTemplate | undefined {
  return SPREAD_LIBRARY.find(s => s.id === id);
}

export function getSpreadsByTier(tier: 'free' | 'premium'): SpreadTemplate[] {
  if (tier === 'premium') return SPREAD_LIBRARY;
  return SPREAD_LIBRARY.filter(s => s.tier === 'free');
}

export function getSpreadsByCategory(category: string): SpreadTemplate[] {
  return SPREAD_LIBRARY.filter(s => s.category === category);
}
