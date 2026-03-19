// ============================================================================
// DRIFTFIELD — DATABASE SERVICE LAYER
// TypeScript interface to Supabase for the Arcana Engine pipeline.
// Import this from your React components and hooks.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  DeckSystem, Tradition, InterpretationTone, ShuffleMethod, PullMethod,
  InputMode, CompositionTier, FieldSnapshot, EntropyMetadata,
  IntentionVector, DrawnCard
} from '../types';

// ── Database row types ──────────────────────────────────────────────────────

export interface UserContextRow {
  id: string;
  user_id: string;
  birth_date: string | null;
  birth_time: string | null;
  birth_place: string | null;
  birth_latitude: number | null;
  birth_longitude: number | null;
  birth_timezone: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  chart_data: Record<string, unknown> | null;
  chart_house_system: string;
  chart_computed_at: string | null;
  domain_tags: string[];
  default_deck: string;
  default_tradition: string;
  default_spread: string;
  default_shuffle: string;
  default_pull: string;
  default_tone: string;
  reversals_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReadingRow {
  id: string;
  user_id: string;
  question: string | null;
  intention_vector: IntentionVector | null;
  deck_system: DeckSystem;
  tradition: Tradition;
  spread_type: string;
  spread_name: string | null;
  shuffle_method: ShuffleMethod;
  pull_method: PullMethod;
  input_mode: InputMode;
  interpretation_tone: InterpretationTone;
  field_snapshot: FieldSnapshot | null;
  entropy_metadata: EntropyMetadata | null;
  is_charged: boolean;
  narrative: string | null;
  composition_tier: CompositionTier;
  outcome_notes: string | null;
  outcome_logged_at: string | null;
  rating: number | null;
  created_at: string;
}

export interface ReadingCardRow {
  id: string;
  reading_id: string;
  position_index: number;
  position_name: string;
  card_id: string;
  card_name: string;
  orientation: string;
  is_jumper: boolean;
  is_bottom_card: boolean;
  is_significator: boolean;
  draw_entropy: number | null;
  ml_confidence: number | null;
  user_corrected: boolean;
  resolved_interpretation: Record<string, unknown> | null;
}

export interface JournalEntryRow {
  id: string;
  user_id: string;
  content: string;
  pinned: boolean;
  tags: string[];
  created_at: string;
}

export interface PatternRow {
  id: string;
  user_id: string;
  pattern_type: string;
  pattern_data: Record<string, unknown>;
  significance_score: number;
  readings_involved: string[];
  description: string | null;
  surfaced: boolean;
  dismissed: boolean;
  detected_at: string;
}

// ── Service class ───────────────────────────────────────────────────────────

export class DriftfieldDB {
  constructor(private supabase: SupabaseClient) {}

  // ── User Context ────────────────────────────────────────────────────────

  async getUserContext(userId: string): Promise<UserContextRow | null> {
    const { data, error } = await this.supabase
      .from('user_context')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  async upsertUserContext(userId: string, updates: Partial<UserContextRow>): Promise<UserContextRow> {
    const { data, error } = await this.supabase
      .from('user_context')
      .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async saveBirthChart(userId: string, chartInput: {
    birthDate: string;
    birthTime?: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
    timezone: string;
    sunSign: string;
    moonSign?: string;
    risingSign?: string;
    chartData?: Record<string, unknown>;
    houseSystem?: string;
  }): Promise<UserContextRow> {
    return this.upsertUserContext(userId, {
      birth_date: chartInput.birthDate,
      birth_time: chartInput.birthTime || null,
      birth_place: chartInput.birthPlace,
      birth_latitude: chartInput.latitude,
      birth_longitude: chartInput.longitude,
      birth_timezone: chartInput.timezone,
      sun_sign: chartInput.sunSign,
      moon_sign: chartInput.moonSign || null,
      rising_sign: chartInput.risingSign || null,
      chart_data: chartInput.chartData || null,
      chart_house_system: chartInput.houseSystem || 'placidus',
      chart_computed_at: new Date().toISOString(),
    });
  }

  // ── Readings ────────────────────────────────────────────────────────────

  async checkReadingLimit(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('check_reading_limit', { p_user_id: userId });
    if (error) throw error;
    return data as boolean;
  }

  async checkCameraLimit(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('check_camera_limit', { p_user_id: userId });
    if (error) throw error;
    return data as boolean;
  }

  async saveReading(reading: {
    userId: string;
    question?: string;
    intentionVector?: IntentionVector;
    deckSystem: DeckSystem;
    tradition: Tradition;
    spreadType: string;
    spreadName?: string;
    shuffleMethod: ShuffleMethod;
    pullMethod: PullMethod;
    inputMode: InputMode;
    interpretationTone: InterpretationTone;
    fieldSnapshot: FieldSnapshot;
    entropyMetadata: EntropyMetadata;
    isCharged: boolean;
    narrative?: string;
    compositionTier: CompositionTier;
    drawnCards: DrawnCard[];
  }): Promise<{ reading: ReadingRow; cards: ReadingCardRow[] }> {
    // Insert reading
    const { data: readingData, error: readingError } = await this.supabase
      .from('readings')
      .insert({
        user_id: reading.userId,
        question: reading.question || null,
        intention_vector: reading.intentionVector || null,
        deck_system: reading.deckSystem,
        tradition: reading.tradition,
        spread_type: reading.spreadType,
        spread_name: reading.spreadName || null,
        shuffle_method: reading.shuffleMethod,
        pull_method: reading.pullMethod,
        input_mode: reading.inputMode,
        interpretation_tone: reading.interpretationTone,
        field_snapshot: reading.fieldSnapshot,
        entropy_metadata: reading.entropyMetadata,
        is_charged: reading.isCharged,
        narrative: reading.narrative || null,
        composition_tier: reading.compositionTier,
      })
      .select()
      .single();

    if (readingError) throw readingError;

    // Insert drawn cards
    const cardRows = reading.drawnCards.map(dc => ({
      reading_id: readingData.id,
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
    }));

    const { data: cardsData, error: cardsError } = await this.supabase
      .from('reading_cards')
      .insert(cardRows)
      .select();

    if (cardsError) throw cardsError;

    return { reading: readingData, cards: cardsData };
  }

  async getReadings(userId: string, limit: number = 50): Promise<ReadingRow[]> {
    const { data, error } = await this.supabase.rpc('get_readings_gated', {
      p_user_id: userId,
      p_limit: limit,
    });
    if (error) throw error;
    return data || [];
  }

  async getReadingWithCards(readingId: string): Promise<{ reading: ReadingRow; cards: ReadingCardRow[] } | null> {
    const { data: reading, error: rErr } = await this.supabase
      .from('readings')
      .select('*')
      .eq('id', readingId)
      .single();
    if (rErr) return null;

    const { data: cards, error: cErr } = await this.supabase
      .from('reading_cards')
      .select('*')
      .eq('reading_id', readingId)
      .order('position_index');
    if (cErr) throw cErr;

    return { reading, cards: cards || [] };
  }

  async updateOutcome(readingId: string, notes: string): Promise<void> {
    const { error } = await this.supabase
      .from('readings')
      .update({ outcome_notes: notes, outcome_logged_at: new Date().toISOString() })
      .eq('id', readingId);
    if (error) throw error;
  }

  async rateReading(readingId: string, rating: number): Promise<void> {
    const { error } = await this.supabase
      .from('readings')
      .update({ rating })
      .eq('id', readingId);
    if (error) throw error;
  }

  // ── Journal ─────────────────────────────────────────────────────────────

  async getJournalEntries(userId: string, limit: number = 20): Promise<JournalEntryRow[]> {
    const { data, error } = await this.supabase
      .from('user_journal')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async addJournalEntry(userId: string, content: string, tags: string[] = [], pinned: boolean = false): Promise<JournalEntryRow> {
    const { data, error } = await this.supabase
      .from('user_journal')
      .insert({ user_id: userId, content, tags, pinned })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async toggleJournalPin(entryId: string, pinned: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('user_journal')
      .update({ pinned })
      .eq('id', entryId);
    if (error) throw error;
  }

  async deleteJournalEntry(entryId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_journal')
      .delete()
      .eq('id', entryId);
    if (error) throw error;
  }

  // ── Pattern Detection ───────────────────────────────────────────────────

  async getCardFrequencies(userId: string, sinceDays: number = 30) {
    const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
    const { data, error } = await this.supabase.rpc('get_card_frequencies', {
      p_user_id: userId,
      p_since: since,
    });
    if (error) throw error;
    return data || [];
  }

  async getSuitDistribution(userId: string, sinceDays: number = 30) {
    const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
    const { data, error } = await this.supabase.rpc('get_suit_distribution', {
      p_user_id: userId,
      p_since: since,
    });
    if (error) throw error;
    return data || [];
  }

  async getCardHistory(userId: string, cardId: string, limit: number = 10) {
    const { data, error } = await this.supabase.rpc('get_card_history', {
      p_user_id: userId,
      p_card_id: cardId,
      p_limit: limit,
    });
    if (error) throw error;
    return data || [];
  }

  async getUnseenPatterns(userId: string): Promise<PatternRow[]> {
    const { data, error } = await this.supabase
      .from('reading_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('surfaced', false)
      .eq('dismissed', false)
      .order('significance_score', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async markPatternSeen(patternId: string): Promise<void> {
    const { error } = await this.supabase
      .from('reading_patterns')
      .update({ surfaced: true })
      .eq('id', patternId);
    if (error) throw error;
  }

  async dismissPattern(patternId: string): Promise<void> {
    const { error } = await this.supabase
      .from('reading_patterns')
      .update({ dismissed: true })
      .eq('id', patternId);
    if (error) throw error;
  }
}
