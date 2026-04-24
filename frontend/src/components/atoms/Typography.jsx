import React from 'react';

const Typography = ({ variant = 'body', color = 'white', weight = 'normal', children, className = '' }) => {
  const styles = {
    h1: { fontSize: '24px', fontWeight: 'bold' },
    h2: { fontSize: '18px', fontWeight: 'bold' },
    body: { fontSize: '14px', fontWeight: weight },
    caption: { fontSize: '12px', fontWeight: 'normal', opacity: 0.7 },
  };

  const style = styles[variant] || styles.body;
  
  return (
    <div className={`typography-${variant} ${className}`} style={{ ...style, color }}>
      {children}
    </div>
  );
};

export default Typography;
