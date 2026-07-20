#!/bin/bash
# Paway - Automated Build Script for Android APK (macOS/Linux)

set -e

echo "🐾 Paway - Android APK Build Script"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 16.x or higher.${NC}"
    exit 1
fi

# Check .env
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found. Please create .env with Firebase credentials.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env file found${NC}"

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found. Running npm install...${NC}"
    npm install
fi

echo ""
echo -e "${CYAN}🔥 Step 1: Firebase Rules Deployment${NC}"
echo "-----------------------------------"

read -p "Do you want to deploy Firestore rules now? (y/N): " DEPLOY_FIREBASE
if [[ "$DEPLOY_FIREBASE" == "y" || "$DEPLOY_FIREBASE" == "Y" ]]; then
    echo -e "${YELLOW}Deploying Firestore rules and indexes...${NC}"
    
    if command -v firebase &> /dev/null; then
        firebase deploy --only firestore:rules,firestore:indexes
        echo -e "${GREEN}✓ Firestore rules deployed${NC}"
    else
        echo -e "${RED}✗ Firebase CLI not found. Install with: npm install -g firebase-tools${NC}"
        echo -e "${YELLOW}Skipping Firebase deployment...${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping Firebase deployment. Remember to deploy before production!${NC}"
fi

echo ""
echo -e "${CYAN}🏗️  Step 2: Building Production Bundle${NC}"
echo "--------------------------------------"

# Clean previous build
if [ -d "dist" ]; then
    echo -e "${YELLOW}Cleaning previous build...${NC}"
    rm -rf dist
fi

echo -e "${YELLOW}Running: npm run build${NC}"
npm run build

echo -e "${GREEN}✓ Build completed${NC}"

echo ""
echo -e "${CYAN}🔄 Step 3: Syncing with Capacitor${NC}"
echo "----------------------------------"

echo -e "${YELLOW}Running: npx cap sync android${NC}"
npx cap sync android

echo -e "${GREEN}✓ Capacitor sync completed${NC}"

echo ""
echo -e "${CYAN}📱 Step 4: Building Android APK${NC}"
echo "-------------------------------"

read -p "Choose build method: (1) Android Studio (2) Gradle CLI [1/2]: " BUILD_METHOD

if [ "$BUILD_METHOD" == "2" ]; then
    echo -e "${YELLOW}Building APK with Gradle...${NC}"
    
    cd android
    
    # Make gradlew executable
    chmod +x gradlew
    
    echo -e "${YELLOW}Running: ./gradlew assembleDebug${NC}"
    ./gradlew assembleDebug
    
    echo -e "${GREEN}✓ APK built successfully!${NC}"
    echo ""
    echo -e "${CYAN}📦 APK Location:${NC}"
    echo "   app/build/outputs/apk/debug/app-debug.apk"
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo "   Size: $APK_SIZE"
        
        echo ""
        read -p "Install APK on connected device? (y/N): " INSTALL
        if [[ "$INSTALL" == "y" || "$INSTALL" == "Y" ]]; then
            echo -e "${YELLOW}Checking for connected devices...${NC}"
            adb devices
            echo ""
            echo -e "${YELLOW}Installing APK...${NC}"
            adb install -r "$APK_PATH"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ APK installed successfully!${NC}"
            else
                echo -e "${RED}✗ Installation failed. Make sure device is connected with USB debugging enabled.${NC}"
            fi
        fi
    fi
    
    cd ..
else
    echo -e "${YELLOW}Opening Android Studio...${NC}"
    npx cap open android
    echo ""
    echo -e "${CYAN}📝 Next steps in Android Studio:${NC}"
    echo "   1. Wait for Gradle sync to complete"
    echo "   2. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "   3. Find APK in: android/app/build/outputs/apk/debug/"
fi

echo ""
echo -e "${GREEN}🎉 Build process completed!${NC}"
echo ""
echo -e "${CYAN}📚 For detailed instructions, see: BUILD_APK_GUIDE.md${NC}"
echo ""
