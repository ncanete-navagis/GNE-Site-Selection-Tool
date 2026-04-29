import React from 'react';
import { Typography } from '../atoms/Typography';

export const BrandLogo = () => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const iconStyle = {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-pink))',
    borderRadius: '8px',
    transform: 'rotate(-10deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>
        <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '4px', opacity: 0.8 }}></div>
      </div>
      <Typography variant="h3" style={{ margin: 0, letterSpacing: '1px' }}>NAVAGIS</Typography>
    </div>
  );
};
