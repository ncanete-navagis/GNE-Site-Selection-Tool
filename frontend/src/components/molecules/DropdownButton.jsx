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
    top: 'calc(100% + 12px)',
    left: '0',
    backgroundColor: 'var(--bg-secondary)', // Clean opaque background
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '8px',
    minWidth: '200px',
    display: isOpen ? 'block' : 'none',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', // Standard subtle shadow
    zIndex: 2000,
  };

  return (
    <div style={containerStyle}>
      <Button variant="ghost" onClick={toggleOpen} style={{ padding: '8px 16px', display: 'flex', gap: '8px' }}>
        {iconName && <Icon name={iconName} />}
        <Typography variant="label">{label}</Typography>
        <Icon name="chevronDown" color="inherit" />
      </Button>

      {isOpen && (
        <div style={dropdownStyle}>
          {options.length === 0 ? (
            <Typography variant="body" color="var(--text-muted)">No options</Typography>
          ) : (
            options.map((opt, i) => (
              <div 
                key={i} 
                onClick={() => { onSelect && onSelect(opt); setIsOpen(false); }}
                style={{ 
                  padding: '10px 12px', 
                  cursor: 'pointer',
                  borderRadius: 'var(--border-radius-sm)',
                  transition: 'all 0.2s ease', // Smooth transition
                  /* --- DROPDOWN TEXT COLORS --- */
                  color: '#cbd5e1', // Light gray default (text-slate-300)
                  background: 'transparent',
                  /* Ensure no filters or blurs affect readability */
                  filter: 'none',
                  backdropFilter: 'none'
                }}
                onMouseEnter={(e) => {
                  /* --- MINIMAL HOVER STATE --- */
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // Subtle white/5
                  e.currentTarget.style.color = '#ffffff'; // Pure white hover
                }}
                onMouseLeave={(e) => {
                  /* --- RESET --- */
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
              >
                <Typography variant="body" color="inherit" style={{ fontWeight: '500' }}>{opt.label}</Typography>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
