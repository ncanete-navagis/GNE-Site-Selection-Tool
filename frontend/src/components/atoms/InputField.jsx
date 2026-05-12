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
  <div style={{ marginBottom: '24px' }}>
    <label style={{ 
      display: 'block', 
      fontSize: '11px', 
      color: 'var(--text-muted)', 
      marginBottom: '10px', 
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply && onApply()}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-card)',
            backgroundImage: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.02), transparent)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--border-radius-md)',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '500',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all var(--transition-fast)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)';
            e.target.style.boxShadow = '0 0 0 2px var(--accent-soft)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-primary)';
            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        />
        <span style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontWeight: '600',
          pointerEvents: 'none',
          opacity: 0.6
        }}>
          {unit}
        </span>
      </div>
      {onApply && (
        <button
          onClick={onApply}
          style={{
            backgroundColor: 'var(--button-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            padding: '12px 20px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: '0 4px 12px var(--accent-soft)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--button-primary-hover)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--button-primary)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Apply
        </button>
      )}
    </div>
  </div>
));

export default InputField;
