import React from 'react';
import { DefaultHUD } from './DefaultHUD';
import { AIHUD } from './AIHUD';

export const OverlayHUD = (props) => {
  const { isAIMode } = props;

  // Simply act as a switch between the two different HUD layouts
  if (isAIMode) {
    return <AIHUD {...props} />;
  }

  return <DefaultHUD {...props} />;
};