import React from 'react';
import { Typography } from '../atoms/Typography';

export const BrandLogo = ({ src }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const iconStyle = {
    width: '36px',
    height: '36px',
    backgroundColor: 'var(--accent-primary)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border-subtle)',
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>
        <img
          src={src}
          alt="Navagis Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: 'var(--border-radius-md)',
          }}
        />
      </div>
      <Typography variant="h2" style={{ margin: 0, letterSpacing: '0.05em', fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)' }}>NAVAGIS</Typography>
    </div>
  );
};
