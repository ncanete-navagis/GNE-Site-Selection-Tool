import React from 'react';

const Avatar = ({ src, size = 32, className = '' }) => {
  return (
    <div 
      className={`avatar-component ${className}`} 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        overflow: 'hidden', 
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0,0,0,0.1)'
      }}
    >
      {src ? (
        <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: size * 0.6 }}>🤖</span>
      )}
    </div>
  );
};

export default Avatar;
