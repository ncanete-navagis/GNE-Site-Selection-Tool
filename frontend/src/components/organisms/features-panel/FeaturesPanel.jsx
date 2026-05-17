import React from 'react';
import { useFeaturePanelState } from './hooks/useFeaturePanelState';
import FeaturesPanelHeader from './FeaturesPanelHeader';
import FeaturesPanelLoading from './FeaturesPanelLoading';
import FeaturesPanelAnalysis from './FeaturesPanelAnalysis';
import FeaturesPanelForm from './FeaturesPanelForm';
import FeaturesPanelMapControls from './FeaturesPanelMapControls';

/**
 * FeaturesPanel Organism
 * Main implementation of the Site Site Selection Features Panel.
 */
export const FeaturesPanel = (props) => {
  const {
    poi,
    isAnalyzing,
    onRunAnalysis,
    isChoroplethOn,
    setIsChoroplethOn
  } = props;

  // Internal UI State
  const state = useFeaturePanelState(props);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      backgroundColor: 'transparent',
      overflowX: 'hidden'
    }}>
      {/* 1. Header Section */}
      <FeaturesPanelHeader poi={poi} />

      {/* 2. Main Content View (Loading | Analysis | Form) */}
      <div style={{ flex: 'none' }}>
        {isAnalyzing ? (
          <FeaturesPanelLoading />
        ) : poi?.analysis ? (
          <FeaturesPanelAnalysis poi={poi} />
        ) : (
          <FeaturesPanelForm 
            {...props} 
            localRadius={state.localRadius}
            setLocalRadius={state.setLocalRadius}
          />
        )}
      </div>

      {/* 3. Map Display Controls */}
      <FeaturesPanelMapControls 
        isChoroplethOn={isChoroplethOn}
        setIsChoroplethOn={setIsChoroplethOn}
      />
    </div>
  );
};

export default FeaturesPanel;
