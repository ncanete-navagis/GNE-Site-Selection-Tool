import React from 'react';
import { Icon } from '../atoms/Icon';

export const MapMarker = ({ isSelected, onClick }) => {
  const pinStyle = {
    width: '40px',
    height: '40px',
    backgroundColor: 'var(--color-accent-pink)',
    borderRadius: '50% 50% 50% 0',
    transform: 'rotate(-45deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-glow-pink)',
    cursor: 'pointer',
    border: isSelected ? '2px solid #fff' : '2px solid transparent',
    transition: 'var(--transition-fast)',
  };

  const iconContainerStyle = {
    transform: 'rotate(45deg)', // counter-rotate the icon
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{ position: 'relative', top: '-20px', left: '-20px' }} onClick={onClick}>
      <div style={pinStyle}>
        <div style={iconContainerStyle}>
           <Icon name="mapPin" color="#fff" />
        </div>
      </div>
    </div>
  );
};
