import React from 'react';
import { TopNavigationPanel } from './TopNavigationPanel';
import { UserAvatar } from '../molecules/UserAvatar';
import { ModeToggle } from '../molecules/ModeToggle';
import { FloatingActionButton } from '../molecules/FloatingActionButton';
import { BrandLogo } from '../molecules/BrandLogo';
import logoImg from '../../assets/images/navagis_logo.jpg';

export const DefaultHUD = ({
  searchQuery,
  onSearchChange,
  isAIMode,
  onToggleMode,
  onFabClick,
  isPlacingMarker,
  onOpenFeatures
}) => {

  const containerStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    zIndex: 10,
    padding: '24px'
  };

  const bottomSectionStyle = {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    right: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  };

  const rightBottomGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '16px',
    pointerEvents: 'auto'
  };

  const modeToggleStyle = {
    pointerEvents: 'auto'
  };

  return (
    <div style={containerStyle}>
      {/* Top Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          gap: '12px',
          pointerEvents: 'auto'
        }}
      >
        <TopNavigationPanel
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <UserAvatar />
      </div>

      {/* Bottom Section */}
      <div style={bottomSectionStyle}>
        <div style={modeToggleStyle}>
          <ModeToggle isAIMode={isAIMode} onToggle={onToggleMode} />
        </div>

        <div style={rightBottomGroupStyle}>
          <button
            style={{
              backgroundColor: '#1E1E1E',
              color: '#FFF',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '12px 20px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
            onClick={onOpenFeatures}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2A2A2A';
              e.target.style.borderColor = '#444';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#1E1E1E';
              e.target.style.borderColor = '#333';
            }}
          >
            <span>📋</span> Site Features
          </button>
          <FloatingActionButton onClick={onFabClick} isActive={isPlacingMarker} />
          <BrandLogo src={logoImg} />
        </div>
      </div>
    </div>
  );
};
