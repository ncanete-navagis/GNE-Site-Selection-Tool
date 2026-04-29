import React from 'react';
import { AvatarImage } from '../atoms/AvatarImage';

export const UserAvatar = ({ src }) => {
  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    padding: '4px',
    borderRadius: '50%',
    background: 'rgba(50, 145, 255, 0.1)',
    boxShadow: 'var(--shadow-glow-blue)',
    cursor: 'pointer',
    border: '2px solid rgba(50, 145, 255, 0.3)',
    transition: 'var(--transition-fast)',
  };

  return (
    <div style={containerStyle} className="user-avatar-container">
      <AvatarImage src={src || "https://i.pravatar.cc/150?img=11"} size={44} />
    </div>
  );
};
