import React from 'react';
import { TopNavigationPanel } from './TopNavigationPanel';
import { UserAvatar } from '../molecules/UserAvatar';
import { ModeToggle } from '../molecules/ModeToggle';
import { BrandLogo } from '../molecules/BrandLogo';
import avatarImg from '../../assets/images/UserAvatar.webp';
import logoImg from '../../assets/images/navagis_logo.jpg';

export const AIHUD = ({
  searchQuery,
  onSearchChange,
  isAIMode,
  onToggleMode,
}) => {

  const containerStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    zIndex: 10,
    padding: '24px',
    // AI Mode visual distinction: subtle glow or border around the entire HUD
    boxShadow: 'inset 0 0 100px rgba(255, 51, 102, 0.05)',
  };

  const aiTopSectionStyle = {
    display: 'flex',
    justifyContent: 'center', // Center the top nav in AI mode to focus on insights
    alignItems: 'flex-start',
    gap: '12px',
    pointerEvents: 'auto',
    width: '100%',
  };

  const topGroupStyle = {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const aiIndicatorStyle = {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
    color: 'var(--color-accent-pink, #FF3366)',
    padding: '8px 16px',
    borderRadius: '24px',
    border: '1px solid rgba(255, 51, 102, 0.3)',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    pointerEvents: 'auto',
    backdropFilter: 'blur(4px)',
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
    gap: '24px', // More breathing room
    pointerEvents: 'auto'
  };

  const modeToggleStyle = {
    pointerEvents: 'auto',
    transform: 'scale(1.05)', // Slightly emphasize the toggle
    transition: 'transform 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      {/* Top Section */}
      <div style={aiTopSectionStyle}>
        <div style={topGroupStyle}>
          <div style={aiIndicatorStyle}>
            <span style={{ fontSize: '18px' }}>✨</span> AI Assist Active
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <TopNavigationPanel
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
            <div style={{ pointerEvents: 'auto' }}>
              <UserAvatar src={avatarImg} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={bottomSectionStyle}>
        <div style={modeToggleStyle}>
          <ModeToggle isAIMode={isAIMode} onToggle={onToggleMode} />
        </div>

        <div style={rightBottomGroupStyle}>
          <BrandLogo src={logoImg} />
        </div>
      </div>
    </div>
  );
};
