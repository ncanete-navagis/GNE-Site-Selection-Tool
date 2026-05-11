import { useState, useEffect } from 'react';

/**
 * useFeaturePanelState Hook
 * Manages internal UI state and synchronization for the FeaturesPanel.
 * @param {Object} props - Component props
 */
export const useFeaturePanelState = (props) => {
  const [localRadius, setLocalRadius] = useState(props.radius);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isChoroplethOn, setIsChoroplethOn] = useState(false);
  const [isHeatMapOn, setIsHeatMapOn] = useState(false);

  // Sync local radius if external radius changes
  useEffect(() => {
    setLocalRadius(props.radius);
  }, [props.radius]);

  return {
    localRadius,
    setLocalRadius,
    selectedTypes,
    setSelectedTypes,
    isChoroplethOn,
    setIsChoroplethOn,
    isHeatMapOn,
    setIsHeatMapOn
  };
};

export default useFeaturePanelState;
