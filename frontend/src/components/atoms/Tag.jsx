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
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid',
    display: 'inline-block',
    transition: 'all 0.2s',
    cursor: onClick ? 'pointer' : 'default'
  };

  const dynamicStyle = isSelected !== undefined
    ? {
      padding: '8px 16px',
      borderRadius: '20px',
      border: isSelected ? `1px solid ${color || '#ff2a85'}` : '1px solid #444',
      backgroundColor: isSelected ? (backgroundColor || 'rgba(255, 42, 133, 0.1)') : 'transparent',
      color: isSelected ? (color || '#ff2a85') : '#BBB',
      fontWeight: '600',
    }
    : {
      background: backgroundColor || 'rgba(255, 255, 255, 0.1)',
      color: color || '#FFF',
      borderColor: borderColor || 'rgba(255, 255, 255, 0.2)',
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
