// ============================================================
// DRIFTFIELD: Auth Modal
// ============================================================
// Minimal, dark-themed auth modal matching driftfield aesthetic.
// Supports: email/password, magic link, Google OAuth.
// ============================================================

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const MODES = {
  SIGN_IN: 'sign_in',
  SIGN_UP: 'sign_up',
  MAGIC_LINK: 'magic_link',
};

export function AuthModal({ isOpen, onClose, initialMode = MODES.SIGN_IN }) {
  const { signIn, signUp, signInWithMagicLink, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === MODES.MAGIC_LINK) {
        const { error } = await signInWithMagicLink(email);
        if (error) throw error;
        setMessage('Check your email for the login link.');
        return;
      }

      const fn = mode === MODES.SIGN_UP ? signUp : signIn;
      const { error } = await fn(email, password);
      if (error) throw error;

      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
    setLoading(false);
  };

  // Inline styles to match driftfield's dark aesthetic
  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
    },
    modal: {
      background: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '32px',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
    },
    title: {
      color: '#fff',
      fontSize: '20px',
      fontWeight: 600,
      marginBottom: '24px',
      fontFamily: 'monospace',
      letterSpacing: '0.05em',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: '#111',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      fontFamily: 'monospace',
      marginBottom: '12px',
      outline: 'none',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '12px',
      background: '#fff',
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
      fontFamily: 'monospace',
      cursor: 'pointer',
      letterSpacing: '0.05em',
      marginTop: '8px',
    },
    googleButton: {
      width: '100%',
      padding: '12px',
      background: 'transparent',
      color: '#999',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'monospace',
      cursor: 'pointer',
      marginTop: '12px',
    },
    link: {
      color: '#888',
      fontSize: '12px',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      fontFamily: 'monospace',
      padding: '4px',
      textDecoration: 'underline',
    },
    error: {
      color: '#ff4444',
      fontSize: '12px',
      fontFamily: 'monospace',
      marginTop: '8px',
    },
    message: {
      color: '#00e5c8',
      fontSize: '12px',
      fontFamily: 'monospace',
      marginTop: '8px',
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
    footer: {
      marginTop: '20px',
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '16px 0',
      color: '#444',
      fontSize: '11px',
      fontFamily: 'monospace',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: 'rgba(255, 255, 255, 0.1)',
    },
  };

  const titles = {
    [MODES.SIGN_IN]: 'TUNE IN',
    [MODES.SIGN_UP]: 'ENTER THE FIELD',
    [MODES.MAGIC_LINK]: 'MAGIC LINK',
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.close} onClick={onClose}>×</button>
        <div style={styles.title}>{titles[mode]}</div>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          {mode !== MODES.MAGIC_LINK && (
            <input
              style={styles.input}
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          )}

          <button
            style={{ ...styles.button, opacity: loading ? 0.5 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading
              ? '...'
              : mode === MODES.MAGIC_LINK
                ? 'SEND LINK'
                : mode === MODES.SIGN_UP
                  ? 'CREATE ACCOUNT'
                  : 'SIGN IN'}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span>OR</span>
          <div style={styles.dividerLine} />
        </div>

        <button
          style={styles.googleButton}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          Continue with Google
        </button>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.footer}>
          {mode === MODES.SIGN_IN && (
            <>
              <button style={styles.link} onClick={() => setMode(MODES.SIGN_UP)}>
                create account
              </button>
              <button style={styles.link} onClick={() => setMode(MODES.MAGIC_LINK)}>
                magic link
              </button>
            </>
          )}
          {mode === MODES.SIGN_UP && (
            <button style={styles.link} onClick={() => setMode(MODES.SIGN_IN)}>
              already have an account
            </button>
          )}
          {mode === MODES.MAGIC_LINK && (
            <button style={styles.link} onClick={() => setMode(MODES.SIGN_IN)}>
              use password instead
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
