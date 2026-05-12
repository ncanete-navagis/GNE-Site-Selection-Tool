import React from 'react';
import { AIChatPanel } from '../molecules/AIChatPanel';
import { FeaturesPanel } from '../molecules/FeaturesPanel';

export const SidePanel = ({ 
  isOpen, 
  onClose, 
  mode, 
  setMode, 
  hasAIAccess, 
  poi,
  onFiltersChange,
  ...props // Pass through all analysis criteria props
}) => {
  const panelStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    height: '100vh',
    width: '380px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-primary)',
    boxShadow: 'none',
    zIndex: 1000,
    transition: 'transform var(--transition-normal)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    pointerEvents: 'auto',
    color: 'var(--text-primary)',
  };

  const headerStyle = {
    padding: '24px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-primary)',
  };

  const toggleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-elevated)',
    padding: '4px',
    borderRadius: 'var(--border-radius-pill)',
    border: '1px solid var(--border-primary)',
  };

  const getToggleItemStyle = (active) => ({
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    backgroundColor: active ? 'var(--bg-card)' : 'transparent',
    padding: '6px 16px',
    borderRadius: 'var(--border-radius-pill)',
    transition: 'all var(--transition-fast)',
    boxShadow: active ? 'var(--shadow-soft)' : 'none',
  });

  const closeBtnStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '18px',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--border-radius-pill)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  };

  return (
    <div style={panelStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div style={toggleContainerStyle}>
          <span 
            style={getToggleItemStyle(mode === 'features')}
            onClick={() => setMode('features')}
          >
            Feature
          </span>
          <span>|</span>
          <span 
            style={{
              ...getToggleItemStyle(mode === 'ai'),
              opacity: hasAIAccess ? 1 : 0.3,
              cursor: hasAIAccess ? 'pointer' : 'not-allowed'
            }}
            onClick={() => hasAIAccess && setMode('ai')}
          >
            AI
          </span>
        </div>
        <button 
          style={closeBtnStyle} 
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.color = 'var(--text-primary)';
            e.target.style.backgroundColor = 'var(--bg-card)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'var(--text-secondary)';
            e.target.style.backgroundColor = 'var(--bg-elevated)';
          }}
        >
          &times;
        </button>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {mode === 'features' ? (
          <FeaturesPanel poi={poi} onFiltersChange={onFiltersChange} {...props} />
        ) : (
          <AIChatPanel poi={poi} />
        )}
      </div>
    </div>
  );
};
