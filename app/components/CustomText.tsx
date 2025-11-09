import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

/**
 * Custom Text component that disables font scaling based on system settings
 * This prevents text from being affected by iOS accessibility font size settings
 * 
 * Note: We also set Text.defaultProps.allowFontScaling = false globally in index.js
 * This ensures all Text components (even those imported directly from react-native) 
 * will have font scaling disabled.
 */
export const Text = React.forwardRef<RNText, TextProps>((props, ref) => {
  return (
    <RNText
      {...props}
      ref={ref}
      allowFontScaling={false}
    />
  );
}) as typeof RNText;

Text.displayName = 'Text';

export default Text;

