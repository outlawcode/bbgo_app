#!/bin/bash

echo "🧹 Cleaning React Native project..."

# Kill Metro bundler if running
echo "Stopping Metro bundler..."
pkill -f "react-native start" || true
pkill -f "metro" || true

# Clean React Native cache
echo "Cleaning React Native cache..."
npx react-native start --reset-cache &
sleep 2
pkill -f "react-native start" || true

# Clean iOS build
echo "Cleaning iOS build..."
cd ios
rm -rf build/
rm -rf Pods/
rm -rf Podfile.lock
pod install
cd ..

# Clean Android build
echo "Cleaning Android build..."
cd android
./gradlew clean
cd ..

# Clean node modules and reinstall
echo "Cleaning node modules..."
rm -rf node_modules/
yarn install

echo "✅ Clean completed! You can now run:"
echo "  yarn start"
echo "  yarn ios"
echo "  yarn android"


