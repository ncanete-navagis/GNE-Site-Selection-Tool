import React from 'react';

/**
 * InputField Atom
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.unit - Unit label (e.g., 'm', 'people')
 * @param {string|number} props.value - Current value
 * @param {function} props.onChange - Value change handler
 * @param {function} [props.onApply] - Optional apply button handler
 */
export const InputField = React.memo(({ label, unit, value, onChange, onApply }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '500' }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply && onApply()}
          style={{
            width: '100%',
            backgroundColor: '#2A2A2A',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 40px 12px 16px',
            color: '#FFF',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#666',
          fontSize: '12px',
          pointerEvents: 'none'
        }}>
          {unit}
        </span>
      </div>
      {onApply && (
        <button
          onClick={onApply}
          style={{
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 6px rgba(66, 133, 244, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#357ae8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4285F4'}
        >
          Apply
        </button>
      )}
    </div>
  </div>
));

export default InputField;
