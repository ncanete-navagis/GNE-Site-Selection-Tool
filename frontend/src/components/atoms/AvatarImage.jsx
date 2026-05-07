import React from 'react';

export const AvatarImage = ({ src, alt = "User Avatar", size = 40, className = '', referrerPolicy }) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`avatar-image ${className}`}
      referrerPolicy={referrerPolicy}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
      }}
    />
  );
};
