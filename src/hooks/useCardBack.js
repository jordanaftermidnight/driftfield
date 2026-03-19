import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { buildCardBackPrompt } from '../lib/cardBackPrompt';

const STORAGE_KEY = 'df_df_card_back';
const COOLDOWN_DAYS = 30;

/**
 * Manages the user's personalized AI card back.
 *
 * Fallback chain:
 *   1. AI-generated card back from Supabase Storage (premium)
 *   2. GenerativeCardBack canvas component (entropy-seeded)
 *   3. Static /cards/card-back.png
 *
 * Returns:
 *   - cardBackUrl:   string | null  (AI-generated URL if available)
 *   - isGenerating:  boolean
 *   - canGenerate:   boolean (premium + cooldown expired)
 *   - cooldownDays:  number  (days remaining, 0 if ready)
 *   - generateCardBack(opts): async function
 *   - error:         string | null
 */
export function useCardBack() {
  const { session, isPremium, profile } = useAuth();

  const [cardBackUrl, setCardBackUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Load cached URL from localStorage on mount
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (cached?.url) {
        setCardBackUrl(cached.url);
      }
    } catch {}
  }, []);

  // Cooldown calculation
  const generatedAt = profile?.card_back_generated_at;
  let cooldownDays = 0;
  if (generatedAt) {
    const lastGen = new Date(generatedAt);
    const cooldownEnd = new Date(lastGen.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    const remaining = cooldownEnd - new Date();
    cooldownDays = remaining > 0 ? Math.ceil(remaining / (24 * 60 * 60 * 1000)) : 0;
  }

  const canGenerate = !!isPremium && cooldownDays === 0;

  const generateCardBack = useCallback(async (opts = {}) => {
    if (!canGenerate || !session?.access_token) return;

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = buildCardBackPrompt(opts);

      const res = await fetch('/api/generate-card-back', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.url) {
        setCardBackUrl(data.url);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          url: data.url,
          generatedAt: data.generatedAt,
        }));
      }
    } catch (e) {
      console.error('Card back generation error:', e);
      setError(e.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, session?.access_token]);

  return {
    cardBackUrl,
    isGenerating,
    canGenerate,
    cooldownDays,
    generateCardBack,
    error,
  };
}
