#!/bin/bash

# x402 Agent Network - Quick Start Script

echo "🚀 Starting MUSKOX x402 Agent Network..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install it first:"
    echo "  brew install node  (macOS)"
    echo "  apt-get install nodejs  (Linux)"
    echo "  Download from https://nodejs.org (Windows)"
    exit 1
fi

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Run this script from: /root/.openclaw/workspace/x402-agent-network/"
    exit 1
fi

# Kill any existing instances
echo "🛑 Stopping any existing instances..."
pkill -f "node.*dist/app.js" 2>/dev/null || true
pkill -f "ts-node src/app.ts" 2>/dev/null || true
sleep 1

# Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ TypeScript build failed"
    exit 1
fi

# Start the server
echo ""
echo "✅ Starting server..."
echo ""

# Option 1: Use compiled JavaScript (faster)
node dist/app.js

# Option 2: Use ts-node for development (uncomment to use)
# npm run dev
