import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

export const DropdownButton = ({ iconName, label, options = [], onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const containerStyle = { position: 'relative' };
  
  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: '0',
    marginTop: '8px',
    background: 'var(--color-surface)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '8px',
    minWidth: '150px',
    display: isOpen ? 'block' : 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  };

  return (
    <div style={containerStyle}>
      <Button variant="ghost" onClick={toggleOpen} style={{ padding: '8px 16px', display: 'flex', gap: '8px' }}>
        {iconName && <Icon name={iconName} />}
        <Typography variant="label">{label}</Typography>
        <Icon name="chevronDown" color="var(--color-text-secondary)" />
      </Button>

      {isOpen && (
        <div style={dropdownStyle}>
          {options.length === 0 ? (
            <Typography variant="body" color="var(--color-text-secondary)">No options</Typography>
          ) : (
            options.map((opt, i) => (
              <div 
                key={i} 
                onClick={() => { onSelect && onSelect(opt); setIsOpen(false); }}
                style={{ padding: '8px', cursor: 'pointer' }}
              >
                <Typography variant="body">{opt.label}</Typography>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
