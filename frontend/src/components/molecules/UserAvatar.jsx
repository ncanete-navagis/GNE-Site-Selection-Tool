import React, { useRef, useState, useEffect } from 'react';
import { AvatarImage } from '../atoms/AvatarImage';
import { useAuth } from '../../context/AuthContext';

/**
 * UserAvatar molecule — clickable avatar that opens a sign-in / profile dropdown.
 * Uses the AuthContext for Google OAuth state.
 *
 * Props:
 *   src — fallback avatar image (used when no user is signed in)
 */
export const UserAvatar = ({ src }) => {
  const { user, idToken, signIn, signOut, isLoaded } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    padding: '3px',
    borderRadius: 'var(--border-radius-pill)',
    backgroundColor: user ? 'rgba(50, 200, 120, 0.15)' : 'var(--bg-elevated)',
    boxShadow: user
      ? '0 0 12px rgba(50, 200, 120, 0.4)'
      : 'var(--shadow-soft)',
    cursor: 'pointer',
    border: user
      ? '2px solid rgba(50, 200, 120, 0.5)'
      : '1px solid var(--border-primary)',
    transition: 'all var(--transition-fast)',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    minWidth: '220px',
    background: 'rgba(18, 18, 24, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    zIndex: 1000,
    animation: 'uaFadeSlideDown 0.18s ease',
  };

  const headerStyle = {
    padding: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const nameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    lineHeight: 1.3,
  };

  const emailStyle = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.45)',
    margin: 0,
  };

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
  };

  const signInBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.25), rgba(66, 133, 244, 0.15))',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.15s ease',
  };

  const handleToggle = () => setOpen((o) => !o);

  const handleSignIn = () => {
    setOpen(false);
    signIn();
  };

  const handleSignOut = () => {
    setOpen(false);
    signOut();
  };

  // Avatar source: Google picture when signed in, fallback prop when not
  const avatarSrc = user?.picture || src;

  return (
    <>
      {/* Scoped keyframes — prefixed to avoid collision */}
      <style>{`
        @keyframes uaFadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ua-menu-item:hover { background: rgba(255,255,255,0.06) !important; }
        .ua-sign-in-btn:hover { background: rgba(66, 133, 244, 0.35) !important; }
        .user-avatar-container:hover { background-color: var(--bg-card) !important; }
      `}</style>

      <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
        {/* Avatar button */}
        <div
          id="tutorial-user-avatar"
          style={containerStyle}
          className="user-avatar-container"
          onClick={handleToggle}
          title={user ? user.name : 'Sign in with Google'}
        >
          <AvatarImage
            src={avatarSrc}
            alt={user ? user.name : 'Guest'}
            size={44}
          />
          {/* Green online dot when signed in */}
          {user && (
            <span
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#4ade80',
                border: '2px solid rgba(18,18,24,0.9)',
              }}
            />
          )}
        </div>

        {/* Dropdown panel */}
        {open && (
          <div style={dropdownStyle}>
            {user ? (
              <>
                {/* Signed-in: user header */}
                <div style={headerStyle}>
                  <img
                    src={user.picture || src}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <p style={nameStyle}>{user.name}</p>
                    <p style={emailStyle}>{user.email}</p>
                  </div>
                </div>

                {/* Signed-in badge */}
                <div style={{ padding: '8px 16px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: '#4ade80',
                    background: 'rgba(74, 222, 128, 0.1)',
                    border: '1px solid rgba(74,222,128,0.3)',
                    borderRadius: '20px',
                    padding: '3px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                    Signed in with Google
                  </span>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                {/* Sign out button */}
                <button
                  className="ua-menu-item"
                  style={{ ...menuItemStyle, color: 'rgba(252, 100, 100, 0.85)' }}
                  onClick={handleSignOut}
                >
                  <span style={{ fontSize: '16px' }}>↩</span>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                {/* Guest: sign-in prompt */}
                <div style={{ ...headerStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <p style={{ ...nameStyle, fontSize: '13px' }}>Not signed in</p>
                  <p style={{ ...emailStyle, fontSize: '11px' }}>
                    Sign in to save recommendations and history.
                  </p>
                </div>

                {/* Google sign-in button */}
                <button
                  className="ua-sign-in-btn"
                  style={signInBtnStyle}
                  onClick={handleSignIn}
                  disabled={!isLoaded}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </button>

                <div style={{ padding: '10px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                  You can still use all features without signing in.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};