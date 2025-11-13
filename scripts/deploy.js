#!/usr/bin/env node

/**
 * Clipper Aviation - Deployment Helper Script
 * This script guides you through deploying your app to various platforms
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛩️  Clipper Aviation - Deployment Helper');
console.log('=====================================\n');

// Check if EAS CLI is installed
try {
  execSync('eas --version', { stdio: 'ignore' });
  console.log('✅ EAS CLI is installed');
} catch (error) {
  console.log('❌ EAS CLI not found. Installing...');
  execSync('npm install -g eas-cli', { stdio: 'inherit' });
}

// Check app.json configuration
if (!fs.existsSync('./app.json')) {
  console.log('❌ app.json not found. Make sure you\'re in the project root.');
  process.exit(1);
}

console.log('✅ App configuration found\n');

console.log('📱 Deployment Options:');
console.log('1. 🌐 Web Deployment (PWA) - Fastest');
console.log('2. 🍎 iOS App Store - Requires Apple Developer Account ($99/year)');
console.log('3. 🤖 Android Play Store - Requires Google Play Developer Account ($25 one-time)');
console.log('4. 🔧 Configure EAS Build - Set up for mobile app builds\n');

// Get user input (simplified for this demo)
console.log('Next Steps:');
console.log('==========');
console.log('');
console.log('For WEB DEPLOYMENT (recommended first):');
console.log('  npm run build:web');
console.log('  # Then deploy web-build folder to Netlify, Vercel, or GitHub Pages');
console.log('');
console.log('For MOBILE APP STORES:');
console.log('  1. eas login (sign up for Expo account if needed)');
console.log('  2. eas build:configure');
console.log('  3. eas build --platform ios --profile production');
console.log('  4. eas build --platform android --profile production');
console.log('');
console.log('For APP STORE ACCOUNTS:');
console.log('  iOS: https://developer.apple.com/account/ ($99/year)');
console.log('  Android: https://play.google.com/console/ ($25 one-time)');
console.log('');
console.log('📖 Full guide: See APP_STORE_DEPLOYMENT_GUIDE.md');

// Quick web build option
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nWould you like to build the web version now? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n🌐 Building web version...');
    try {
      execSync('expo build:web', { stdio: 'inherit' });
      console.log('\n✅ Web build complete! Files are in ./web-build/');
      console.log('📤 You can now deploy the web-build folder to:');
      console.log('   - Netlify: netlify deploy --dir=web-build --prod');
      console.log('   - Vercel: vercel web-build --prod');
      console.log('   - GitHub Pages: Push web-build to gh-pages branch');
    } catch (error) {
      console.log('❌ Build failed. Check the error above.');
    }
  } else {
    console.log('👍 No problem! Check APP_STORE_DEPLOYMENT_GUIDE.md for detailed instructions.');
  }
  rl.close();
});