// ============================================================================
// DRIFTFIELD — RIDER-WAITE-SMITH DECK
// Complete 78-card deck with correspondences
// ============================================================================

import type { Card } from '../types';

const MAJOR_ARCANA: Card[] = [
  { id: 'major-00', name: 'The Fool',            arcana: 'major', number: 0,  element: 'air',   planet: 'Uranus',  hebrewLetter: 'Aleph',  zodiac: undefined },
  { id: 'major-01', name: 'The Magician',        arcana: 'major', number: 1,  element: 'air',   planet: 'Mercury', hebrewLetter: 'Beth',   zodiac: undefined },
  { id: 'major-02', name: 'The High Priestess',  arcana: 'major', number: 2,  element: 'water', planet: 'Moon',    hebrewLetter: 'Gimel',  zodiac: undefined },
  { id: 'major-03', name: 'The Empress',         arcana: 'major', number: 3,  element: 'earth', planet: 'Venus',   hebrewLetter: 'Daleth', zodiac: undefined },
  { id: 'major-04', name: 'The Emperor',         arcana: 'major', number: 4,  element: 'fire',  planet: undefined, hebrewLetter: 'He',     zodiac: 'Aries' },
  { id: 'major-05', name: 'The Hierophant',      arcana: 'major', number: 5,  element: 'earth', planet: undefined, hebrewLetter: 'Vav',    zodiac: 'Taurus' },
  { id: 'major-06', name: 'The Lovers',          arcana: 'major', number: 6,  element: 'air',   planet: undefined, hebrewLetter: 'Zayin',  zodiac: 'Gemini' },
  { id: 'major-07', name: 'The Chariot',         arcana: 'major', number: 7,  element: 'water', planet: undefined, hebrewLetter: 'Cheth',  zodiac: 'Cancer' },
  { id: 'major-08', name: 'Strength',            arcana: 'major', number: 8,  element: 'fire',  planet: undefined, hebrewLetter: 'Teth',   zodiac: 'Leo' },
  { id: 'major-09', name: 'The Hermit',          arcana: 'major', number: 9,  element: 'earth', planet: undefined, hebrewLetter: 'Yod',    zodiac: 'Virgo' },
  { id: 'major-10', name: 'Wheel of Fortune',    arcana: 'major', number: 10, element: 'fire',  planet: 'Jupiter', hebrewLetter: 'Kaph',   zodiac: undefined },
  { id: 'major-11', name: 'Justice',             arcana: 'major', number: 11, element: 'air',   planet: undefined, hebrewLetter: 'Lamed',  zodiac: 'Libra' },
  { id: 'major-12', name: 'The Hanged Man',      arcana: 'major', number: 12, element: 'water', planet: 'Neptune', hebrewLetter: 'Mem',    zodiac: undefined },
  { id: 'major-13', name: 'Death',               arcana: 'major', number: 13, element: 'water', planet: undefined, hebrewLetter: 'Nun',    zodiac: 'Scorpio' },
  { id: 'major-14', name: 'Temperance',          arcana: 'major', number: 14, element: 'fire',  planet: undefined, hebrewLetter: 'Samekh', zodiac: 'Sagittarius' },
  { id: 'major-15', name: 'The Devil',           arcana: 'major', number: 15, element: 'earth', planet: undefined, hebrewLetter: 'Ayin',   zodiac: 'Capricorn' },
  { id: 'major-16', name: 'The Tower',           arcana: 'major', number: 16, element: 'fire',  planet: 'Mars',    hebrewLetter: 'Pe',     zodiac: undefined },
  { id: 'major-17', name: 'The Star',            arcana: 'major', number: 17, element: 'air',   planet: undefined, hebrewLetter: 'Tzaddi', zodiac: 'Aquarius' },
  { id: 'major-18', name: 'The Moon',            arcana: 'major', number: 18, element: 'water', planet: undefined, hebrewLetter: 'Qoph',   zodiac: 'Pisces' },
  { id: 'major-19', name: 'The Sun',             arcana: 'major', number: 19, element: 'fire',  planet: 'Sun',     hebrewLetter: 'Resh',   zodiac: undefined },
  { id: 'major-20', name: 'Judgement',           arcana: 'major', number: 20, element: 'fire',  planet: 'Pluto',   hebrewLetter: 'Shin',   zodiac: undefined },
  { id: 'major-21', name: 'The World',           arcana: 'major', number: 21, element: 'earth', planet: 'Saturn',  hebrewLetter: 'Tav',    zodiac: undefined },
];

function generateMinorArcana(): Card[] {
  const suits: { suit: 'wands' | 'cups' | 'swords' | 'pentacles'; element: 'fire' | 'water' | 'air' | 'earth' }[] = [
    { suit: 'wands',     element: 'fire' },
    { suit: 'cups',      element: 'water' },
    { suit: 'swords',    element: 'air' },
    { suit: 'pentacles', element: 'earth' },
  ];

  const cards: Card[] = [];

  for (const { suit, element } of suits) {
    const suitName = suit.charAt(0).toUpperCase() + suit.slice(1);

    // Pips: Ace through 10
    const pipNames = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
    for (let i = 0; i < 10; i++) {
      cards.push({
        id: `minor-${suit}-${String(i + 1).padStart(2, '0')}`,
        name: `${pipNames[i]} of ${suitName}`,
        arcana: 'minor',
        suit,
        number: i + 1,
        element,
      });
    }

    // Court cards
    const courts: { rank: 'page' | 'knight' | 'queen' | 'king'; courtElement: 'earth' | 'fire' | 'water' | 'air' }[] = [
      { rank: 'page',   courtElement: 'earth' },
      { rank: 'knight', courtElement: 'fire' },
      { rank: 'queen',  courtElement: 'water' },
      { rank: 'king',   courtElement: 'air' },     // RWS: King = Air of suit
    ];

    for (const { rank, courtElement } of courts) {
      const rankName = rank.charAt(0).toUpperCase() + rank.slice(1);
      cards.push({
        id: `court-${suit}-${rank}`,
        name: `${rankName} of ${suitName}`,
        arcana: 'court',
        suit,
        courtRank: rank,
        element,
      });
    }
  }

  return cards;
}

const MINOR_ARCANA = generateMinorArcana();

/**
 * Complete RWS deck: 22 Major + 40 Minor + 16 Court = 78 cards.
 */
export const RWS_DECK: Card[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

/**
 * Get the RWS deck as a fresh copy (ready for shuffle).
 */
export function createRWSDeck(): Card[] {
  return RWS_DECK.map(c => ({ ...c }));
}

/**
 * Verify deck integrity.
 */
export function validateDeck(cards: Card[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check count
  if (cards.length !== 78) {
    errors.push(`Expected 78 cards, got ${cards.length}`);
  }

  // Check unique IDs
  const ids = new Set(cards.map(c => c.id));
  if (ids.size !== cards.length) {
    errors.push(`Duplicate card IDs detected (${cards.length - ids.size} duplicates)`);
  }

  // Check Major Arcana
  const majors = cards.filter(c => c.arcana === 'major');
  if (majors.length !== 22) {
    errors.push(`Expected 22 Major Arcana, got ${majors.length}`);
  }

  // Check Minor Arcana
  const minors = cards.filter(c => c.arcana === 'minor');
  if (minors.length !== 40) {
    errors.push(`Expected 40 Minor Arcana, got ${minors.length}`);
  }

  // Check Court cards
  const courts = cards.filter(c => c.arcana === 'court');
  if (courts.length !== 16) {
    errors.push(`Expected 16 Court cards, got ${courts.length}`);
  }

  // Check suits
  const suitCounts: Record<string, number> = {};
  for (const c of [...minors, ...courts]) {
    if (c.suit) {
      suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    }
  }
  for (const suit of ['wands', 'cups', 'swords', 'pentacles']) {
    if ((suitCounts[suit] || 0) !== 14) {
      errors.push(`Expected 14 ${suit} cards, got ${suitCounts[suit] || 0}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
