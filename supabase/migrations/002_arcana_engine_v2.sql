-- ============================================================================
-- DRIFTFIELD — MIGRATION 002: ARCANA ENGINE
-- Extends 001_initial_schema.sql (profiles, probes, events, decisions,
-- field_readings, analytics) with the unified reading pipeline.
-- ============================================================================
-- Dependencies:
--   profiles(id, subscription_tier) from 001
--   auth.uid() from Supabase Auth
-- ============================================================================

-- ============================================================================
-- 1. USER CONTEXT — Persists across readings
-- ============================================================================

CREATE TABLE user_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Birth data (user input)
  birth_date DATE,
  birth_time TIME,                          -- optional; needed for rising sign + houses
  birth_place TEXT,                          -- city, country string
  birth_latitude DOUBLE PRECISION,          -- resolved via geocoding API
  birth_longitude DOUBLE PRECISION,
  birth_timezone TEXT,                       -- IANA timezone (e.g. 'Europe/Vilnius')

  -- Computed chart data (circular-natal-horoscope-js output, stored as JSONB)
  sun_sign TEXT,                            -- free tier: always computed
  moon_sign TEXT,                           -- premium: requires birth_time
  rising_sign TEXT,                         -- premium: requires birth_time + location
  chart_data JSONB,                         -- full chart: planets, houses, aspects
  chart_house_system TEXT DEFAULT 'placidus',
  chart_computed_at TIMESTAMPTZ,

  -- Reading defaults
  domain_tags TEXT[] DEFAULT '{}',
  default_deck TEXT DEFAULT 'rws',
  default_tradition TEXT DEFAULT 'standard',
  default_spread TEXT DEFAULT 'three_card_ppf',
  default_shuffle TEXT DEFAULT 'riffle',
  default_pull TEXT DEFAULT 'top',
  default_tone TEXT DEFAULT 'practical',
  reversals_enabled BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT uq_user_context_user UNIQUE (user_id)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_context_updated
  BEFORE UPDATE ON user_context
  FOR EACH ROW EXECUTE FUNCTION update_user_context_timestamp();


-- ============================================================================
-- 2. USER JOURNAL — Premium, 90-day rolling window
-- ============================================================================

CREATE TABLE user_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journal_user_created ON user_journal (user_id, created_at DESC);
CREATE INDEX idx_journal_pinned ON user_journal (user_id) WHERE pinned = true;


-- ============================================================================
-- 3. READINGS — Core reading records
-- ============================================================================

CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- User input
  question TEXT,
  intention_vector JSONB,

  -- Settings
  deck_system TEXT NOT NULL DEFAULT 'rws',
  tradition TEXT NOT NULL DEFAULT 'standard',
  spread_type TEXT NOT NULL,
  spread_name TEXT,
  shuffle_method TEXT DEFAULT 'riffle',
  pull_method TEXT DEFAULT 'top',
  input_mode TEXT NOT NULL DEFAULT 'virtual',
  interpretation_tone TEXT DEFAULT 'practical',

  -- Entropy (Stage 2)
  field_snapshot JSONB,
  entropy_metadata JSONB,
  is_charged BOOLEAN DEFAULT false,

  -- Output (Stage 6)
  narrative TEXT,
  composition_tier TEXT DEFAULT 'template',

  -- Follow-up
  outcome_notes TEXT,
  outcome_logged_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_readings_user_created ON readings (user_id, created_at DESC);
CREATE INDEX idx_readings_user_deck ON readings (user_id, deck_system);
CREATE INDEX idx_readings_charged ON readings (user_id) WHERE is_charged = true;


-- ============================================================================
-- 4. READING CARDS — Cards drawn per reading
-- ============================================================================

CREATE TABLE reading_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  position_index INTEGER NOT NULL,
  position_name TEXT NOT NULL,
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,
  orientation TEXT NOT NULL DEFAULT 'upright',
  is_jumper BOOLEAN DEFAULT false,
  is_bottom_card BOOLEAN DEFAULT false,
  is_significator BOOLEAN DEFAULT false,
  draw_entropy FLOAT,
  ml_confidence FLOAT,
  user_corrected BOOLEAN DEFAULT false,
  resolved_interpretation JSONB
);

CREATE INDEX idx_rcards_reading ON reading_cards (reading_id);
CREATE INDEX idx_rcards_card ON reading_cards (card_id);


-- ============================================================================
-- 5. READING PATTERNS — Cross-reading detection (Premium)
-- ============================================================================

CREATE TABLE reading_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  significance_score FLOAT NOT NULL,
  readings_involved UUID[],
  description TEXT,
  surfaced BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_patterns_user ON reading_patterns (user_id, detected_at DESC);
CREATE INDEX idx_patterns_unseen ON reading_patterns (user_id) WHERE surfaced = false AND dismissed = false;


-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_patterns ENABLE ROW LEVEL SECURITY;

-- user_context
CREATE POLICY "ctx_select" ON user_context FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ctx_insert" ON user_context FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ctx_update" ON user_context FOR UPDATE USING (user_id = auth.uid());

-- user_journal
CREATE POLICY "journal_select" ON user_journal FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "journal_insert" ON user_journal FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "journal_update" ON user_journal FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "journal_delete" ON user_journal FOR DELETE USING (user_id = auth.uid());

-- readings
CREATE POLICY "readings_select" ON readings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "readings_insert" ON readings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "readings_update" ON readings FOR UPDATE USING (user_id = auth.uid());

-- reading_cards (join through parent reading)
CREATE POLICY "rcards_select" ON reading_cards FOR SELECT USING (
  EXISTS (SELECT 1 FROM readings r WHERE r.id = reading_cards.reading_id AND r.user_id = auth.uid())
);
CREATE POLICY "rcards_insert" ON reading_cards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM readings r WHERE r.id = reading_cards.reading_id AND r.user_id = auth.uid())
);

-- reading_patterns
CREATE POLICY "patterns_select" ON reading_patterns FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "patterns_update" ON reading_patterns FOR UPDATE USING (user_id = auth.uid());


-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Check reading limit (free: 1/day)
CREATE OR REPLACE FUNCTION check_reading_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_tier TEXT; v_count INTEGER;
BEGIN
  SELECT subscription_tier INTO v_tier FROM profiles WHERE id = p_user_id;
  IF v_tier = 'premium' THEN RETURN true; END IF;
  SELECT COUNT(*) INTO v_count FROM readings
    WHERE user_id = p_user_id AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day';
  RETURN v_count < 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check camera limit (free: 1 scan/day)
CREATE OR REPLACE FUNCTION check_camera_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_tier TEXT; v_count INTEGER;
BEGIN
  SELECT subscription_tier INTO v_tier FROM profiles WHERE id = p_user_id;
  IF v_tier = 'premium' THEN RETURN true; END IF;
  SELECT COUNT(*) INTO v_count FROM readings
    WHERE user_id = p_user_id AND input_mode = 'camera'
    AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day';
  RETURN v_count < 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gated reading history (free: 7 days, premium: all)
CREATE OR REPLACE FUNCTION get_readings_gated(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS SETOF readings AS $$
DECLARE v_tier TEXT;
BEGIN
  SELECT subscription_tier INTO v_tier FROM profiles WHERE id = p_user_id;
  IF v_tier = 'premium' THEN
    RETURN QUERY SELECT * FROM readings WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT p_limit;
  ELSE
    RETURN QUERY SELECT * FROM readings WHERE user_id = p_user_id
      AND created_at >= now() - INTERVAL '7 days' ORDER BY created_at DESC LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Card frequency for pattern detection
CREATE OR REPLACE FUNCTION get_card_frequencies(p_user_id UUID, p_since TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days')
RETURNS TABLE(card_id TEXT, card_name TEXT, frequency BIGINT, total_readings BIGINT) AS $$
BEGIN
  RETURN QUERY
    SELECT rc.card_id, rc.card_name, COUNT(*)::BIGINT AS frequency,
      (SELECT COUNT(DISTINCT r2.id)::BIGINT FROM readings r2
       WHERE r2.user_id = p_user_id AND r2.created_at >= p_since) AS total_readings
    FROM reading_cards rc JOIN readings r ON r.id = rc.reading_id
    WHERE r.user_id = p_user_id AND r.created_at >= p_since
      AND rc.is_jumper = false AND rc.is_bottom_card = false
    GROUP BY rc.card_id, rc.card_name ORDER BY frequency DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suit distribution
CREATE OR REPLACE FUNCTION get_suit_distribution(p_user_id UUID, p_since TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days')
RETURNS TABLE(suit TEXT, count BIGINT, percentage NUMERIC) AS $$
BEGIN
  RETURN QUERY
    WITH card_suits AS (
      SELECT CASE
        WHEN rc.card_id LIKE 'major-%' THEN 'major'
        WHEN rc.card_id LIKE '%wands%' THEN 'wands'
        WHEN rc.card_id LIKE '%cups%' THEN 'cups'
        WHEN rc.card_id LIKE '%swords%' THEN 'swords'
        WHEN rc.card_id LIKE '%pentacles%' THEN 'pentacles'
        ELSE 'unknown' END AS suit
      FROM reading_cards rc JOIN readings r ON r.id = rc.reading_id
      WHERE r.user_id = p_user_id AND r.created_at >= p_since
        AND rc.is_jumper = false AND rc.is_bottom_card = false
    ), total AS (SELECT COUNT(*)::NUMERIC AS n FROM card_suits)
    SELECT cs.suit, COUNT(*)::BIGINT, ROUND(COUNT(*)::NUMERIC / NULLIF(t.n, 0) * 100, 1)
    FROM card_suits cs, total t GROUP BY cs.suit, t.n ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Card history (where a specific card appeared)
CREATE OR REPLACE FUNCTION get_card_history(p_user_id UUID, p_card_id TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(reading_id UUID, reading_date TIMESTAMPTZ, position_name TEXT, orientation TEXT, question TEXT, spread_type TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT r.id, r.created_at, rc.position_name, rc.orientation, r.question, r.spread_type
    FROM reading_cards rc JOIN readings r ON r.id = rc.reading_id
    WHERE r.user_id = p_user_id AND rc.card_id = p_card_id
    ORDER BY r.created_at DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 8. TIER ENFORCEMENT TRIGGERS
-- ============================================================================

-- Enforce birth chart tier restrictions
CREATE OR REPLACE FUNCTION enforce_chart_tier()
RETURNS TRIGGER AS $$
DECLARE v_tier TEXT;
BEGIN
  SELECT subscription_tier INTO v_tier FROM profiles WHERE id = NEW.user_id;
  IF v_tier != 'premium' THEN
    NEW.moon_sign := NULL;
    NEW.rising_sign := NULL;
    NEW.chart_data := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_chart_tier
  BEFORE INSERT OR UPDATE ON user_context
  FOR EACH ROW EXECUTE FUNCTION enforce_chart_tier();

-- Validate domain tags (max 2 for free, 8 for premium)
CREATE OR REPLACE FUNCTION validate_domain_tags()
RETURNS TRIGGER AS $$
DECLARE
  valid_tags TEXT[] := ARRAY['love','career','spiritual','health','creative','family','financial','self'];
  tag TEXT; v_tier TEXT; max_tags INTEGER;
BEGIN
  FOREACH tag IN ARRAY COALESCE(NEW.domain_tags, '{}') LOOP
    IF NOT (tag = ANY(valid_tags)) THEN
      RAISE EXCEPTION 'Invalid domain tag: %', tag;
    END IF;
  END LOOP;
  SELECT subscription_tier INTO v_tier FROM profiles WHERE id = NEW.user_id;
  max_tags := CASE WHEN v_tier = 'premium' THEN 8 ELSE 2 END;
  IF COALESCE(array_length(NEW.domain_tags, 1), 0) > max_tags THEN
    RAISE EXCEPTION 'Free tier: max % domain tags', max_tags;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_domain_tags
  BEFORE INSERT OR UPDATE ON user_context
  FOR EACH ROW EXECUTE FUNCTION validate_domain_tags();


-- ============================================================================
-- 9. CLEANUP FUNCTIONS (called by scheduled cron Edge Functions)
-- ============================================================================

-- Journal: remove non-pinned entries > 90 days
CREATE OR REPLACE FUNCTION cleanup_expired_journal()
RETURNS INTEGER AS $$
DECLARE v_deleted INTEGER;
BEGIN
  DELETE FROM user_journal WHERE pinned = false AND created_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  -- Also remove any journal entries for non-premium users (shouldn't exist, safety net)
  DELETE FROM user_journal WHERE user_id IN (
    SELECT id FROM profiles WHERE subscription_tier != 'premium'
  );
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Readings: hard delete free tier readings > 30 days
CREATE OR REPLACE FUNCTION cleanup_expired_readings()
RETURNS INTEGER AS $$
DECLARE v_deleted INTEGER;
BEGIN
  DELETE FROM readings WHERE user_id IN (
    SELECT id FROM profiles WHERE subscription_tier != 'premium'
  ) AND created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Patterns: remove dismissed patterns > 30 days
CREATE OR REPLACE FUNCTION cleanup_dismissed_patterns()
RETURNS INTEGER AS $$
DECLARE v_deleted INTEGER;
BEGIN
  DELETE FROM reading_patterns WHERE dismissed = true AND detected_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 10. ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_rcards_card_reading ON reading_cards (card_id) INCLUDE (reading_id);
CREATE INDEX idx_readings_user_spread ON readings (user_id, spread_type, created_at DESC);


-- ============================================================================
-- 11. COMMENTS
-- ============================================================================

COMMENT ON TABLE user_context IS 'Per-user preferences and birth chart cache. Chart computed client-side (circular-natal-horoscope-js), stored as JSONB. One row per user.';
COMMENT ON TABLE user_journal IS 'Premium journal. 90-day rolling window for non-pinned entries.';
COMMENT ON TABLE readings IS 'Core reading records. Full pipeline output: question → intention → entropy → cards → narrative.';
COMMENT ON TABLE reading_cards IS 'Per-card data within a reading. Includes position, orientation, entropy, and cached interpretation.';
COMMENT ON TABLE reading_patterns IS 'Premium pattern detection. Populated by background analysis after each reading.';
COMMENT ON COLUMN user_context.chart_data IS '{ planets: [{name,sign,degree,house,retrograde}], houses: [{number,sign,degree}], aspects: [{planet1,planet2,type,orb}] }';
COMMENT ON COLUMN readings.intention_vector IS '{ domain, emotionalTone, specificity(0-1), temporalFocus, implicitQuestions[], relationalFrame }';
COMMENT ON COLUMN readings.field_snapshot IS '{ polarity(-1..1), anomalySigma, bearing(0-359), bearingElement, isCharged }';
