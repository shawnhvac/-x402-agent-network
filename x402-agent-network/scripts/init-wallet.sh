#!/bin/bash
# Agentic Wallet Initialization for AgentPay
# Run on startup to prepare wallet integration

set -e

echo "🔐 Initializing Agentic Wallet..."
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Check for wallet configuration
if [ -f .agentic-wallet.json ]; then
    echo "✅ Wallet configuration loaded"
    cat .agentic-wallet.json | jq '.wallet' 2>/dev/null || echo "  Network: Base, Currency: USDC, Protocol: x402"
else
    echo "⚠️  Warning: .agentic-wallet.json not found"
    exit 1
fi

echo ""
echo "📋 AgentPay Configuration:"
echo "  API Endpoint: https://x402-agent-pay.com"
echo "  Pricing:"
echo "    • Search: \$0.001"
echo "    • Book: \$0.002"
echo "    • Pay: \$0.001"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Verify API is running
if curl -s https://x402-agent-pay.com/health 2>/dev/null | grep -q "healthy"; then
    echo "✅ AgentPay API: Online"
else
    echo "⚠️  AgentPay API: Not responding (normal if first boot)"
fi

echo ""
echo "✅ Agentic Wallet ready!"
echo ""
echo "Agents can now:"
echo "  1. npm install @coinbase/agentic-wallet-skills"
echo "  2. npx agentic-wallet --init"
echo "  3. npx agentic-wallet --fund-usdc [amount]"
echo "  4. Access services via agentic.market"
echo ""
