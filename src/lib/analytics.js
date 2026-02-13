// ============================================================
// DRIFTFIELD: Analytics Tracker
// ============================================================
// Lightweight event tracking that writes to Supabase.
// Fire-and-forget: never blocks UI, silently drops on failure.
// ============================================================

import { supabase, supabaseConfigured } from './supabase';

/**
 * Track a user event. Fire-and-forget.
 * @param {string} eventType - One of the allowed event_type values
 * @param {object} metadata - Optional JSON metadata
 */
export async function trackEvent(eventType, metadata = {}) {
  if (!supabaseConfigured || !supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    // Don't await - fire and forget
    supabase.from('user_analytics').insert({
      user_id: session.user.id,
      event_type: eventType,
      metadata,
    }).then(({ error }) => {
      if (error) console.debug('Analytics tracking error:', error.message);
    });
  } catch (e) {
    // Never throw from analytics
    console.debug('Analytics error:', e.message);
  }
}

/**
 * Track page/tab view
 * @param {string} tabName - Which tab the user viewed
 */
export function trackTabView(tabName) {
  trackEvent('tab_viewed', { tab: tabName });
}

/**
 * Track premium CTA interaction
 * @param {string} location - Where the CTA was shown
 */
export function trackPremiumCTA(location) {
  trackEvent('premium_cta_clicked', { location });
}

/**
 * Track PWA install
 */
export function trackPWAInstall() {
  trackEvent('pwa_installed');
}

/**
 * Track app open (call once per session)
 */
export function trackAppOpen() {
  const sessionKey = `driftfield_session_${new Date().toISOString().split('T')[0]}`;
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, 'true');
  trackEvent('app_open', {
    referrer: document.referrer || 'direct',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    standalone: window.matchMedia('(display-mode: standalone)').matches,
  });
}

export default { trackEvent, trackTabView, trackPremiumCTA, trackPWAInstall, trackAppOpen };
