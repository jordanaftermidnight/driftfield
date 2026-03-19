// ============================================================
// DRIFTFIELD: Create Stripe Checkout Session
// ============================================================
// Vercel serverless function (api/create-checkout-session.js)
// Creates a Stripe Checkout session and returns the URL.
// Authenticated via Supabase JWT — userId and email derived
// from the authenticated user, not from the request body.
// ============================================================

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

    const { priceId } = req.body;

    // Validate price ID against known Stripe prices
    const allowedPrices = [
      process.env.VITE_STRIPE_PRICE_MONTHLY,
      process.env.VITE_STRIPE_PRICE_YEARLY,
    ].filter(Boolean);

    if (!priceId || !allowedPrices.includes(priceId)) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    // Reuse existing Stripe customer if one exists (prevents duplicates)
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const customerParams = profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: user.email };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...customerParams,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?payment=cancelled`,
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
