#!/bin/bash
# Build APK with Autonomous Agent System
# Includes: AgentKeyManager, AgentDecisionEngine, AgentAPIListener, AgentEscrowBuilder, AgentIntegration

set -e

PROJECT_DIR="/root/.openclaw/workspace/x402-agent-network"
BUILD_LOG="/tmp/apk_agent_build.log"

echo "🔨 Building Android APK with Autonomous Agent System..."
echo "   Starting: $(date)"
echo ""

cd "$PROJECT_DIR"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean 2>&1 | tee "$BUILD_LOG"

# Build debug APK (faster for testing)
echo ""
echo "📦 Building debug APK..."
./gradlew assembleDebug 2>&1 | tee -a "$BUILD_LOG"

# Check if build succeeded
if [ -f "android/build/outputs/apk/debug/android-debug.apk" ]; then
    APK_PATH="android/build/outputs/apk/debug/android-debug.apk"
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    
    echo ""
    echo "✅ APK BUILD SUCCESSFUL!"
    echo "   Path: $APK_PATH"
    echo "   Size: $APK_SIZE"
    echo "   Timestamp: $(date)"
    echo ""
    echo "📱 What's Included:"
    echo "   ✅ AgentKeyManager (keypair generation + Keystore)"
    echo "   ✅ AgentDecisionEngine (autonomous decisions)"
    echo "   ✅ AgentAPIListener (HTTP server on port 8000)"
    echo "   ✅ AgentEscrowBuilder (SmartEscrow transactions)"
    echo "   ✅ AgentIntegration (master orchestrator)"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. adb install -r $APK_PATH"
    echo "   2. Open AgentPay app on device"
    echo "   3. Check logs: adb logcat | grep Agent"
    echo "   4. Agent initializes + starts HTTP server on port 8000"
    echo ""
    
elif [ -f "android/build/outputs/apk/release/android-release.apk" ]; then
    APK_PATH="android/build/outputs/apk/release/android-release.apk"
    APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
    
    echo ""
    echo "✅ APK BUILD SUCCESSFUL (RELEASE)!"
    echo "   Path: $APK_PATH"
    echo "   Size: $APK_SIZE"
    
else
    echo ""
    echo "❌ APK BUILD FAILED"
    echo "   Check build log: $BUILD_LOG"
    exit 1
fi

# Save APK to web server
echo ""
echo "📤 Copying APK to web server..."
cp "$APK_PATH" "/root/.openclaw/workspace/x402-agent-network/public/agentpay-agent.apk"
echo "   ✅ APK available at: http://x402-agent-pay.com/download/agentpay-agent.apk"

echo ""
echo "✅ Build Complete! $(date)"
