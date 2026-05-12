import React from 'react';

/**
 * Tag Atom
 * @param {Object} props
 * @param {string} props.label - Tag text
 * @param {string} [props.color] - Custom color
 * @param {string} [props.backgroundColor] - Custom background
 * @param {string} [props.borderColor] - Custom border
 * @param {boolean} [props.isSelected] - Selection state for buttons
 * @param {function} [props.onClick] - Click handler for interactive tags
 */
export const Tag = React.memo(({
  label,
  color,
  backgroundColor,
  borderColor,
  isSelected,
  onClick
}) => {
  const baseStyle = {
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid',
    display: 'inline-block',
    transition: 'all var(--transition-fast)',
    cursor: onClick ? 'pointer' : 'default',
    letterSpacing: '0.02em'
  };

  const dynamicStyle = isSelected !== undefined
    ? {
      padding: '10px 18px',
      borderRadius: 'var(--border-radius-pill)',
      border: isSelected ? `1px solid var(--accent-primary)` : '1px solid var(--border-primary)',
      backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-elevated)',
      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
      fontWeight: '700',
      boxShadow: 'var(--shadow-soft)'
    }
    : {
      background: backgroundColor || 'var(--bg-card)',
      color: color || 'var(--text-primary)',
      borderColor: borderColor || 'var(--border-primary)',
      fontWeight: '500'
    };

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{ ...baseStyle, ...dynamicStyle, border: 'none', border: dynamicStyle.border }}
      >
        {label}
      </button>
    );
  }

  return (
    <span style={{ ...baseStyle, ...dynamicStyle }}>
      {label}
    </span>
  );
});

export default Tag;
