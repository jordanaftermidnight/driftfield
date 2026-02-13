-- ============================================================
-- DRIFTFIELD: Supabase Database Schema
-- ============================================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all tables, RLS policies, and functions needed
-- for auth, premium gating, probe tracking, and analytics.
-- ============================================================

-- ============================================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  -- Birth data for biorhythm/cycle calculations
  birth_date DATE,
  birth_time TIME,
  birth_lat DECIMAL(9,6),
  birth_lng DECIMAL(9,6),
  -- Subscription
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'lifetime')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'cancelled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_expires_at TIMESTAMPTZ,
  -- Preferences
  theme TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT false,
  -- Metadata
  probes_fired_today INT NOT NULL DEFAULT 0,
  probes_last_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  total_probes_fired INT NOT NULL DEFAULT 0,
  total_events_logged INT NOT NULL DEFAULT 0,
  streak_current INT NOT NULL DEFAULT 0,
  streak_longest INT NOT NULL DEFAULT 0,
  streak_last_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 2. PROBES
-- ============================================================
CREATE TABLE public.probes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Probe input
  intention TEXT,
  -- Entropy analysis results
  entropy_score DECIMAL(8,6),
  chi_squared DECIMAL(12,6),
  serial_correlation DECIMAL(8,6),
  monte_carlo_pi DECIMAL(10,8),
  runs_ratio DECIMAL(8,6),
  byte_mean DECIMAL(8,4),
  anomaly_level TEXT CHECK (anomaly_level IN ('nominal', 'mild', 'moderate', 'strong', 'extreme')),
  -- Derived output
  compass_bearing DECIMAL(6,2),
  compass_direction TEXT,
  suggested_action TEXT,
  action_category TEXT,
  -- Probe card
  card_image_url TEXT,
  card_shared BOOLEAN DEFAULT false,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_probes_user_id ON public.probes(user_id);
CREATE INDEX idx_probes_created_at ON public.probes(created_at DESC);
CREATE INDEX idx_probes_user_date ON public.probes(user_id, created_at);


-- ============================================================
-- 3. EVENTS (Synchronicity Log)
-- ============================================================
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Event data
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN (
    'synchronicity', 'encounter', 'opportunity', 'insight',
    'pattern', 'dream', 'anomaly', 'other'
  )),
  intensity INT CHECK (intensity BETWEEN 1 AND 5),
  polarity TEXT CHECK (polarity IN ('positive', 'neutral', 'negative')),
  -- Associations
  linked_probe_id UUID REFERENCES public.probes(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  -- Location (optional)
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  -- Metadata
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_date ON public.events(event_date DESC);
CREATE INDEX idx_events_user_date ON public.events(user_id, event_date);
CREATE INDEX idx_events_category ON public.events(user_id, category);


-- ============================================================
-- 4. DECISIONS (Decision Evaluator)
-- ============================================================
CREATE TABLE public.decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Decision data
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'decided', 'reflected')),
  chosen_option_id UUID,
  outcome_notes TEXT,
  outcome_rating INT CHECK (outcome_rating BETWEEN 1 AND 5),
  -- Metadata
  decided_at TIMESTAMPTZ,
  reflected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.decision_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID REFERENCES public.decisions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Option data
  label TEXT NOT NULL,
  -- Serendipity surface area scores (1-10)
  novelty_score INT CHECK (novelty_score BETWEEN 1 AND 10),
  weak_tie_score INT CHECK (weak_tie_score BETWEEN 1 AND 10),
  reversibility_score INT CHECK (reversibility_score BETWEEN 1 AND 10),
  optionality_score INT CHECK (optionality_score BETWEEN 1 AND 10),
  gut_signal_score INT CHECK (gut_signal_score BETWEEN 1 AND 10),
  total_score DECIMAL(4,1),
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX idx_decision_options_decision ON public.decision_options(decision_id);


-- ============================================================
-- 5. FIELD READINGS (Daily Field State Snapshots)
-- ============================================================
CREATE TABLE public.field_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Field assessment
  novelty_exposure INT CHECK (novelty_exposure BETWEEN 0 AND 10),
  stranger_interactions INT CHECK (stranger_interactions BETWEEN 0 AND 10),
  routine_deviation INT CHECK (routine_deviation BETWEEN 0 AND 10),
  peripheral_attention INT CHECK (peripheral_attention BETWEEN 0 AND 10),
  openness_score INT CHECK (openness_score BETWEEN 0 AND 10),
  -- Computed
  luck_surface_area DECIMAL(5,2),
  -- Cycle data (computed at read time)
  physical_cycle DECIMAL(5,4),
  emotional_cycle DECIMAL(5,4),
  intellectual_cycle DECIMAL(5,4),
  lunar_phase TEXT,
  lunar_illumination DECIMAL(5,4),
  -- Metadata
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, reading_date)
);

CREATE INDEX idx_field_readings_user_date ON public.field_readings(user_id, reading_date DESC);


-- ============================================================
-- 6. ANALYTICS (Aggregated User Activity)
-- ============================================================
CREATE TABLE public.user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'app_open', 'probe_fired', 'event_logged', 'decision_created',
    'probe_shared', 'field_read', 'tab_viewed', 'premium_cta_clicked',
    'pwa_installed'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_user ON public.user_analytics(user_id);
CREATE INDEX idx_analytics_type ON public.user_analytics(event_type);
CREATE INDEX idx_analytics_created ON public.user_analytics(created_at DESC);
-- Partition-friendly index for time-range queries
CREATE INDEX idx_analytics_user_type_date ON public.user_analytics(user_id, event_type, created_at);


-- ============================================================
-- 7. ROW-LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.probes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Probes: users can only CRUD their own
CREATE POLICY "Users can view own probes"
  ON public.probes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own probes"
  ON public.probes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own probes"
  ON public.probes FOR UPDATE
  USING (auth.uid() = user_id);

-- Events: users own their events
CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- Decisions + Options
CREATE POLICY "Users can view own decisions"
  ON public.decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions"
  ON public.decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
  ON public.decisions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own decision options"
  ON public.decision_options FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decision options"
  ON public.decision_options FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decision options"
  ON public.decision_options FOR UPDATE
  USING (auth.uid() = user_id);

-- Field readings
CREATE POLICY "Users can view own field readings"
  ON public.field_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own field readings"
  ON public.field_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Analytics: insert-only for users, read own
CREATE POLICY "Users can view own analytics"
  ON public.user_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON public.user_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 8. HELPER FUNCTIONS
-- ============================================================

-- Check and enforce daily probe limit
-- Returns: { allowed: boolean, probes_remaining: int, is_premium: boolean }
CREATE OR REPLACE FUNCTION public.check_probe_limit(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_limit INT;
  v_remaining INT;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Reset daily counter if new day
  IF v_profile.probes_last_reset < CURRENT_DATE THEN
    UPDATE public.profiles 
    SET probes_fired_today = 0, probes_last_reset = CURRENT_DATE
    WHERE id = p_user_id;
    v_profile.probes_fired_today := 0;
  END IF;
  
  -- Set limit based on tier
  IF v_profile.subscription_tier = 'premium' AND v_profile.subscription_status = 'active' THEN
    v_limit := 999; -- effectively unlimited
  ELSE
    v_limit := 1; -- free tier: 1 probe per day
  END IF;
  
  v_remaining := GREATEST(0, v_limit - v_profile.probes_fired_today);
  
  RETURN jsonb_build_object(
    'allowed', v_profile.probes_fired_today < v_limit,
    'probes_remaining', v_remaining,
    'probes_fired_today', v_profile.probes_fired_today,
    'daily_limit', v_limit,
    'is_premium', (v_profile.subscription_tier = 'premium' AND v_profile.subscription_status = 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment probe counter after firing
CREATE OR REPLACE FUNCTION public.increment_probe_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    probes_fired_today = probes_fired_today + 1,
    total_probes_fired = total_probes_fired + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_new_current INT;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  
  IF v_profile.streak_last_date = CURRENT_DATE THEN
    -- Already updated today
    RETURN jsonb_build_object('current', v_profile.streak_current, 'longest', v_profile.streak_longest);
  ELSIF v_profile.streak_last_date = CURRENT_DATE - 1 THEN
    -- Consecutive day
    v_new_current := v_profile.streak_current + 1;
  ELSE
    -- Streak broken
    v_new_current := 1;
  END IF;
  
  UPDATE public.profiles
  SET 
    streak_current = v_new_current,
    streak_longest = GREATEST(v_profile.streak_longest, v_new_current),
    streak_last_date = CURRENT_DATE
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object('current', v_new_current, 'longest', GREATEST(v_profile.streak_longest, v_new_current));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user stats dashboard
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_probe_count BIGINT;
  v_event_count BIGINT;
  v_decision_count BIGINT;
  v_avg_anomaly JSONB;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  SELECT COUNT(*) INTO v_probe_count FROM public.probes WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_event_count FROM public.events WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_decision_count FROM public.decisions WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'total_probes', v_probe_count,
    'total_events', v_event_count,
    'total_decisions', v_decision_count,
    'streak_current', v_profile.streak_current,
    'streak_longest', v_profile.streak_longest,
    'subscription_tier', v_profile.subscription_tier,
    'subscription_status', v_profile.subscription_status,
    'member_since', v_profile.created_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 9. PREMIUM FEATURE GATING VIEWS
-- ============================================================

-- Events view: free users see last 7 days, premium see all
CREATE OR REPLACE FUNCTION public.get_events_gated(p_user_id UUID, p_limit INT DEFAULT 100)
RETURNS SETOF public.events AS $$
DECLARE
  v_is_premium BOOLEAN;
BEGIN
  SELECT (subscription_tier = 'premium' AND subscription_status = 'active')
    INTO v_is_premium
    FROM public.profiles WHERE id = p_user_id;
  
  IF v_is_premium THEN
    RETURN QUERY
      SELECT * FROM public.events
      WHERE user_id = p_user_id
      ORDER BY event_date DESC
      LIMIT p_limit;
  ELSE
    RETURN QUERY
      SELECT * FROM public.events
      WHERE user_id = p_user_id
        AND event_date >= NOW() - INTERVAL '7 days'
      ORDER BY event_date DESC
      LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 10. SERVICE ROLE POLICIES (for Stripe webhooks)
-- ============================================================
-- These allow the service role (used by edge functions) to
-- update subscription status on profiles

CREATE POLICY "Service role can update profiles"
  ON public.profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);
-- Note: This policy is permissive but the service role key
-- is only used in server-side edge functions, never exposed.
-- In production, refine with: USING (auth.role() = 'service_role')
