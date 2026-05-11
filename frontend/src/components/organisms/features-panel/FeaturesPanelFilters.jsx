import React from 'react';
import CollapsibleSection from '../../molecules/CollapsibleSection';

export const FeaturesPanelFilters = ({
  restaurantTypes,
  selectedTypes,
  setSelectedTypes,
  isLoadingTypes
}) => {
  return (
    <div style={{ flex: 'none' }}>
      <CollapsibleSection
        title="Filter"
        items={restaurantTypes}
        type="checkbox"
        value={selectedTypes}
        onChange={setSelectedTypes}
        isLoading={isLoadingTypes}
        emptyText="No filters found"
      />
    </div>
  );
};

export default FeaturesPanelFilters;
