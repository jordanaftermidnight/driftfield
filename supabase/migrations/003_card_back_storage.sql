-- ============================================================
-- DRIFTFIELD: Migration 003 — Card Back Storage
-- ============================================================
-- Adds:
--   1. card_back_generated_at column on profiles (cooldown tracking)
--   2. card-backs storage bucket (public read, auth write)
--   3. RLS policies for storage
-- ============================================================

-- 1. Add cooldown timestamp to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS card_back_generated_at timestamptz;

-- 2. Create storage bucket for card backs (public so URLs work without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-backs', 'card-backs', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies

-- Users can read their own card backs
CREATE POLICY "Users can read own card backs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'card-backs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read access (bucket is public, but policy still needed)
CREATE POLICY "Public card back read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-backs');

-- Service role handles uploads (from API route), but allow user deletes
CREATE POLICY "Users can delete own card backs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'card-backs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
