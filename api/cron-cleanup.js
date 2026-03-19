// ============================================================
// DRIFTFIELD: Scheduled Cleanup (Vercel Cron)
// ============================================================
// Runs daily. Calls the three cleanup functions defined in
// 002_arcana_engine_v2.sql:
//   1. cleanup_expired_journal()   — non-pinned entries > 90 days
//   2. cleanup_expired_readings()  — free tier readings > 30 days
//   3. cleanup_dismissed_patterns() — dismissed patterns > 30 days
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export default async function handler(req, res) {
  // Verify cron secret (Vercel sets this header for cron jobs)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const results = {};

  try {
    // 1. Expired journal entries
    const { data: journalResult, error: journalErr } = await supabase.rpc('cleanup_expired_journal');
    results.journal = journalErr ? { error: journalErr.message } : { deleted: journalResult };

    // 2. Expired free-tier readings
    const { data: readingsResult, error: readingsErr } = await supabase.rpc('cleanup_expired_readings');
    results.readings = readingsErr ? { error: readingsErr.message } : { deleted: readingsResult };

    // 3. Dismissed patterns
    const { data: patternsResult, error: patternsErr } = await supabase.rpc('cleanup_dismissed_patterns');
    results.patterns = patternsErr ? { error: patternsErr.message } : { deleted: patternsResult };

    const hasErrors = Object.values(results).some(r => r.error);
    console.log('Cleanup results:', JSON.stringify(results));

    return res.status(hasErrors ? 207 : 200).json({
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return res.status(500).json({ error: 'Cleanup failed', details: error.message });
  }
}
