#!/bin/bash

# Auto-update APK timestamp on download page
# Run this after building new APK

APK_PATH="/root/.openclaw/workspace/x402-agent-network/public/download/agentpay-latest.apk"
HTML_PATH="/root/.openclaw/workspace/x402-agent-network/public/download.html"

if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found at $APK_PATH"
    exit 1
fi

# Get file modification time
TIMESTAMP=$(date -r "$APK_PATH" '+%B %d, %Y (%H:%M UTC)')
FILE_SIZE=$(du -h "$APK_PATH" | cut -f1)

echo "🔄 Updating APK timestamp in download.html"
echo "   File: $APK_PATH"
echo "   Timestamp: $TIMESTAMP"
echo "   Size: $FILE_SIZE"

# Update HTML with new timestamp (using sed)
sed -i "s/<span id=\"lastUpdated\">.*<\/span>/<span id=\"lastUpdated\">$TIMESTAMP<\/span>/" "$HTML_PATH"

echo "✅ Download page updated"
echo "   Users will see fresh APK on next page load"
