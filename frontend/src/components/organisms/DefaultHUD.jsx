import React from 'react';
import { TopNavigationPanel } from './TopNavigationPanel';
import { UserAvatar } from '../molecules/UserAvatar';
import { ModeToggle } from '../molecules/ModeToggle';
import { MapToolsPanel } from './MapToolsPanel';
import { BrandLogo } from '../molecules/BrandLogo';
import avatarImg from '../../assets/images/UserAvatar.webp';
import logoImg from '../../assets/images/navagis_logo.jpg';

export const DefaultHUD = ({
  searchQuery,
  onSearchChange,
  isAIMode,
  onToggleMode,
  onFabClick,
  isPlacingMarker,
  onOpenFeatures,
  onFilterChange,
  onRegionChange
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
          onFilterChange={onFilterChange}
          onRegionChange={onRegionChange}
        />
        <UserAvatar src={avatarImg} />
      </div>

      {/* Bottom Section */}
      <div style={bottomSectionStyle}>
        <div style={modeToggleStyle}>
          <ModeToggle isAIMode={isAIMode} onToggle={onToggleMode} />
        </div>

        <div style={rightBottomGroupStyle}>
          <MapToolsPanel 
            isPlacingMarker={isPlacingMarker} 
            onDropPinClick={onFabClick} 
            onDrawClick={() => console.log('Draw clicked')}
          />
          <BrandLogo src={logoImg} />
        </div>
      </div>
    </div>
  );
};
