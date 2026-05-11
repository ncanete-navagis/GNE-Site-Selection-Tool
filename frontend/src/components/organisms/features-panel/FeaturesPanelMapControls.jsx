import React from 'react';
import ToggleSwitch from '../../atoms/ToggleSwitch';

export const FeaturesPanelMapControls = ({
  isChoroplethOn,
  setIsChoroplethOn,
  isHeatMapOn,
  setIsHeatMapOn
}) => {
  return (
    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <ToggleSwitch
        label="Choropleth Map"
        isOn={isChoroplethOn}
        onToggle={() => setIsChoroplethOn(prev => !prev)}
      />

      <ToggleSwitch
        label="Heat Map"
        isOn={isHeatMapOn}
        onToggle={() => setIsHeatMapOn(prev => !prev)}
      />
    </div>
  );
};

export default FeaturesPanelMapControls;
