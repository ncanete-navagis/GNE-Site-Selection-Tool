import React from 'react';
import { TopNavigationPanel } from './TopNavigationPanel';
import { UserAvatar } from '../molecules/UserAvatar';
import { MapToolsPanel } from './MapToolsPanel';
import { BrandLogo } from '../molecules/BrandLogo';
import avatarImg from '../../assets/images/UserAvatar.webp';
import logoImg from '../../assets/images/navagis_logo.jpg';

export const DefaultHUD = ({
  searchQuery,
  onSearchChange,
  onFabClick,
  isPlacingMarker,
  isDrawing,
  onDrawClick,
  onFinishDrawing,
  onOpenFeatures,
  onFilterChange,
  onRegionChange
}) => {

  const containerStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    zIndex: 10,
    padding: '20px'
  };

  const bottomSectionStyle = {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  };

  const rightBottomGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '20px',
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <UserAvatar src={avatarImg} />
          <MapToolsPanel
            isPlacingMarker={isPlacingMarker}
            isDrawing={isDrawing}
            onDropPinClick={onFabClick}
            onDrawClick={onDrawClick}
            onFinishDrawing={onFinishDrawing}
            onFilterClick={onOpenFeatures}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div style={bottomSectionStyle}>
        <div />

        <div style={rightBottomGroupStyle}>
          <BrandLogo src={logoImg} />
        </div>
      </div>
    </div>
  );
};
