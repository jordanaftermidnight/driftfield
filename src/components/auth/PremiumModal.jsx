// ============================================================
// DRIFTFIELD: Premium Upgrade Modal
// ============================================================
// Shows premium features + pricing. Initiates Stripe Checkout.
// ============================================================

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PRICING } from '../../lib/premium';
import { trackPremiumCTA } from '../../lib/analytics';

export function PremiumModal({ isOpen, onClose, triggerLocation = 'unknown' }) {
  const { user, isPremium } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || isPremium) return null;

  const handleCheckout = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    trackPremiumCTA(triggerLocation);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PRICING[selectedPlan].stripePriceId,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(6px)',
    },
    modal: {
      background: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '32px',
      width: '100%',
      maxWidth: '440px',
      position: 'relative',
    },
    title: {
      color: '#fff',
      fontSize: '18px',
      fontWeight: 600,
      fontFamily: 'monospace',
      letterSpacing: '0.08em',
      marginBottom: '8px',
    },
    subtitle: {
      color: '#666',
      fontSize: '13px',
      fontFamily: 'monospace',
      marginBottom: '24px',
    },
    features: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 24px 0',
    },
    feature: {
      color: '#aaa',
      fontSize: '13px',
      fontFamily: 'monospace',
      padding: '6px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    featureIcon: {
      color: '#00e5c8',
      fontSize: '12px',
    },
    planToggle: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
    },
    planButton: (isSelected) => ({
      flex: 1,
      padding: '14px 12px',
      background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
      border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '8px',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '13px',
      cursor: 'pointer',
      textAlign: 'center',
    }),
    planPrice: {
      fontSize: '20px',
      fontWeight: 600,
      display: 'block',
      marginBottom: '2px',
    },
    planInterval: {
      fontSize: '11px',
      color: '#888',
    },
    savingsBadge: {
      display: 'inline-block',
      background: 'rgba(68, 255, 136, 0.15)',
      color: '#00e5c8',
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '4px',
      marginLeft: '6px',
    },
    checkoutButton: {
      width: '100%',
      padding: '14px',
      background: '#fff',
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
      fontFamily: 'monospace',
      cursor: 'pointer',
      letterSpacing: '0.05em',
    },
    close: {
      position: 'absolute',
      top: '12px',
      right: '16px',
      background: 'none',
      border: 'none',
      color: '#666',
      fontSize: '20px',
      cursor: 'pointer',
    },
    error: {
      color: '#ff4444',
      fontSize: '12px',
      fontFamily: 'monospace',
      marginTop: '8px',
    },
  };

  const premiumFeatures = [
    'Unlimited daily probes',
    'Full event history (no 7-day limit)',
    'Deep entropy analysis (Shannon, χ², Monte Carlo)',
    'Advanced pattern detection across all data',
    'Unlimited decision evaluator options',
    'Export data (JSON/CSV)',
    'Custom probe card styling',
    'Cloud sync across devices',
    'Field shift notifications',
    'Personal statistics dashboard',
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.close} onClick={onClose}>×</button>

        <div style={styles.title}>AMPLIFY THE SIGNAL</div>
        <div style={styles.subtitle}>unlock the full field</div>

        <ul style={styles.features}>
          {premiumFeatures.map((f, i) => (
            <li key={i} style={styles.feature}>
              <span style={styles.featureIcon}>◆</span>
              {f}
            </li>
          ))}
        </ul>

        <div style={styles.planToggle}>
          <button
            style={styles.planButton(selectedPlan === 'monthly')}
            onClick={() => setSelectedPlan('monthly')}
          >
            <span style={styles.planPrice}>{PRICING.monthly.display}</span>
            <span style={styles.planInterval}>/ month</span>
          </button>
          <button
            style={styles.planButton(selectedPlan === 'yearly')}
            onClick={() => setSelectedPlan('yearly')}
          >
            <span style={styles.planPrice}>
              {PRICING.yearly.display}
              <span style={styles.savingsBadge}>SAVE {PRICING.yearly.savings}</span>
            </span>
            <span style={styles.planInterval}>/ year</span>
          </button>
        </div>

        <button
          style={{ ...styles.checkoutButton, opacity: loading ? 0.5 : 1 }}
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'OPENING CHECKOUT...' : 'UPGRADE NOW'}
        </button>

        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default PremiumModal;
