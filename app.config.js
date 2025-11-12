module.exports = {
  expo: {
    name: 'Shipping SaaS',
    slug: 'shipping-saas',
    version: '1.0.0',
    orientation: 'portrait',
    platforms: ['ios', 'android', 'web'],
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png'
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: 'com.shippingsaas'
    }
  }
};