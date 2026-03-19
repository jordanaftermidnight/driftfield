import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getFeatureLimits } from "../lib/premium";
import { trackArcanaReading, trackArcanaCompleted, trackArcanaSaved } from "../lib/analytics";

/**
 * Reading flow state machine:
 *   idle -> questioning -> configuring -> drawing -> reading -> saved
 *
 * This hook wraps the Arcana engine pipeline and manages the full
 * reading lifecycle in React state.
 */

const FACTORY_DEFAULTS = {
  deckSystem: 'rws',
  tradition: 'hermetic',
  spreadId: 'single_card',
  shuffleMethod: 'riffle',
  pullMethod: 'top',
  inputMode: 'virtual',
  tone: 'practical',
  readJumpers: false,
  readBottomCard: false,
  reversalsEnabled: true,
};

function loadDefaults() {
  try {
    const saved = JSON.parse(localStorage.getItem('df_df_reading_defaults') || 'null');
    return saved ? { ...FACTORY_DEFAULTS, ...saved } : FACTORY_DEFAULTS;
  } catch { return FACTORY_DEFAULTS; }
}

const DEFAULT_SETTINGS = loadDefaults();

// ── Client-side pattern detection from localStorage readings ──────────────

function detectLocalPatterns(currentCards) {
  try {
    const readings = JSON.parse(localStorage.getItem('df_df_readings') || '[]');
    if (readings.length < 3) return [];

    const patterns = [];
    const last20 = readings.slice(-20);
    const cardCounts = {};
    const suitCounts = {};
    let totalCards = 0;

    for (const r of last20) {
      for (const c of (r.cards || [])) {
        cardCounts[c.name] = (cardCounts[c.name] || 0) + 1;
        totalCards++;
        // Extract suit from name
        const suitMatch = c.name.match(/of (Wands|Cups|Swords|Pentacles)/i);
        if (suitMatch) {
          const suit = suitMatch[1].toLowerCase();
          suitCounts[suit] = (suitCounts[suit] || 0) + 1;
        } else {
          suitCounts['major'] = (suitCounts['major'] || 0) + 1;
        }
      }
    }

    // Card recurrence
    for (const [name, count] of Object.entries(cardCounts)) {
      const expected = (last20.length * 3) / 78; // rough expected frequency
      if (count >= 3 && count > expected * 2.5) {
        patterns.push(`${name} has appeared in ${count} of your last ${last20.length} readings. This card is trying to get your attention.`);
      }
    }

    // Suit dominance
    if (totalCards > 0) {
      for (const [suit, count] of Object.entries(suitCounts)) {
        const pct = Math.round((count / totalCards) * 100);
        if (pct > 40 && count >= 5) {
          const themes = {
            wands: 'will and ambition', cups: 'emotion and relationships',
            swords: 'thought and conflict', pentacles: 'material concerns',
            major: 'major life forces',
          };
          patterns.push(`${pct}% of your recent cards are ${suit}. Your readings are saturated with ${themes[suit] || suit} energy.`);
        }
      }
    }

    // Check if any current cards appeared in last reading
    if (readings.length >= 2 && currentCards) {
      const prevCards = readings[readings.length - 2]?.cards?.map(c => c.name) || [];
      for (const dc of currentCards) {
        if (prevCards.includes(dc.card.name)) {
          patterns.push(`${dc.card.name} also appeared in your previous reading. When the same card returns, it's asking you to pay closer attention.`);
        }
      }
    }

    return patterns.slice(0, 3); // max 3 patterns
  } catch { return []; }
}

// ── Main hook ─────────────────────────────────────────────────────────────

export function useReading() {
  const { user, profile, isPremium, session } = useAuth();

  // Flow state
  const [phase, setPhase] = useState('idle');
  const [question, setQuestion] = useState('');
  const [domainTags, setDomainTags] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [reading, setReading] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [journal, setJournal] = useState('');

  // Feature limits
  const limits = getFeatureLimits(
    profile?.subscription_tier || 'free',
    profile?.subscription_status || 'inactive'
  );

  const startReading = useCallback(() => {
    setPhase('questioning');
    setQuestion('');
    setDomainTags([]);
    setReading(null);
    setError(null);
    setJournal('');
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleDomainTag = useCallback((tag) => {
    setDomainTags(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      if (prev.length >= limits.arcanaDomainTags) return prev;
      return [...prev, tag];
    });
  }, [limits.arcanaDomainTags]);

  const proceedToSettings = useCallback(() => {
    setPhase('configuring');
  }, []);

  const executeReading = useCallback(async () => {
    setPhase('drawing');
    setIsProcessing(true);
    setError(null);

    try {
      const { executeReading: runPipeline } = await import('../arcana/pipeline/orchestrator');

      let birthChartData = null;
      try { birthChartData = JSON.parse(localStorage.getItem('df_df_birth') || 'null'); } catch {}

      const request = {
        question: question || undefined,
        inputMethod: question ? 'typed' : 'none',
        ...settings,
        userContext: {
          userId: user?.id || 'anonymous',
          isPremium: !!isPremium,
          domainTags,
          sunSign: birthChartData?.chart?.sunSign,
          moonSign: birthChartData?.chart?.moonSign,
          risingSign: birthChartData?.chart?.risingSign,
        },
      };

      trackArcanaReading({
        spreadId: settings.spreadId,
        deckSystem: settings.deckSystem,
        inputMode: settings.inputMode,
        tier: isPremium ? 'premium' : 'free',
      });

      const result = await runPipeline(request);

      // Detect patterns from reading history
      const localPatterns = detectLocalPatterns(result.drawnCards);
      if (localPatterns.length > 0) {
        result.patterns = localPatterns;
      }

      setReading(result);
      setPhase('reading');

      trackArcanaCompleted({
        spreadId: settings.spreadId,
        deckSystem: settings.deckSystem,
        compositionTier: result.compositionTier,
        isCharged: result.fieldSnapshot?.isCharged || false,
      });

      // Tier C: Upgrade narrative via API for premium users (non-blocking)
      if (isPremium && result.apiPrompts && session?.access_token) {
        fetch('/api/reading-narrative', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            systemPrompt: result.apiPrompts.system,
            userPrompt: result.apiPrompts.user,
          }),
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data?.narrative) {
              setReading(prev => prev ? { ...prev, apiNarrative: data.narrative, compositionTier: 'api' } : prev);
            }
          })
          .catch(() => {}); // Silently fall back to template
      }
    } catch (e) {
      console.error('Reading failed:', e);
      setError(e.message || 'Reading failed');
      setPhase('configuring');
    } finally {
      setIsProcessing(false);
    }
  }, [question, settings, domainTags, user, isPremium]);

  const saveReading = useCallback(async () => {
    if (!reading) return;
    try {
      const summary = {
        readingId: reading.readingId,
        timestamp: reading.timestamp,
        spreadName: reading.spreadTemplate.name,
        spreadId: reading.spreadTemplate.id,
        cardCount: reading.drawnCards.length,
        cards: reading.drawnCards.map(dc => ({
          name: dc.card.name,
          orientation: dc.orientation,
          positionName: dc.positionName,
        })),
        question: question || undefined,
        isCharged: reading.fieldSnapshot?.isCharged || false,
        journal: journal || undefined,
      };
      const existing = JSON.parse(localStorage.getItem('df_df_readings') || '[]');
      existing.push(summary);
      localStorage.setItem('df_df_readings', JSON.stringify(existing.slice(-50)));
      trackArcanaSaved({ readingId: reading.readingId });
      setPhase('saved');
    } catch (e) {
      console.error('Save failed:', e);
    }
  }, [reading, question, journal]);

  const resetReading = useCallback(() => {
    setPhase('idle');
    setQuestion('');
    setDomainTags([]);
    setReading(null);
    setError(null);
    setSettings({ ...FACTORY_DEFAULTS, ...loadDefaults() });
    setJournal('');
  }, []);

  return {
    phase,
    question,
    domainTags,
    settings,
    reading,
    error,
    isProcessing,
    limits,
    journal,

    startReading,
    setQuestion,
    toggleDomainTag,
    updateSettings,
    proceedToSettings,
    executeReading,
    saveReading,
    resetReading,
    setPhase,
    setJournal,
  };
}
