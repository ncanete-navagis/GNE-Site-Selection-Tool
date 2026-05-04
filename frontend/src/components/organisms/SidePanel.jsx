import React from 'react';
import { AIChatPanel } from '../molecules/AIChatPanel';
import { FeaturesPanel } from '../molecules/FeaturesPanel';

export const SidePanel = ({ 
  isOpen, 
  onClose, 
  mode, 
  setMode, 
  hasAIAccess, 
  poi 
}) => {
  const panelStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '360px',
    backgroundColor: '#1E1E1E',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 1000,
    pointerEvents: 'auto',
    color: '#FFF',
  };

  const headerStyle = {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  };

  const toggleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#888',
    cursor: 'pointer',
  };

  const getToggleItemStyle = (active) => ({
    color: active ? '#FFF' : '#888',
    transition: 'color 0.2s',
  });

  const closeBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '4px',
    lineHeight: 1,
    transition: 'color 0.2s',
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
          onMouseEnter={(e) => e.target.style.color = '#FFF'}
          onMouseLeave={(e) => e.target.style.color = '#888'}
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
          <FeaturesPanel poi={poi} />
        ) : (
          <AIChatPanel poi={poi} />
        )}
      </div>
    </div>
  );
};
