import React from 'react';
import { Typography } from '../atoms/Typography';

export const BrandLogo = () => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const iconStyle = {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, var(--accent-primary), #4f46e5)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px var(--accent-soft)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>
        <div style={{ width: '18px', height: '18px', border: '3px solid #fff', borderRadius: '4px', opacity: 0.9 }}></div>
      </div>
      <Typography variant="h2" style={{ margin: 0, letterSpacing: '0.05em', fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)' }}>NAVAGIS</Typography>
    </div>
  );
};
