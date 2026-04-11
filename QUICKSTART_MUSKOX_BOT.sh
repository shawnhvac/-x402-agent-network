#!/bin/bash

# $MUSKOX Telegram Bot — Quick Start Script
# Run this after you get your bot token from @BotFather

set -e

echo "🦬 $MUSKOX Telegram Bot — Quick Start"
echo "======================================"
echo ""

# Check if .env file exists
if [ ! -f /root/.openclaw/workspace/muskox-bot/.env ]; then
    echo "❌ .env file not found!"
    echo "Please run this from the bot directory."
    exit 1
fi

# Prompt for bot token
echo "Step 1: Enter your Telegram Bot Token"
echo "(Get it from @BotFather on Telegram)"
echo ""
read -p "Enter TELEGRAM_BOT_TOKEN: " BOT_TOKEN

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ Bot token cannot be empty!"
    exit 1
fi

# Prompt for treasury wallet
echo ""
echo "Step 2: Enter your Treasury Wallet Address"
echo "(This is where snipe fees will be sent)"
echo ""
read -p "Enter TREASURY_WALLET: " TREASURY_WALLET

if [ -z "$TREASURY_WALLET" ]; then
    echo "❌ Treasury wallet cannot be empty!"
    exit 1
fi

# Update .env file
echo ""
echo "Updating .env file..."
sed -i "s/^TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=$BOT_TOKEN/" /root/.openclaw/workspace/muskox-bot/.env
sed -i "s/^TREASURY_WALLET=.*/TREASURY_WALLET=$TREASURY_WALLET/" /root/.openclaw/workspace/muskox-bot/.env

echo "✅ .env updated!"

# Kill old bot process
echo ""
echo "Restarting bot..."
pkill -f "muskox-telegram-bot" 2>/dev/null || true
sleep 2

# Start new bot
cd /root/.openclaw/workspace/muskox-bot
nohup npm start >> /root/.openclaw/workspace/muskox-bot.log 2>&1 &

# Wait for startup
sleep 5

# Check if running
if pgrep -f "muskox-telegram-bot" > /dev/null; then
    echo "✅ Bot started successfully!"
    echo ""
    echo "📊 Status:"
    tail -3 /root/.openclaw/workspace/muskox-bot.log | grep "🚀\|✅"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Open Telegram"
    echo "2. Search for your bot (check .env for username)"
    echo "3. Send /start"
    echo "4. Your bot is live! 🚀"
else
    echo "❌ Bot failed to start. Check logs:"
    tail -20 /root/.openclaw/workspace/muskox-bot.log
    exit 1
fi
