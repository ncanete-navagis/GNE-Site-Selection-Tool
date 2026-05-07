/**
 * context/AuthContext.jsx
 *
 * Google OAuth 2.0 (One-Tap / button-flow) context.
 * - Loads the Google Identity Services script once on mount.
 * - Exposes: user (profile info), idToken, signIn(), signOut(), isLoaded flag.
 * - All consumers can stay unauthenticated; auth is opt-in.
 *
 * On successful sign-in, the backend is called at GET /api/v1/users/me with
 * the Bearer token. This triggers the DB upsert (create on first login,
 * update last_login on subsequent logins) and returns the persisted profile.
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
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const AuthContext = createContext(null);

/**
 * Decode a Google ID token's payload (base64url → JSON).
 * Used only for the `picture` URL — actual profile data comes from the DB.
 */
function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

/**
 * Call the backend to upsert the user in the DB and return the DB profile.
 * Returns the DB user object merged with the Google picture URL.
 */
async function syncUserWithBackend(token, picture) {
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      console.error('[Auth] Backend sync failed:', res.status, res.statusText);
      return null;
    }
    const dbUser = await res.json();
    // Merge the Google profile picture (not stored in DB) into the user object
    return { ...dbUser, picture };
  } catch (err) {
    console.error('[Auth] Backend sync error:', err);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [idToken, setIdToken] = useState(null);
  const [user, setUser] = useState(null); // DB profile + picture
  const [isSyncing, setIsSyncing] = useState(false);
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

  const handleCredentialResponse = useCallback(async (response) => {
    const token = response.credential;
    const payload = decodeToken(token);
    const picture = payload.picture;

    // Optimistically set token so the rest of the app can use it immediately
    setIdToken(token);

    // Sync with backend — creates the user row on first login, updates last_login otherwise
    setIsSyncing(true);
    const dbUser = await syncUserWithBackend(token, picture);
    setIsSyncing(false);

    if (dbUser) {
      // Use the authoritative DB profile (includes integer id, created_at, last_login)
      setUser(dbUser);
      console.log('[Auth] User saved to DB:', dbUser.email, '— DB id:', dbUser.id);
    } else {
      // Fallback: use client-side decoded payload if backend is unreachable
      console.warn('[Auth] Using client-side profile fallback (backend unreachable).');
      setUser({
        name: payload.name || payload.email || 'User',
        email: payload.email,
        picture,
      });
    }
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
    <AuthContext.Provider value={{ isLoaded, idToken, user, isSyncing, signIn, signOut }}>
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
