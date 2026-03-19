-- ============================================================
-- DRIFTFIELD: Guard subscription columns from client-side updates
-- ============================================================
-- The "Users can update own profile" RLS policy allows users to
-- update their own row — but doesn't restrict WHICH columns.
-- A user could set subscription_tier = 'premium' directly from
-- the browser console without paying.
--
-- Fix: a BEFORE UPDATE trigger that silently preserves
-- subscription columns when the connection is not service_role.
-- Only the webhook handler (via SUPABASE_SERVICE_ROLE_KEY) can
-- modify these fields.
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_subscription_columns()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Only service_role (server-side API) can modify protected fields
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    -- Subscription fields (payment-gated)
    NEW.subscription_tier := OLD.subscription_tier;
    NEW.subscription_status := OLD.subscription_status;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.stripe_subscription_id := OLD.stripe_subscription_id;
    NEW.subscription_expires_at := OLD.subscription_expires_at;
    -- Cooldown timestamps (API-managed)
    NEW.card_back_generated_at := OLD.card_back_generated_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_subscription_fields ON public.profiles;
CREATE TRIGGER guard_subscription_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_subscription_columns();
