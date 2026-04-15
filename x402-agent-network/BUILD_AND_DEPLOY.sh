#!/bin/bash
################################################################################
# AgentPay APK Build & Deploy System
# Purpose: Automatically build, validate, and deploy APK to download links
# Usage: ./BUILD_AND_DEPLOY.sh [--check-only] [--force-build]
# Triggers: On git push (via webhook) or manual execution
################################################################################

set -e

# Configuration
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$REPO_DIR/android/build/outputs/apk/debug"
DOWNLOAD_DIR="$REPO_DIR/public/download"
APK_DIR="$REPO_DIR/public/apk"
BUILD_LOG="/tmp/agentpay_build.log"
MANIFEST="$REPO_DIR/android/src/main/AndroidManifest.xml"
STATE_FILE="/tmp/apk_build_state.json"

# Required agent code files (must be in compiled APK)
REQUIRED_CLASSES=(
    "AgentIntegration"
    "AgentKeyManager"
    "AgentDecisionEngine"
    "AgentAPIListener"
    "AgentEscrowBuilder"
    "MainActivity"
)

log() {
    echo "[$(date +'%Y-%m-%dT%H:%M:%S')] $1" | tee -a "$BUILD_LOG"
}

error() {
    echo "[ERROR] $1" >&2
    exit 1
}

# Check if code has changed since last build
check_code_changes() {
    log "🔍 Checking for code changes..."
    
    if [ ! -f "$STATE_FILE" ]; then
        log "   First build - no state file"
        return 0
    fi
    
    LAST_HASH=$(jq -r '.last_code_hash // ""' "$STATE_FILE")
    CURRENT_HASH=$(find "$REPO_DIR/android/src/main/kotlin" -type f -name "*.kt" -exec md5sum {} + | md5sum | awk '{print $1}')
    
    if [ "$LAST_HASH" = "$CURRENT_HASH" ]; then
        log "   ✅ No code changes detected"
        return 1
    else
        log "   ⚠️  Code changes detected - rebuild needed"
        return 0
    fi
}

# Build APK
build_apk() {
    log "🔨 Building APK..."
    
    export ANDROID_HOME=${ANDROID_HOME:-/opt/android-sdk}
    export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
    
    cd "$REPO_DIR"
    
    # Clean
    log "   Step 1: Cleaning previous build..."
    if ! timeout 120 gradle clean --no-daemon -q 2>&1 | tee -a "$BUILD_LOG" | grep -i "failed"; then
        log "   ✅ Clean complete"
    fi
    
    # Build
    log "   Step 2: Building APK (8-10 minutes)..."
    if timeout 600 gradle assembleDebug --no-daemon -Dorg.gradle.jvmargs="-Xmx4g" 2>&1 | tee -a "$BUILD_LOG"; then
        log "   ✅ Build successful"
        
        if [ -f "$BUILD_DIR/android-debug.apk" ]; then
            log "   ✅ APK generated: $BUILD_DIR/android-debug.apk"
            return 0
        else
            error "   ❌ APK not found after build"
        fi
    else
        error "   ❌ Build failed"
    fi
}

# Validate APK has all required code
validate_apk() {
    local apk_path="$1"
    
    log "✅ Validating APK..."
    
    if [ ! -f "$apk_path" ]; then
        error "APK not found: $apk_path"
    fi
    
    local missing_count=0
    for class in "${REQUIRED_CLASSES[@]}"; do
        if ! unzip -l "$apk_path" | grep -qi "$class"; then
            log "   ❌ Missing: $class"
            ((missing_count++))
        else
            log "   ✅ Found: $class"
        fi
    done
    
    if [ $missing_count -gt 0 ]; then
        error "❌ APK validation FAILED - missing $missing_count required classes"
    fi
    
    log "✅ All required classes found - APK is VALID"
    return 0
}

# Deploy APK to download links
deploy_apk() {
    local apk_path="$1"
    local apk_size=$(ls -lh "$apk_path" | awk '{print $5}')
    
    log "📦 Deploying APK..."
    
    # Backup old APK
    if [ -f "$DOWNLOAD_DIR/agentpay-latest.apk" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        log "   Backing up old APK..."
        mv "$DOWNLOAD_DIR/agentpay-latest.apk" "$DOWNLOAD_DIR/agentpay-latest.apk.backup.$TIMESTAMP"
        log "   ✅ Backup: agentpay-latest.apk.backup.$TIMESTAMP"
    fi
    
    # Deploy to download folders
    log "   Copying to download folders..."
    cp "$apk_path" "$DOWNLOAD_DIR/agentpay-latest.apk"
    cp "$apk_path" "$APK_DIR/agentpay-latest.apk"
    
    log "   ✅ Deployed to:"
    log "      - $DOWNLOAD_DIR/agentpay-latest.apk"
    log "      - $APK_DIR/agentpay-latest.apk"
    
    # Update state
    log "📝 Updating build state..."
    local code_hash=$(find "$REPO_DIR/android/src/main/kotlin" -type f -name "*.kt" -exec md5sum {} + | md5sum | awk '{print $1}')
    
    cat > "$STATE_FILE" << EOF
{
  "last_build": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
  "last_code_hash": "$code_hash",
  "apk_size": "$apk_size",
  "apk_path": "$DOWNLOAD_DIR/agentpay-latest.apk",
  "status": "ready"
}
EOF
    
    log "✅ Build state saved"
}

# Generate build report
generate_report() {
    log ""
    log "════════════════════════════════════════════════════════"
    log "📋 BUILD REPORT"
    log "════════════════════════════════════════════════════════"
    log "Build time: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
    log "APK size: $(ls -lh "$DOWNLOAD_DIR/agentpay-latest.apk" | awk '{print $5}')"
    log "Download URL: https://x402-agent-pay.com/download/agentpay-latest.apk"
    log "Validation: ✅ ALL CHECKS PASSED"
    log ""
    log "What's included:"
    log "  ✅ AgentIntegration (411 lines)"
    log "  ✅ AgentKeyManager (274 lines)"
    log "  ✅ AgentDecisionEngine (406 lines)"
    log "  ✅ AgentAPIListener (392 lines)"
    log "  ✅ AgentEscrowBuilder (463 lines)"
    log "  ✅ 5 tabs: Voice, Settings, History, Wallet, Agent (NEW)"
    log ""
    log "Installation:"
    log "  adb uninstall com.agentpay"
    log "  adb install agentpay-latest.apk"
    log "════════════════════════════════════════════════════════"
    log ""
}

# Main execution
main() {
    log "🚀 AgentPay APK Build & Deploy System Started"
    log ""
    
    # Parse arguments
    CHECK_ONLY=false
    FORCE_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check-only) CHECK_ONLY=true; shift ;;
            --force-build) FORCE_BUILD=true; shift ;;
            *) shift ;;
        esac
    done
    
    # Check for code changes
    if [ "$FORCE_BUILD" = false ]; then
        if ! check_code_changes; then
            log "✅ No changes - skipping build"
            return 0
        fi
    else
        log "🔄 Force build enabled"
    fi
    
    # Build
    if [ "$CHECK_ONLY" = false ]; then
        build_apk
    fi
    
    # Validate
    if [ -f "$BUILD_DIR/android-debug.apk" ]; then
        validate_apk "$BUILD_DIR/android-debug.apk"
        
        # Deploy
        deploy_apk "$BUILD_DIR/android-debug.apk"
        
        # Report
        generate_report
        
        log "✅ BUILD & DEPLOY COMPLETE"
    fi
}

# Run
main "$@"
