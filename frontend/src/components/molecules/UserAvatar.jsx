import React from 'react';
import { AvatarImage } from '../atoms/AvatarImage';

export const UserAvatar = ({ src }) => {
  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    padding: '3px',
    borderRadius: 'var(--border-radius-pill)',
    backgroundColor: 'var(--bg-secondary)',
    backgroundImage: 'linear-gradient(135deg, var(--accent-primary), #4f46e5)',
    boxShadow: 'var(--shadow-elevated)',
    cursor: 'pointer',
    border: '1px solid var(--border-primary)',
    transition: 'all var(--transition-fast)',
  };

  return (
    <div 
      style={containerStyle} 
      className="user-avatar-container"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 0 15px var(--accent-soft)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
      }}
    >
      <AvatarImage src={src || "https://i.pravatar.cc/150?img=11"} size={44} />
    </div>
  );
};
