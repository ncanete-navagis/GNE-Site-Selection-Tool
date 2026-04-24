import React from 'react';

const Surface = ({ children, className = '', style = {}, radius = '12px', bg = '#2B2D31' }) => {
  return (
    <div 
      className={`surface-component ${className}`} 
      style={{ 
        background: bg, 
        borderRadius: radius, 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        ...style 
      }}
    >
      {children}
    </div>
  );
};

export default Surface;
