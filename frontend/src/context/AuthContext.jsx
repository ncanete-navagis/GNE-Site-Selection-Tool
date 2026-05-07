/**
 * context/AuthContext.jsx
 *
 * Google OAuth 2.0 (One-Tap / button-flow) context.
 * - Loads the Google Identity Services script once on mount.
 * - Exposes: user (profile info), idToken, signIn(), signOut(), isLoaded flag.
 * - All consumers can stay unauthenticated; auth is opt-in.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const AuthContext = createContext(null);

/**
 * Decode a Google ID token's payload (base64url → JSON).
 * We never trust this on the backend — it's just for displaying user info.
 */
function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export const AuthProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [idToken, setIdToken] = useState(null);
  const [user, setUser] = useState(null); // { name, email, picture }
  const googleRef = useRef(null); // reference to window.google

  // Load the GIS script once
  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn('[Auth] VITE_GOOGLE_CLIENT_ID is not set.');
      setIsLoaded(true); // still mark loaded so UI doesn't hang
      return;
    }

    if (window.google?.accounts?.id) {
      initGSI();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGSI;
    script.onerror = () => {
      console.error('[Auth] Failed to load Google Identity Services script.');
      setIsLoaded(true);
    };
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCredentialResponse = useCallback((response) => {
    const token = response.credential;
    const payload = decodeToken(token);
    setIdToken(token);
    setUser({
      name: payload.name || payload.email || 'User',
      email: payload.email,
      picture: payload.picture,
    });
  }, []);

  function initGSI() {
    const g = window.google;
    googleRef.current = g;
    g.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    setIsLoaded(true);
  }

  /**
   * Trigger the Google Sign-In popup (button flow rendered into a hidden div).
   * We render the button programmatically so callers just call signIn().
   */
  const signIn = useCallback(() => {
    const g = googleRef.current;
    if (!g) return;

    // Render a hidden button and click it
    const container = document.getElementById('__gsi-btn-container__');
    if (!container) return;

    g.accounts.id.renderButton(container, {
      type: 'standard',
      shape: 'pill',
      theme: 'filled_black',
      size: 'large',
    });

    // Click the rendered button
    const btn = container.querySelector('div[role=button]');
    if (btn) btn.click();
  }, []);

  const signOut = useCallback(() => {
    const g = googleRef.current;
    if (g && user?.email) {
      g.accounts.id.revoke(user.email, () => {});
    }
    setIdToken(null);
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ isLoaded, idToken, user, signIn, signOut }}>
      {children}
      {/* Hidden container for the GSI button — required for programmatic rendering */}
      <div
        id="__gsi-btn-container__"
        style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0 }}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
