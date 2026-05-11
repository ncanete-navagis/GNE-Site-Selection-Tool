import React from 'react';
import { DefaultHUD } from './DefaultHUD';

export const OverlayHUD = (props) => {
  // Always render the default HUD as legacy AI mode is removed.
  return <DefaultHUD {...props} />;
};