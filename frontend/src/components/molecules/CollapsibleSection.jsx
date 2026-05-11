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
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        role="button"
        aria-expanded={isOpen}
      >
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#DDD' }}>
          {title}
        </span>
        <span style={{ 
          color: '#666', 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '12px 20px 20px 20px' }}>
          {isLoading ? (
            <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>{emptyText}</div>
          ) : (
            <>
              {type === 'checkbox' && items.map((item, i) => (
                <label key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', color: '#BBB', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(value || []).includes(item.label)}
                    onChange={() => toggleItem(item.label)}
                  />
                  {item.label}
                </label>
              ))}

              {type === 'chip' && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {items.map((item, i) => {
                    const isSelected = value === item.label.toLowerCase();
                    return (
                      <button
                        key={i}
                        onClick={() => toggleItem(item.label)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid #3291ff' : '1px solid #444',
                          backgroundColor: isSelected ? 'rgba(50,145,255,0.2)' : 'transparent',
                          color: isSelected ? '#3291ff' : '#BBB',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
