-- ============================================================
-- DRIFTFIELD: Fix overly permissive RLS policy
-- ============================================================
-- The original "Service role can update profiles" policy used
-- USING (true), which allows ANY authenticated user to update
-- ANY profile row — including subscription_tier. This is a
-- privilege escalation vulnerability: a user could set their
-- own tier to 'premium' without paying.
--
-- Fix: restrict the policy to the service_role only.
-- The service role is used by server-side API functions
-- (stripe-webhook.js, generate-card-back.js) via
-- SUPABASE_SERVICE_ROLE_KEY, never exposed to the client.
-- ============================================================

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Service role can update profiles" ON public.profiles;

-- Recreate with service_role restriction
-- auth.role() returns 'service_role' for service key connections,
-- 'authenticated' for normal user JWT connections, 'anon' for anon key.
CREATE POLICY "Service role can update profiles"
  ON public.profiles FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Also add a restrictive policy to prevent INSERT escalation
-- (profiles are created by the auth trigger, not by users directly)
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = id);
