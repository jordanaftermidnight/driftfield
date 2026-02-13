// ============================================================
// DRIFTFIELD: Stripe Webhook Handler
// ============================================================
// Vercel serverless function (api/stripe-webhook.js)
// Handles Stripe events to sync subscription status with Supabase.
//
// CRITICAL: This uses the Supabase service role key to bypass
// RLS and update user profiles. Never expose this key client-side.
// ============================================================

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Service role client - bypasses RLS
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Vercel requires raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Update user subscription status in Supabase
 */
async function updateSubscription(userId, updates) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error(`Failed to update profile for user ${userId}:`, error);
    throw error;
  }

  console.log(`Updated subscription for user ${userId}:`, updates);
}

/**
 * Extract Supabase user ID from Stripe metadata
 */
function getUserId(obj) {
  return obj?.metadata?.supabase_user_id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      // =============================================
      // CHECKOUT COMPLETED - New subscription
      // =============================================
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = getUserId(session);

        if (!userId) {
          console.warn('No supabase_user_id in checkout session metadata');
          break;
        }

        // Get the subscription to find the current period end
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await updateSubscription(userId, {
          subscription_tier: 'premium',
          subscription_status: 'active',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        break;
      }

      // =============================================
      // SUBSCRIPTION UPDATED - Plan change, renewal
      // =============================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = getUserId(subscription);

        if (!userId) {
          console.warn('No supabase_user_id in subscription metadata');
          break;
        }

        const statusMap = {
          active: 'active',
          past_due: 'past_due',
          unpaid: 'cancelled',
          canceled: 'cancelled',
          incomplete: 'inactive',
          incomplete_expired: 'inactive',
          trialing: 'active',
          paused: 'inactive',
        };

        await updateSubscription(userId, {
          subscription_status: statusMap[subscription.status] || 'inactive',
          subscription_tier: subscription.status === 'canceled' ? 'free' : 'premium',
          subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        });
        break;
      }

      // =============================================
      // SUBSCRIPTION DELETED - Cancellation complete
      // =============================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = getUserId(subscription);

        if (!userId) {
          console.warn('No supabase_user_id in subscription metadata');
          break;
        }

        await updateSubscription(userId, {
          subscription_tier: 'free',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
          subscription_expires_at: null,
        });
        break;
      }

      // =============================================
      // PAYMENT FAILED - Flag past_due
      // =============================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const userId = getUserId(subscription);

          if (userId) {
            await updateSubscription(userId, {
              subscription_status: 'past_due',
            });
          }
        }
        break;
      }

      // =============================================
      // PAYMENT SUCCEEDED - Renewal confirmation
      // =============================================
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;

        if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const userId = getUserId(subscription);

          if (userId) {
            await updateSubscription(userId, {
              subscription_status: 'active',
              subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
