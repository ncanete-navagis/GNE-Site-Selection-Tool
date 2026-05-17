import React from 'react';
import CollapsibleSection from '../../molecules/CollapsibleSection';

export const FeaturesPanelFilters = ({
  restaurantTypes,
  selectedTypes,
  setSelectedTypes,
  isLoadingTypes,
  poisByCategory = {}
}) => {
  const itemsWithCounts = React.useMemo(() => {
    if (!restaurantTypes) return [];
    return restaurantTypes.map(type => {
      // API keys in poisByCategory are snake_cased: e.g. "fast food" -> "fast_food"
      const apiKey = type.label.toLowerCase().replaceAll(' ', '_');
      const pois = poisByCategory[apiKey] || [];
      const count = pois.length;
      return {
        ...type,
        displayText: count > 0 ? `${type.label} (${count})` : type.label
      };
    });
  }, [restaurantTypes, poisByCategory]);

  return (
    <div id="tutorial-filters-section" style={{ flex: 'none' }}>
      <CollapsibleSection
        title="Filter"
        items={itemsWithCounts}
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
