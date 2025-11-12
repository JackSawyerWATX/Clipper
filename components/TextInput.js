import React from 'react';
import { TextInput as RNTextInput, Platform } from 'react-native';

// Web-enhanced TextInput component
const TextInput = ({ style, placeholder, onChangeText, value, multiline, ...props }) => {
  // Web-specific properties
  const webProps = Platform.OS === 'web' ? {
    // Add web accessibility
    'aria-label': placeholder,
    autoComplete: 'off',
    spellCheck: false,
    
    // Add data attribute for CSS targeting
    'data-web-input': 'true',
    
    // Web-specific styling
    style: [
      style,
      Platform.OS === 'web' && {
        outline: 'none', // We'll handle focus with CSS
        fontFamily: 'inherit',
      }
    ]
  } : {};

  return (
    <RNTextInput
      style={style}
      placeholder={placeholder}
      onChangeText={onChangeText}
      value={value}
      multiline={multiline}
      placeholderTextColor="#999"
      {...webProps}
      {...props}
    />
  );
};

export default TextInput;