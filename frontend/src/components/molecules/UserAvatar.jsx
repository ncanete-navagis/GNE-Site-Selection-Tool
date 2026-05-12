import React from 'react';
import { AvatarImage } from '../atoms/AvatarImage';

export const UserAvatar = ({ src }) => {
  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    padding: '3px',
    borderRadius: 'var(--border-radius-pill)',
    backgroundColor: 'var(--bg-elevated)',
    boxShadow: 'var(--shadow-soft)',
    cursor: 'pointer',
    border: '1px solid var(--border-primary)',
    transition: 'all var(--transition-fast)',
  };

  return (
    <div 
      style={containerStyle} 
      className="user-avatar-container"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
      }}
    >
      <AvatarImage src={src || "https://i.pravatar.cc/150?img=11"} size={44} />
    </div>
  );
};
