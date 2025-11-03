import React from 'react';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

/**
 * Safe Area Provider wrapper for the entire app
 * This should wrap your root component
 */
export const AppSafeAreaProvider = ({ children }) => {
  return (
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  );
};

/**
 * Hook to get safe area insets
 * Returns insets for all sides (top, bottom, left, right)
 */
export const useSafeArea = () => {
  const insets = useSafeAreaInsets();
  
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    // Helper for bottom padding specifically
    bottomPadding: Platform.OS === 'android' ? Math.max(insets.bottom, 20) : insets.bottom,
  };
};

/**
 * Component for safe area view with custom styling
 */
export const SafeAreaContainer = ({ children, style, ...props }) => {
  return (
    <SafeAreaView style={[{ flex: 1 }, style]} {...props}>
      {children}
    </SafeAreaView>
  );
};

/**
 * Hook for bottom safe area specifically
 * Useful for bottom positioned elements
 */
export const useBottomSafeArea = () => {
  const insets = useSafeAreaInsets();
  
  // Check if device has gesture navigation (insets.bottom = 0 on older Android with button nav)
  const hasGestureNav = insets.bottom > 0;
  
  console.log('🔍 Safe Area Debug:', {
    platform: Platform.OS,
    bottom: insets.bottom,
    top: insets.top,
    left: insets.left,
    right: insets.right,
    hasGestureNav,
  });
  
  // For Android devices without gesture navigation (insets.bottom = 0)
  // We need to add more padding to avoid bottom navigation bar
  // Standard Android navigation bar height: ~48dp for 3-button nav
  // Increasing to 80dp to ensure text labels are not cut off
  const androidMinPadding = hasGestureNav ? insets.bottom : 80;
  
  return {
    // For Android, ensure sufficient padding for bottom navigation with text labels
    bottom: Platform.OS === 'android' ? Math.max(androidMinPadding, 80) : insets.bottom,
    // For elements that need extra padding above navigation bar
    // Add extra 16dp for comfortable spacing above the system navigation
    bottomWithExtra: Platform.OS === 'android' 
      ? Math.max(androidMinPadding + 16, 96) 
      : insets.bottom + 10,
  };
};

/**
 * Style helper for bottom positioned elements
 */
export const getBottomSafeStyle = (extraPadding = 0) => {
  return {
    paddingBottom: Platform.OS === 'android' ? Math.max(20, extraPadding) : extraPadding,
  };
};