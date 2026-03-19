// ============================================================
// DRIFTFIELD: AI Card Back Generation
// ============================================================
// Vercel serverless function. Generates a personalized tarot
// card back via Gemini Imagen 3, uploads to Supabase Storage,
// and enforces a 30-day cooldown per user.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Auth ──────────────────────────────────────────────────
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // ── Premium check ─────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, card_back_generated_at')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_tier !== 'premium' || profile?.subscription_status !== 'active') {
    return res.status(403).json({ error: 'Premium subscription required' });
  }

  // ── 30-day cooldown ───────────────────────────────────────
  if (profile.card_back_generated_at) {
    const lastGen = new Date(profile.card_back_generated_at);
    const cooldownEnd = new Date(lastGen.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (new Date() < cooldownEnd) {
      const daysLeft = Math.ceil((cooldownEnd - new Date()) / (24 * 60 * 60 * 1000));
      return res.status(429).json({
        error: 'Generation on cooldown',
        daysLeft,
        nextAvailable: cooldownEnd.toISOString(),
      });
    }
  }

  // ── Validate prompt ───────────────────────────────────────
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }
  if (prompt.length > 3000) {
    return res.status(400).json({ error: 'Prompt too large' });
  }

  // ── Generate image ────────────────────────────────────────
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'imagen-3.0-generate-002',
    });

    const result = await model.generateImages({
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '9:16',
        outputMimeType: 'image/png',
      },
    });

    const imageData = result.images?.[0]?.imageBytes;
    if (!imageData) {
      return res.status(500).json({ error: 'No image generated' });
    }

    // ── Upload to Supabase Storage ──────────────────────────
    const buffer = Buffer.from(imageData, 'base64');
    const fileName = `${user.id}/card-back.png`;

    // Remove old file if exists (upsert)
    await supabase.storage.from('card-backs').remove([fileName]);

    const { error: uploadError } = await supabase.storage
      .from('card-backs')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to store image' });
    }

    // ── Get public URL ──────────────────────────────────────
    const { data: urlData } = supabase.storage
      .from('card-backs')
      .getPublicUrl(fileName);

    // ── Update cooldown timestamp ───────────────────────────
    await supabase
      .from('profiles')
      .update({ card_back_generated_at: new Date().toISOString() })
      .eq('id', user.id);

    return res.status(200).json({
      url: urlData.publicUrl,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Card back generation error:', error);
    return res.status(500).json({ error: 'Generation failed' });
  }
}
