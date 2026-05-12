import React from 'react';
import ToggleSwitch from '../../atoms/ToggleSwitch';

export const FeaturesPanelMapControls = ({
  isChoroplethOn,
  setIsChoroplethOn,
  isHeatMapOn,
  setIsHeatMapOn
}) => {
  return (
    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
      <div id="tutorial-choropleth-toggle">
        <ToggleSwitch
          label="Choropleth Map"
          isOn={isChoroplethOn}
          onToggle={() => setIsChoroplethOn(prev => !prev)}
        />
      </div>

      <div id="tutorial-heatmap-toggle">
        <ToggleSwitch
          label="Heat Map"
          isOn={isHeatMapOn}
          onToggle={() => setIsHeatMapOn(prev => !prev)}
        />
      </div>
    </div>
  );
};

export default FeaturesPanelMapControls;
