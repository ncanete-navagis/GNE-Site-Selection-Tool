import { useState, useEffect } from 'react';

/**
 * useFeaturePanelState Hook
 * Manages internal UI state and synchronization for the FeaturesPanel.
 * @param {Object} props - Component props
 */
export const useFeaturePanelState = (props) => {
  const [localRadius, setLocalRadius] = useState(props.radius);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Sync local radius if external radius changes
  useEffect(() => {
    setLocalRadius(props.radius);
  }, [props.radius]);

  return {
    localRadius,
    setLocalRadius,
    selectedTypes,
    setSelectedTypes
  };
};

export default useFeaturePanelState;
