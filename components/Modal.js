import React from 'react';
import { Modal as RNModal, Platform, View, StyleSheet } from 'react-native';

// Web-compatible Modal component
const Modal = ({ visible, onRequestClose, children, animationType = 'slide', transparent = true, ...props }) => {
  if (Platform.OS !== 'web') {
    return (
      <RNModal
        visible={visible}
        onRequestClose={onRequestClose}
        animationType={animationType}
        transparent={transparent}
        {...props}
      >
        {children}
      </RNModal>
    );
  }

  // Web implementation
  if (!visible) return null;

  return (
    <View style={styles.webModalOverlay}>
      <View style={styles.webModalContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webModalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    margin: 20,
    maxWidth: '90%',
    maxHeight: '90%',
  },
});

export default Modal;