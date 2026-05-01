import React from 'react';

export const MapDashboardLayout = ({ mapComponent, hudComponent, sidePanelComponent }) => {
  const layoutStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden'
  };

  return (
    <div style={layoutStyle}>
      {mapComponent}
      {hudComponent}
      {sidePanelComponent}
    </div>
  );
};
