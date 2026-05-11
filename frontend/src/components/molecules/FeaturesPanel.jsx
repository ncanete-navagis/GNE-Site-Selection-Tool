import React from 'react';
import { FeaturesPanel as FeaturesPanelOrganism } from '../organisms/features-panel/FeaturesPanel';

/**
 * FeaturesPanel Molecule (Legacy Entry Point)
 * This component acts as a passthrough to the refactored organism to ensure 
 * backward compatibility for existing imports across the application.
 */
export const FeaturesPanel = (props) => {
  return <FeaturesPanelOrganism {...props} />;
};

export default FeaturesPanel;