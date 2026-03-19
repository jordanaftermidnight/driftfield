-- ============================================================
-- DRIFTFIELD: Server-side API rate limiting
-- ============================================================
-- Replaces the in-memory rate limiter in reading-narrative.js.
-- Vercel serverless functions are stateless — in-memory Maps
-- reset on every cold start, making them unreliable.
--
-- This table stores timestamped request records per user per
-- endpoint. A helper function counts recent requests within
-- a sliding window, and a cleanup function prunes old entries.
-- ============================================================

-- Rate limit tracking table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for fast lookups by user + endpoint + time window
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.api_rate_limits (user_id, endpoint, created_at DESC);

-- RLS: only service_role can read/write (called from API functions)
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate limits"
  ON public.api_rate_limits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Check rate limit: returns true if under limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_requests int DEFAULT 5,
  p_window_minutes int DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  request_count int;
BEGIN
  -- Count requests in the sliding window
  SELECT COUNT(*) INTO request_count
  FROM public.api_rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND created_at > now() - (p_window_minutes || ' minutes')::interval;

  -- If under limit, record the request and return true
  IF request_count < p_max_requests THEN
    INSERT INTO public.api_rate_limits (user_id, endpoint)
    VALUES (p_user_id, p_endpoint);
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Cleanup old entries (called by cron-cleanup.js)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE created_at < now() - interval '2 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
