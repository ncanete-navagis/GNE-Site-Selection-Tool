import React from 'react';
import { useFeaturePanelState } from './hooks/useFeaturePanelState';
import { useRestaurantTypes } from './hooks/useRestaurantTypes';
import FeaturesPanelHeader from './FeaturesPanelHeader';
import FeaturesPanelLoading from './FeaturesPanelLoading';
import FeaturesPanelAnalysis from './FeaturesPanelAnalysis';
import FeaturesPanelForm from './FeaturesPanelForm';
import FeaturesPanelFilters from './FeaturesPanelFilters';
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
    onFiltersChange,
    isChoroplethOn,
    setIsChoroplethOn
  } = props;

  // Internal UI State
  const state = useFeaturePanelState(props);

  // Notify parent of filter changes
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(state.selectedTypes);
    }
  }, [state.selectedTypes, onFiltersChange]);
  
  // Data Fetching
  const { restaurantTypes, isLoadingTypes } = useRestaurantTypes();

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

      {/* 3. Filterable Sections */}
      <FeaturesPanelFilters 
        restaurantTypes={restaurantTypes}
        isLoadingTypes={isLoadingTypes}
        selectedTypes={state.selectedTypes}
        setSelectedTypes={state.setSelectedTypes}
      />

      {/* 4. Map Display Controls */}
      <FeaturesPanelMapControls 
        isChoroplethOn={isChoroplethOn}
        setIsChoroplethOn={setIsChoroplethOn}
      />
    </div>
  );
};

export default FeaturesPanel;
