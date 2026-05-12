import React from 'react';
import { Icon } from '../atoms/Icon';

export const MapMarker = ({ isSelected, onClick, color = 'var(--accent-primary)' }) => {
  const pinStyle = {
    width: '32px',
    height: '32px',
    backgroundColor: color,
    borderRadius: '50% 50% 50% 0',
    transform: 'rotate(-45deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-soft)',
    cursor: 'pointer',
    border: isSelected ? '2px solid #fff' : '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all var(--transition-fast)',
  };

  const iconContainerStyle = {
    transform: 'rotate(45deg)', // counter-rotate the icon
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={{ position: 'relative', top: '-16px', left: '-16px', pointerEvents: 'auto' }}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
    >
      <div style={pinStyle}>
        <div style={iconContainerStyle}>
          <Icon name="mapPin" color="#fff" />
        </div>
      </div>
    </div>
  );
};
