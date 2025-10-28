#!/bin/bash
set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Android build process...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from your project root.${NC}"
    exit 1
fi

# Check if android directory exists
if [ ! -d "android" ]; then
    echo -e "${YELLOW}⚠️ Android directory not found. Creating with prebuild...${NC}"
    npx expo prebuild --platform android --clean
else
    # Clean only problematic CMake cache, not entire build
    echo -e "${YELLOW}🧹 Cleaning CMake cache...${NC}"
    rm -rf android/app/.cxx
    rm -rf android/app/build/generated/autolinking
fi

# Check if keystore exists
if [ ! -f "credentials/android/keystore.jks" ]; then
    echo -e "${RED}❌ Error: Keystore not found at credentials/android/keystore.jks${NC}"
    echo -e "${YELLOW}Please generate a keystore first or check your signing configuration.${NC}"
    exit 1
fi

# Build release APK (without gradle clean to preserve codegen)
echo -e "${YELLOW}📦 Building release APK...${NC}"
cd android && ./gradlew assembleRelease && cd ..

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo -e "${BLUE}📱 APK location: android/app/build/outputs/apk/release/app-release.apk${NC}"
    
    # Optional: Copy to releases folder with timestamp
    echo -e "${YELLOW}📁 Creating releases folder and copying APK...${NC}"
    mkdir -p releases
    
    # Get app version from package.json (now we're back in project root)
    APP_VERSION=$(node -p "require('./package.json').version")
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    APK_NAME="outdrinkme-v${APP_VERSION}-${TIMESTAMP}.apk"
    
    cp android/app/build/outputs/apk/release/app-release.apk "releases/${APK_NAME}"
    echo -e "${GREEN}📁 APK copied to: releases/${APK_NAME}${NC}"
    
    # Get file size
    FILE_SIZE=$(du -h "releases/${APK_NAME}" | cut -f1)
    echo -e "${BLUE}📊 APK size: ${FILE_SIZE}${NC}"
    
    # Optional: Open releases folder
    if command -v explorer &> /dev/null; then
        echo -e "${YELLOW}📂 Opening releases folder...${NC}"
        explorer releases
    elif command -v open &> /dev/null; then
        open releases
    fi
    
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All done! Your APK is ready for testing/distribution.${NC}"