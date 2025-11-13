module.exports = {
  expo: {
    name: 'Clipper Aviation Logistics',
    slug: 'shipping-saas',
    version: '1.0.0',
    orientation: 'default',
    platforms: ['ios', 'android', 'web'],
    userInterfaceStyle: 'automatic',
    icon: './assets/icon.png',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#667eea'
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.clipper.aviation.logistics',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: 'com.clipper.aviation.logistics',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#667eea'
      }
    },
    extra: {
      eas: {
        projectId: '2eb84ea5-0568-4a27-bb74-56833772b3b5'
      }
    },
    owner: 'jack-sawyer',
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      '**/*'
    ]
  }
};