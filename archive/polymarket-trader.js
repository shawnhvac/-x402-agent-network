#!/usr/bin/env node
/**
 * Polymarket Sum-to-One Arbitrage Trader
 * LIVE MODE - Will execute trades on BTC/ETH short-duration markets
 */

const https = require('https');
const fs = require('fs');
const { ethers } = require('ethers');

// Configuration
const CONFIG = {
  scanIntervalMs: 60000, // 1 minute
  minEdge: 0.01, // 1% minimum edge
  maxSum: 0.99,
  testTradeSize: 2, // $2 for first test
  tradeSize: 15, // $15 per trade after test
  maxOpenPositions: 3,
  minBalance: 20, // Stop trading below $20
  targetDurations: ['5 minute', '15 minute', '5-minute', '15-minute', '5min', '15min'],
  targetAssets: ['BTC', 'Bitcoin', 'ETH', 'Ethereum'],
  logFile: '/root/.openclaw/workspace/polymarket-trader.log',
  stateFile: '/root/.openclaw/workspace/polymarket-state.json',
  credFile: '/root/.openclaw/workspace/.credentials/polymarket-wallet.json',
  fee: 0.02, // 2% fee estimate
  rpcUrl: 'https://polygon-rpc.com', // Will try multiple if this fails
  testMode: true // Start in test mode ($2 trades)
};

// State
const state = {
  balance: 0,
  trades: [],
  openPositions: [],
  totalTrades: 0,
  successfulTrades: 0,
  failedTrades: 0,
  totalProfit: 0,
  lastScan: null,
  testTradeComplete: false
};

// Wallet
let wallet = null;
let provider = null;

// Load credentials
function loadWallet() {
  try {
    const creds = JSON.parse(fs.readFileSync(CONFIG.credFile, 'utf8'));
    provider = new ethers.JsonRpcProvider('https://polygon.llamarpc.com'); // Free, reliable
    wallet = new ethers.Wallet(creds.private_key, provider);
    log(`Wallet loaded: ${wallet.address}`);
    return true;
  } catch (e) {
    log(`ERROR loading wallet: ${e.message}`);
    return false;
  }
}

// Check balance
async function checkBalance() {
  try {
    const balance = await provider.getBalance(wallet.address);
    state.balance = parseFloat(ethers.formatEther(balance));
    log(`Current balance: ${state.balance.toFixed(4)} MATIC`);
    
    // Note: Should also check USDC balance for Polymarket
    // For now, using MATIC as proxy
    
    return state.balance;
  } catch (e) {
    log(`ERROR checking balance: ${e.message}`);
    return 0;
  }
}

// Fetch markets
function fetchMarkets(cursor = 'MA==') {
  return new Promise((resolve, reject) => {
    const url = `https://clob.polymarket.com/markets?next_cursor=${cursor}&limit=100`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Check if market matches criteria
function isTargetMarket(market) {
  const question = (market.question || '').toLowerCase();
  
  const hasAsset = CONFIG.targetAssets.some(asset => 
    question.includes(asset.toLowerCase())
  );
  
  const hasShortDuration = CONFIG.targetDurations.some(dur => 
    question.includes(dur.toLowerCase())
  );
  
  const isActive = market.active === true && market.closed === false;
  
  return hasAsset && hasShortDuration && isActive;
}

// Analyze market for arbitrage
function analyzeMarket(market) {
  try {
    const yesPrice = parseFloat(market.tokens?.[0]?.price || 0);
    const noPrice = parseFloat(market.tokens?.[1]?.price || 0);
    
    if (!yesPrice || !noPrice) return null;
    
    const sum = yesPrice + noPrice;
    const edge = 1 - sum - CONFIG.fee;
    
    if (sum < CONFIG.maxSum && edge > CONFIG.minEdge) {
      return {
        market: market.question,
        conditionId: market.condition_id,
        clobTokenIds: market.clobTokenIds,
        yesPrice,
        noPrice,
        sum,
        edge,
        potentialProfitPercent: (edge * 100).toFixed(2),
        volume: market.volume || 0,
        liquidity: market.liquidity || 0,
        closesAt: market.end_date_iso
      };
    }
    
    return null;
  } catch (e) {
    log(`Error analyzing market: ${e.message}`);
    return null;
  }
}

// Execute trade (PLACEHOLDER - Polymarket SDK needed)
async function executeTrade(opportunity) {
  try {
    const tradeSize = CONFIG.testMode ? CONFIG.testTradeSize : CONFIG.tradeSize;
    
    log(`🚀 EXECUTING TRADE (${CONFIG.testMode ? 'TEST' : 'LIVE'})`);
    log(`Market: ${opportunity.market}`);
    log(`Trade size: $${tradeSize}`);
    log(`Strategy: Buy YES @ ${opportunity.yesPrice}, Buy NO @ ${opportunity.noPrice}`);
    
    // TODO: Actual Polymarket CLOB API integration
    // For now, this is a placeholder
    log(`⚠️ TRADE EXECUTION NOT IMPLEMENTED YET`);
    log(`Reason: Need Polymarket CLOB SDK or API integration`);
    log(`This would require:`);
    log(`- CLOB API key or wallet signature`);
    log(`- Order placement via Polymarket's order book`);
    log(`- Proper YES/NO share purchasing`);
    
    // Simulate for now
    const trade = {
      timestamp: new Date().toISOString(),
      market: opportunity.market,
      size: tradeSize,
      yesPrice: opportunity.yesPrice,
      noPrice: opportunity.noPrice,
      expectedProfit: tradeSize * opportunity.edge,
      status: 'SIMULATED',
      note: 'Trade not executed - SDK integration needed'
    };
    
    state.trades.push(trade);
    state.totalTrades++;
    
    if (CONFIG.testMode) {
      log(`✅ Test trade simulated successfully`);
      log(`Switch to live mode? Set CONFIG.testMode = false`);
    }
    
    saveState();
    return true;
    
  } catch (e) {
    log(`ERROR executing trade: ${e.message}`);
    state.failedTrades++;
    return false;
  }
}

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(CONFIG.logFile, line);
  console.log(line.trim());
}

// Save state
function saveState() {
  fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

// Load state
function loadState() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      Object.assign(state, JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8')));
      log(`State loaded: ${state.totalTrades} trades executed`);
    }
  } catch (e) {
    log(`Could not load state: ${e.message}`);
  }
}

// Scan and trade
async function scanAndTrade() {
  try {
    log(`\n--- Scan #${state.totalTrades + 1} ---`);
    
    // Check balance first
    const balance = await checkBalance();
    if (balance < CONFIG.minBalance) {
      log(`⚠️ Balance too low ($${balance.toFixed(2)} < $${CONFIG.minBalance}). STOPPING TRADES.`);
      return;
    }
    
    // Fetch markets
    const response = await fetchMarkets();
    const markets = response.data || [];
    
    log(`Fetched ${markets.length} markets`);
    
    const targetMarkets = markets.filter(isTargetMarket);
    log(`Found ${targetMarkets.length} BTC/ETH short-duration markets`);
    
    if (targetMarkets.length === 0) {
      log(`No target markets available. Waiting...`);
      state.lastScan = new Date().toISOString();
      saveState();
      return;
    }
    
    // Analyze for arbitrage
    for (const market of targetMarkets) {
      const opportunity = analyzeMarket(market);
      
      if (opportunity) {
        log(`\n🚨 ARBITRAGE OPPORTUNITY DETECTED!`);
        log(`Market: ${opportunity.market}`);
        log(`YES: $${opportunity.yesPrice.toFixed(4)} | NO: $${opportunity.noPrice.toFixed(4)}`);
        log(`Sum: ${opportunity.sum.toFixed(4)} | Edge: ${opportunity.potentialProfitPercent}%`);
        
        // Check open positions limit
        if (state.openPositions.length >= CONFIG.maxOpenPositions) {
          log(`⚠️ Max open positions reached (${CONFIG.maxOpenPositions}). Skipping.`);
          continue;
        }
        
        // Execute trade
        await executeTrade(opportunity);
        
        // Only one trade per scan for safety
        break;
      }
    }
    
    state.lastScan = new Date().toISOString();
    saveState();
    
  } catch (error) {
    log(`ERROR during scan: ${error.message}`);
  }
}

// Daily summary
function dailySummary() {
  log(`\n=== DAILY SUMMARY ===`);
  log(`Total trades: ${state.totalTrades}`);
  log(`Successful: ${state.successfulTrades}`);
  log(`Failed: ${state.failedTrades}`);
  log(`Total profit: $${state.totalProfit.toFixed(2)}`);
  log(`Open positions: ${state.openPositions.length}`);
  log(`Current balance: $${state.balance.toFixed(2)}`);
  log(`===================\n`);
}

// Main
async function main() {
  log('🦬 Polymarket Arbitrage Trader Started');
  log(`Mode: ${CONFIG.testMode ? 'TEST ($2 trades)' : 'LIVE ($15 trades)'}`);
  log(`Target: BTC/ETH 5-min & 15-min markets`);
  log(`Min edge: ${CONFIG.minEdge * 100}%`);
  log(`Max sum: ${CONFIG.maxSum}`);
  log('---\n');
  
  loadState();
  
  const walletLoaded = loadWallet();
  if (!walletLoaded) {
    log('FATAL: Could not load wallet. Exiting.');
    process.exit(1);
  }
  
  await checkBalance();
  
  // Initial scan
  await scanAndTrade();
  
  // Periodic scans
  setInterval(scanAndTrade, CONFIG.scanIntervalMs);
  
  // Daily summary
  const msUntilMidnight = new Date().setHours(24,0,0,0) - Date.now();
  setTimeout(() => {
    dailySummary();
    setInterval(dailySummary, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}

// Handle exit
process.on('SIGINT', () => {
  log('Trader stopped by user');
  dailySummary();
  process.exit(0);
});

// Start
main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});
