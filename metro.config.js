const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Web-specific optimizations
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');

module.exports = config;