import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, Platform } from 'react-native';

// Web-enhanced TouchableOpacity component
const TouchableOpacity = ({ children, style, onPress, disabled, ...props }) => {
  // Web-specific properties
  const webProps = Platform.OS === 'web' ? {
    // Add web accessibility
    role: 'button',
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled,
    
    // Add keyboard support
    onKeyDown: (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && onPress && !disabled) {
        event.preventDefault();
        onPress();
      }
    },
    
    // Add data attribute for CSS targeting
    'data-touchable': 'true',
    
    // Web cursor
    style: [
      style,
      Platform.OS === 'web' && {
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none', // We'll handle focus with CSS
      }
    ]
  } : {};

  return (
    <RNTouchableOpacity
      style={style}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...webProps}
      {...props}
    >
      {children}
    </RNTouchableOpacity>
  );
};

export default TouchableOpacity;