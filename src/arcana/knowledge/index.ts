// ============================================================================
// DRIFTFIELD — KNOWLEDGE BASE REGISTRY
// Unified access to all card interpretation data
// ============================================================================

import type { CardKnowledge } from './types';
import { RWS_MAJOR_ARCANA } from './rws-majors';
import { RWS_MAJORS_II_XXI } from './rws-majors-extended';
import { RWS_MAJORS_IV_X } from './rws-majors-iv-x';
import { RWS_MAJORS_XI_XXI } from './rws-majors-xi-xxi';
import { RWS_MINOR_ARCANA } from './rws-minors';

const cardMap = new Map<string, CardKnowledge>();

for (const card of RWS_MAJOR_ARCANA) cardMap.set(card.cardId, card);
for (const card of RWS_MAJORS_II_XXI) cardMap.set(card.cardId, card);
for (const card of RWS_MAJORS_IV_X) cardMap.set(card.cardId, card);
for (const card of RWS_MAJORS_XI_XXI) cardMap.set(card.cardId, card);
for (const card of RWS_MINOR_ARCANA) cardMap.set(card.cardId, card);

export function getKnowledge(cardId: string): CardKnowledge | null {
  return cardMap.get(cardId) ?? null;
}

export function getAllKnowledge(): CardKnowledge[] {
  return Array.from(cardMap.values());
}

export function validateKnowledgeBase(): { valid: boolean; errors: string[]; stats: Record<string, number> } {
  const errors: string[] = [];
  const majors = Array.from(cardMap.values()).filter(c => c.cardId.startsWith('major-'));
  const minors = Array.from(cardMap.values()).filter(c => c.cardId.startsWith('minor-'));
  const courts = Array.from(cardMap.values()).filter(c => c.cardId.startsWith('court-'));

  if (majors.length !== 22) errors.push(`Expected 22 majors, got ${majors.length}`);
  if (minors.length !== 40) errors.push(`Expected 40 minors, got ${minors.length}`);
  if (courts.length !== 16) errors.push(`Expected 16 courts, got ${courts.length}`);

  for (const [id, card] of cardMap) {
    if (!card.coreMeaning?.upright) errors.push(`${id}: missing upright core meaning`);
    if (!card.coreMeaning?.reversed) errors.push(`${id}: missing reversed core meaning`);
  }

  const deeplyAuthored = Array.from(cardMap.values()).filter(c =>
    c.domains?.love?.upright?.warning && c.domains.love.upright.warning.length > 10
  ).length;

  return { valid: errors.length === 0, errors, stats: { total: cardMap.size, majors: majors.length, minors: minors.length, courts: courts.length, deeplyAuthored } };
}

export type { CardKnowledge, DomainInterpretation, PositionalModifier, EmotionalModifier, CardInteraction, FieldResponseSet } from './types';
export { POSITION_KEYS } from './types';
