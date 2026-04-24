import React from 'react';

const Icon = ({ name, size = 16, color = 'currentColor', className = '' }) => {
  // Simple icon mapping using emojis or simple SVG placeholders for demo
  const icons = {
    star: '⭐',
    accessibility: '♿',
    send: '▶️',
    close: '✕',
    shopping: '🛍️',
  };

  return (
    <span 
      className={`icon-component ${className}`} 
      style={{ fontSize: size, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {icons[name] || name}
    </span>
  );
};

export default Icon;
