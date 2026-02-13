// ============================================================
// DRIFTFIELD: Auth Callback Handler
// ============================================================
// Handles redirect from magic link / OAuth.
// Mount at /auth/callback route.
// ============================================================

import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../../lib/supabase';

export function AuthCallback() {
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        setStatus('error');
        return;
      }
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          return;
        }

        setStatus('success');
        // Redirect to app after brief delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (e) {
        console.error('Auth callback exception:', e);
        setStatus('error');
      }
    };

    handleCallback();
  }, []);

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: 'monospace',
    },
    text: {
      fontSize: '14px',
      letterSpacing: '0.1em',
      opacity: 0.7,
    },
  };

  const messages = {
    processing: 'CALIBRATING FIELD...',
    success: 'SIGNAL ACQUIRED. REDIRECTING...',
    error: 'SIGNAL LOST. TRY AGAIN.',
  };

  return (
    <div style={styles.container}>
      <div style={styles.text}>{messages[status]}</div>
    </div>
  );
}

export default AuthCallback;
