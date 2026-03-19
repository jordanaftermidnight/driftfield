// ============================================================
// DRIFTFIELD: Tier C Narrative Generation
// ============================================================
// Vercel serverless function (api/reading-narrative.js)
// Generates premium tarot reading narratives via Anthropic API.
// Called from useReading hook after Tier A template result.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate via Supabase JWT
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Missing authorization' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify premium tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier !== 'premium' || profile?.subscription_status !== 'active') {
      return res.status(403).json({ error: 'Premium subscription required' });
    }

    const { systemPrompt, userPrompt } = req.body;

    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'Missing prompt data' });
    }

    // Limit prompt size to prevent abuse
    if (systemPrompt.length > 5000 || userPrompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt too large' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const narrative = message.content[0]?.text;

    if (!narrative) {
      return res.status(500).json({ error: 'Empty response from model' });
    }

    return res.status(200).json({ narrative });
  } catch (error) {
    console.error('Narrative generation error:', error);
    return res.status(500).json({ error: 'Failed to generate narrative' });
  }
}
