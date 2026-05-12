import React, { useState } from 'react';

/**
 * CollapsibleSection Molecule
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.items - List of items to render
 * @param {string} props.type - 'list' | 'checkbox' | 'chip'
 * @param {any} props.value - Current value(s)
 * @param {function} props.onChange - Change handler
 * @param {boolean} props.isLoading - Loading state
 * @param {string} [props.emptyText="No items"] - Text to show when empty
 */
export const CollapsibleSection = ({ 
  title, 
  items = [], 
  type = 'list', 
  value, 
  onChange, 
  isLoading, 
  emptyText = "No items" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleItem = (label) => {
    if (type === 'chip') {
      onChange(label.toLowerCase());
      return;
    }

    const currentValues = value || [];
    onChange(
      currentValues.includes(label)
        ? currentValues.filter(item => item !== label)
        : [...currentValues, label]
    );
  };

  return (
    <div style={{ borderBottom: '1px solid var(--border-primary)' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'background-color var(--transition-fast)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        role="button"
        aria-expanded={isOpen}
      >
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <span style={{ 
          color: 'var(--text-muted)', 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform var(--transition-normal)',
          fontSize: '10px'
        }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '0 24px 24px 24px' }}>
          {isLoading ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px', padding: '8px 0' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px', padding: '8px 0' }}>{emptyText}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {type === 'checkbox' && items.map((item, i) => (
                <label key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '12px', 
                  padding: '10px 12px', 
                  color: (value || []).includes(item.label) ? 'var(--text-primary)' : 'var(--text-secondary)', 
                  cursor: 'pointer',
                  borderRadius: 'var(--border-radius-sm)',
                  transition: 'all var(--transition-fast)',
                  backgroundColor: (value || []).includes(item.label) ? 'var(--bg-card)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!(value || []).includes(item.label)) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }}
                onMouseLeave={(e) => {
                  if (!(value || []).includes(item.label)) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                >
                  <input
                    type="checkbox"
                    checked={(value || []).includes(item.label)}
                    onChange={() => toggleItem(item.label)}
                    style={{ 
                      accentColor: 'var(--accent-primary)',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: (value || []).includes(item.label) ? '600' : '400' }}>{item.label}</span>
                </label>
              ))}

              {type === 'chip' && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px' }}>
                  {items.map((item, i) => {
                    const isSelected = value === item.label.toLowerCase();
                    return (
                      <button
                        key={i}
                        onClick={() => toggleItem(item.label)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--border-radius-pill)',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-primary)',
                          backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          boxShadow: isSelected ? '0 2px 8px var(--accent-soft)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-primary)';
                            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                          }
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
