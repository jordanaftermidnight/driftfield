// ============================================================================
// DRIFTFIELD — READING SERVICE
// Supabase integration layer for the Arcana Engine pipeline
// ============================================================================

import { supabase } from './supabase';
import type {
  DrawnCard, FieldSnapshot, IntentionVector,
  DeckSystem, Tradition, InterpretationTone, ReadingOutput
} from '../types';

// ─── Types for DB operations ──────────────────────────────────────────────────

export interface SaveReadingParams {
  question?: string;
  intentionVector?: IntentionVector;
  deckSystem: DeckSystem;
  tradition: Tradition;
  spreadType: string;
  shuffleMethod: string;
  shufflePasses: number;
  pullMethod: string;
  inputMode: 'virtual' | 'camera';
  interpretationTone: InterpretationTone;
  reversalSystem: string;
  useElementalDignities: boolean;
  fieldSnapshot: FieldSnapshot;
  isCharged: boolean;
  narrative: string;
  compositionTier: 'template' | 'local_model' | 'api';
  drawnCards: DrawnCard[];
}

export interface ReadingSummary {
  id: string;
  question?: string;
  spreadType: string;
  deckSystem: string;
  cardCount: number;
  isCharged: boolean;
  rating?: number;
  createdAt: string;
  cards: {
    positionName: string;
    cardName: string;
    orientation: string;
  }[];
}

// ─── Save a complete reading ──────────────────────────────────────────────────

export async function saveReading(params: SaveReadingParams): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Insert the reading record
  const { data: reading, error: readingError } = await supabase
    .from('readings')
    .insert({
      user_id: user.id,
      question: params.question || null,
      intention_vector: params.intentionVector || null,
      deck_system: params.deckSystem,
      tradition: params.tradition,
      spread_type: params.spreadType,
      shuffle_method: params.shuffleMethod,
      shuffle_passes: params.shufflePasses,
      pull_method: params.pullMethod,
      input_mode: params.inputMode,
      interpretation_tone: params.interpretationTone,
      reversal_system: params.reversalSystem,
      use_elemental_dignities: params.useElementalDignities,
      field_snapshot: {
        polarity: params.fieldSnapshot.polarity,
        anomalySigma: params.fieldSnapshot.anomalySigma,
        bearing: params.fieldSnapshot.bearing,
        bearingElement: params.fieldSnapshot.bearingElement,
        isCharged: params.fieldSnapshot.isCharged
      },
      entropy_metadata: params.fieldSnapshot.entropy,
      is_charged: params.isCharged,
      narrative: params.narrative,
      composition_tier: params.compositionTier
    })
    .select('id')
    .single();

  if (readingError || !reading) {
    console.error('Failed to save reading:', readingError);
    return null;
  }

  // Insert the drawn cards
  const cardRows = params.drawnCards.map(dc => ({
    reading_id: reading.id,
    position_index: dc.positionIndex,
    position_name: dc.positionName,
    card_id: dc.card.id,
    card_name: dc.card.name,
    orientation: dc.orientation,
    is_jumper: dc.isJumper,
    is_bottom_card: dc.isBottomCard,
    is_significator: dc.isSignificator,
    draw_entropy: dc.drawEntropy,
    ml_confidence: null,
    user_corrected: false,
    resolved_interpretation: null  // filled by Stage 3 if available
  }));

  const { error: cardsError } = await supabase
    .from('reading_cards')
    .insert(cardRows);

  if (cardsError) {
    console.error('Failed to save reading cards:', cardsError);
    // Reading was saved, cards failed — log but don't delete the reading
  }

  return reading.id;
}

// ─── Load a single reading ────────────────────────────────────────────────────

export async function loadReading(readingId: string): Promise<ReadingSummary | null> {
  const { data: reading, error } = await supabase
    .from('readings')
    .select(`
      id, question, spread_type, deck_system, is_charged, rating, created_at,
      reading_cards (
        position_index, position_name, card_id, card_name, orientation,
        is_jumper, is_bottom_card, is_significator
      )
    `)
    .eq('id', readingId)
    .single();

  if (error || !reading) return null;

  return {
    id: reading.id,
    question: reading.question,
    spreadType: reading.spread_type,
    deckSystem: reading.deck_system,
    cardCount: reading.reading_cards?.length || 0,
    isCharged: reading.is_charged,
    rating: reading.rating,
    createdAt: reading.created_at,
    cards: (reading.reading_cards || [])
      .sort((a: any, b: any) => a.position_index - b.position_index)
      .map((c: any) => ({
        positionName: c.position_name,
        cardName: c.card_name,
        orientation: c.orientation
      }))
  };
}

// ─── List recent readings ─────────────────────────────────────────────────────

export async function listRecentReadings(limit: number = 20): Promise<ReadingSummary[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('readings')
    .select(`
      id, question, spread_type, deck_system, is_charged, rating, created_at,
      reading_cards (position_name, card_name, orientation, position_index)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r: any) => ({
    id: r.id,
    question: r.question,
    spreadType: r.spread_type,
    deckSystem: r.deck_system,
    cardCount: r.reading_cards?.length || 0,
    isCharged: r.is_charged,
    rating: r.rating,
    createdAt: r.created_at,
    cards: (r.reading_cards || [])
      .sort((a: any, b: any) => a.position_index - b.position_index)
      .map((c: any) => ({
        positionName: c.position_name,
        cardName: c.card_name,
        orientation: c.orientation
      }))
  }));
}

// ─── Update outcome notes ─────────────────────────────────────────────────────

export async function updateOutcomeNotes(
  readingId: string,
  notes: string,
  rating?: number
): Promise<boolean> {
  const update: Record<string, any> = {
    outcome_notes: notes,
    outcome_logged_at: new Date().toISOString()
  };
  if (rating !== undefined) update.rating = rating;

  const { error } = await supabase
    .from('readings')
    .update(update)
    .eq('id', readingId);

  return !error;
}

// ─── Get readings today count (for free tier rate limiting) ───────────────────

export async function getReadingsTodayCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .rpc('get_readings_today', { p_user_id: user.id });

  if (error) return 0;
  return data || 0;
}

// ─── Card frequency query (for pattern detection) ─────────────────────────────

export async function getCardFrequency(
  cardId: string,
  days: number = 30
): Promise<{ totalReadings: number; appearances: number; expectedRate: number; actualRate: number } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .rpc('get_card_frequency', {
      p_user_id: user.id,
      p_card_id: cardId,
      p_days: days
    });

  if (error || !data || data.length === 0) return null;

  return {
    totalReadings: data[0].total_readings,
    appearances: data[0].card_appearances,
    expectedRate: data[0].expected_rate,
    actualRate: data[0].actual_rate
  };
}

// ─── Suit distribution (for pattern detection) ────────────────────────────────

export async function getSuitDistribution(days: number = 30): Promise<{ suit: string; count: number; percentage: number }[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .rpc('get_suit_distribution', {
      p_user_id: user.id,
      p_days: days
    });

  if (error || !data) return [];

  return data.map((d: any) => ({
    suit: d.suit,
    count: d.card_count,
    percentage: d.percentage
  }));
}
