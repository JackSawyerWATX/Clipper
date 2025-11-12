# Quick Setup Script for React Native Shipping SaaS

Write-Host "🚀 Setting up React Native Shipping SaaS Framework..." -ForegroundColor Cyan

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ and try again." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersion = node --version
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install React Native CLI if not present
if (!(Get-Command react-native -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing React Native CLI globally..." -ForegroundColor Yellow
    npm install -g react-native-cli
}

# Install dependencies
Write-Host "📦 Installing project dependencies..." -ForegroundColor Yellow
npm install

# Install additional dev dependencies
Write-Host "📦 Installing additional development dependencies..." -ForegroundColor Yellow
npm install --save-dev @types/react @types/react-native babel-plugin-module-resolver

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env configuration file..." -ForegroundColor Yellow
    @"
# API Configuration
API_BASE_URL=http://localhost:3000/api
SENTRY_DSN=your-sentry-dsn-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Environment
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8

    Write-Host "✅ .env file created. Please update with your actual API endpoints." -ForegroundColor Green
}

# Create gitignore if it doesn't exist
if (!(Test-Path ".gitignore")) {
    Write-Host "📝 Creating .gitignore file..." -ForegroundColor Yellow
    @"
# OSX
#
.DS_Store

# Xcode
#
build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate

# Android/IntelliJ
#
build/
.idea
.gradle
local.properties
*.iml
*.hprof
.cxx/

# node.js
#
node_modules/
npm-debug.log
yarn-error.log

# BUCK
buck-out/
\.buckd/
*.keystore
!debug.keystore

# fastlane
#
*/fastlane/report.xml
*/fastlane/Preview.html
*/fastlane/screenshots

# Bundle artifacts
*.jsbundle

# CocoaPods
/ios/Pods/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Metro
.metro-health-check*

# Testing
/coverage

# Flipper
ios/Flipper-Folly

# Expo (if using)
.expo/
web-build/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

    Write-Host "✅ .gitignore file created." -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete! Here's what you can do next:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update .env file with your API endpoints" -ForegroundColor White
Write-Host "2. Start the Metro bundler: npm start" -ForegroundColor White
Write-Host "3. Run on Android: npm run android" -ForegroundColor White
Write-Host "4. Run on iOS: npm run ios (macOS only)" -ForegroundColor White
Write-Host ""
Write-Host "📚 Check README.md for detailed setup instructions" -ForegroundColor Yellow
Write-Host "🔧 Customize the app theme in src/constants/theme.ts" -ForegroundColor Yellow
Write-Host "🔗 Configure API endpoints in src/constants/index.ts" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy coding! 🚚📦" -ForegroundColor Green