import React from 'react';

/**
 * LoadingSpinner Atom
 * @param {Object} props
 * @param {string} [props.color='#ff2a85'] - Spinner color
 * @param {string} [props.size='40px'] - Spinner size
 */
export const LoadingSpinner = React.memo(({ color = '#ff2a85', size = '40px' }) => (
  <>
    <div className="loading-spinner" style={{
      width: size,
      height: size,
      border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: color,
      borderRadius: '50%',
      margin: '0 auto 16px',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </>
));

export default LoadingSpinner;
