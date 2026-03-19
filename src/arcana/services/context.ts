// ============================================================================
// DRIFTFIELD — USER CONTEXT SERVICE
// Manages birth chart, domain tags, reading profile, and journal entries
// ============================================================================

import { supabase } from './supabase';

// ─── User Context (birth chart, domain tags, reading profile) ─────────────────

export interface UserContext {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  planetaryPlacements?: Record<string, any>;
  domainTags: string[];
  readingProfile: ReadingProfile;
}

export interface ReadingProfile {
  deckSystem: string;
  tradition: string;
  preferredSpread: string;
  shuffleMethod: string;
  shufflePasses: number;
  pullMethod: string;
  readJumperCards: boolean;
  readBottomCard: boolean;
  useSignificator: boolean;
  reversalSystem: string;
  interpretationTone: string;
  showCorrespondences: boolean;
  showEntropyMetadata: boolean;
}

const DEFAULT_READING_PROFILE: ReadingProfile = {
  deckSystem: 'rws',
  tradition: 'standard',
  preferredSpread: 'three_card_ppf',
  shuffleMethod: 'riffle',
  shufflePasses: 7,
  pullMethod: 'top',
  readJumperCards: false,
  readBottomCard: false,
  useSignificator: false,
  reversalSystem: 'standard',
  interpretationTone: 'practical',
  showCorrespondences: false,
  showEntropyMetadata: true
};

// ─── Load user context ────────────────────────────────────────────────────────

export async function loadUserContext(): Promise<UserContext | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_context')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // No context exists yet — create default
    return await createDefaultContext(user.id);
  }

  if (error || !data) return null;

  return mapDbToContext(data);
}

// ─── Create default context for new user ──────────────────────────────────────

async function createDefaultContext(userId: string): Promise<UserContext | null> {
  const { data, error } = await supabase
    .from('user_context')
    .insert({
      user_id: userId,
      domain_tags: [],
      reading_profile: profileToDb(DEFAULT_READING_PROFILE)
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapDbToContext(data);
}

// ─── Update birth chart ───────────────────────────────────────────────────────

export async function updateBirthChart(params: {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  planetaryPlacements?: Record<string, any>;
}): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const update: Record<string, any> = {};
  if (params.birthDate !== undefined) update.birth_date = params.birthDate;
  if (params.birthTime !== undefined) update.birth_time = params.birthTime;
  if (params.birthPlace !== undefined) update.birth_place = params.birthPlace;
  if (params.sunSign !== undefined) update.sun_sign = params.sunSign;
  if (params.moonSign !== undefined) update.moon_sign = params.moonSign;
  if (params.risingSign !== undefined) update.rising_sign = params.risingSign;
  if (params.planetaryPlacements !== undefined) update.planetary_placements = params.planetaryPlacements;

  const { error } = await supabase
    .from('user_context')
    .update(update)
    .eq('user_id', user.id);

  return !error;
}

// ─── Update domain tags ───────────────────────────────────────────────────────

export async function updateDomainTags(tags: string[]): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('user_context')
    .update({ domain_tags: tags })
    .eq('user_id', user.id);

  return !error;
}

// ─── Update reading profile ──────────────────────────────────────────────────

export async function updateReadingProfile(profile: Partial<ReadingProfile>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Merge with existing profile
  const existing = await loadUserContext();
  if (!existing) return false;

  const merged = { ...existing.readingProfile, ...profile };

  const { error } = await supabase
    .from('user_context')
    .update({ reading_profile: profileToDb(merged) })
    .eq('user_id', user.id);

  return !error;
}

// ─── Journal entries ──────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

export async function addJournalEntry(content: string): Promise<JournalEntry | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_journal')
    .insert({ user_id: user.id, content })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    content: data.content,
    pinned: data.pinned,
    createdAt: data.created_at
  };
}

export async function listJournalEntries(limit: number = 50): Promise<JournalEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_journal')
    .select('id, content, pinned, created_at')
    .eq('user_id', user.id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    content: d.content,
    pinned: d.pinned,
    createdAt: d.created_at
  }));
}

export async function toggleJournalPin(entryId: string, pinned: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('user_journal')
    .update({ pinned })
    .eq('id', entryId);

  return !error;
}

export async function deleteJournalEntry(entryId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_journal')
    .delete()
    .eq('id', entryId);

  return !error;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDbToContext(data: any): UserContext {
  const rp = data.reading_profile || {};
  return {
    birthDate: data.birth_date,
    birthTime: data.birth_time,
    birthPlace: data.birth_place,
    sunSign: data.sun_sign,
    moonSign: data.moon_sign,
    risingSign: data.rising_sign,
    planetaryPlacements: data.planetary_placements,
    domainTags: data.domain_tags || [],
    readingProfile: {
      deckSystem: rp.deck_system || 'rws',
      tradition: rp.tradition || 'standard',
      preferredSpread: rp.preferred_spread || 'three_card_ppf',
      shuffleMethod: rp.shuffle_method || 'riffle',
      shufflePasses: rp.shuffle_passes || 7,
      pullMethod: rp.pull_method || 'top',
      readJumperCards: rp.read_jumper_cards || false,
      readBottomCard: rp.read_bottom_card || false,
      useSignificator: rp.use_significator || false,
      reversalSystem: rp.reversal_system || 'standard',
      interpretationTone: rp.interpretation_tone || 'practical',
      showCorrespondences: rp.show_correspondences || false,
      showEntropyMetadata: rp.show_entropy_metadata !== false
    }
  };
}

function profileToDb(profile: ReadingProfile): Record<string, any> {
  return {
    deck_system: profile.deckSystem,
    tradition: profile.tradition,
    preferred_spread: profile.preferredSpread,
    shuffle_method: profile.shuffleMethod,
    shuffle_passes: profile.shufflePasses,
    pull_method: profile.pullMethod,
    read_jumper_cards: profile.readJumperCards,
    read_bottom_card: profile.readBottomCard,
    use_significator: profile.useSignificator,
    reversal_system: profile.reversalSystem,
    interpretation_tone: profile.interpretationTone,
    show_correspondences: profile.showCorrespondences,
    show_entropy_metadata: profile.showEntropyMetadata
  };
}
