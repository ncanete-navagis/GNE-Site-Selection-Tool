import React from 'react';

/**
 * ToggleSwitch Atom
 * @param {Object} props
 * @param {string} props.label - Toggle label
 * @param {boolean} props.isOn - Current state
 * @param {function} props.onToggle - Toggle handler
 */
export const ToggleSwitch = React.memo(({ label, isOn, onToggle }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-primary)',
      transition: 'background-color var(--transition-fast)'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    role="switch"
    aria-checked={isOn}
    tabIndex={0}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
  >
    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>{label}</span>

    <div
      onClick={onToggle}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: 'var(--border-radius-pill)',
        backgroundColor: isOn ? 'var(--button-primary)' : 'var(--bg-elevated)',
        border: '1px solid var(--border-primary)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all var(--transition-normal)',
        boxShadow: isOn ? '0 0 8px var(--accent-soft)' : 'none'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '3px',
          left: isOn ? '23px' : '3px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#FFF',
          transition: 'all var(--transition-normal)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      />
    </div>
  </div>
));

export default ToggleSwitch;
