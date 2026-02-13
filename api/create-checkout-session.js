// ============================================================
// DRIFTFIELD: Create Stripe Checkout Session
// ============================================================
// Vercel serverless function (api/create-checkout-session.js)
// Creates a Stripe Checkout session and returns the URL.
// ============================================================

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, email } = req.body;

    if (!priceId || !userId || !email) {
      return res.status(400).json({ error: 'Missing required fields: priceId, userId, email' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Pass userId so webhook can link payment to Supabase profile
      metadata: {
        supabase_user_id: userId,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || req.headers.origin}/?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || req.headers.origin}/?payment=cancelled`,
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
