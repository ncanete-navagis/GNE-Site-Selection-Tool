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
      padding: '12px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}
    role="switch"
    aria-checked={isOn}
    tabIndex={0}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
  >
    <span style={{ color: '#DDD' }}>{label}</span>

    <div
      onClick={onToggle}
      style={{
        width: '40px',
        height: '20px',
        borderRadius: '20px',
        backgroundColor: isOn ? '#3291ff' : '#444',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: isOn ? '22px' : '2px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#FFF',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </div>
  </div>
));

export default ToggleSwitch;
