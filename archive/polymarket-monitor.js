#!/usr/bin/env node
/**
 * Polymarket Sum-to-One Arbitrage Monitor
 * READ-ONLY MODE - Alerts only, no trades
 */

const https = require('https');
const fs = require('fs');

// Configuration
const CONFIG = {
  scanIntervalMs: 60000, // 1 minute
  minEdge: 0.01, // 1% minimum edge (sum < 0.99)
  maxSum: 0.99,
  targetDurations: ['5 minute', '15 minute', '5-minute', '15-minute'],
  targetAssets: ['BTC', 'Bitcoin', 'ETH', 'Ethereum'],
  logFile: '/root/.openclaw/workspace/polymarket-monitor.log',
  alertsFile: '/root/.openclaw/workspace/polymarket-alerts.json',
  fee: 0.02 // 2% fee estimate
};

// State
const state = {
  alerts: [],
  lastScan: null,
  totalScans: 0,
  opportunitiesFound: 0
};

// Fetch markets from Polymarket API
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

// Check if market matches our criteria
function isTargetMarket(market) {
  const question = (market.question || '').toLowerCase();
  
  // Check for target assets
  const hasAsset = CONFIG.targetAssets.some(asset => 
    question.includes(asset.toLowerCase())
  );
  
  // Check for short duration
  const hasShortDuration = CONFIG.targetDurations.some(dur => 
    question.includes(dur.toLowerCase())
  );
  
  // Must be active and not closed
  const isActive = market.active === true && market.closed === false;
  
  return hasAsset && hasShortDuration && isActive;
}

// Calculate sum-to-one opportunity
function analyzeMarket(market) {
  try {
    // Polymarket uses tokens[0] = YES, tokens[1] = NO (usually)
    const yesPrice = parseFloat(market.tokens?.[0]?.price || 0);
    const noPrice = parseFloat(market.tokens?.[1]?.price || 0);
    
    if (!yesPrice || !noPrice) return null;
    
    const sum = yesPrice + noPrice;
    const edge = 1 - sum - CONFIG.fee;
    
    if (sum < CONFIG.maxSum && edge > CONFIG.minEdge) {
      return {
        market: market.question,
        conditionId: market.condition_id,
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

// Log to file
function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(CONFIG.logFile, line);
  console.log(line.trim());
}

// Send Telegram alert
function sendAlert(opportunity) {
  // Alert will be sent via external message tool
  log(`🚨 ARBITRAGE OPPORTUNITY FOUND!`);
  log(`Market: ${opportunity.market}`);
  log(`YES: $${opportunity.yesPrice.toFixed(4)} | NO: $${opportunity.noPrice.toFixed(4)}`);
  log(`Sum: ${opportunity.sum.toFixed(4)} (< 0.99 ✓)`);
  log(`Potential Profit: ${opportunity.potentialProfitPercent}% after fees`);
  log(`Volume: $${opportunity.volume.toLocaleString()}`);
  log(`Liquidity: $${opportunity.liquidity.toLocaleString()}`);
  log(`Closes: ${opportunity.closesAt}`);
  log(`---`);
  
  state.alerts.push({
    timestamp: new Date().toISOString(),
    ...opportunity
  });
  
  saveState();
}

// Save state
function saveState() {
  fs.writeFileSync(CONFIG.alertsFile, JSON.stringify(state, null, 2));
}

// Scan markets
async function scanMarkets() {
  try {
    log(`Starting scan #${state.totalScans + 1}...`);
    
    const response = await fetchMarkets();
    const markets = response.data || [];
    
    log(`Fetched ${markets.length} markets`);
    
    const targetMarkets = markets.filter(isTargetMarket);
    log(`Found ${targetMarkets.length} target markets (short-duration BTC/ETH)`);
    
    let foundOpportunities = 0;
    
    for (const market of targetMarkets) {
      const opportunity = analyzeMarket(market);
      if (opportunity) {
        sendAlert(opportunity);
        foundOpportunities++;
        state.opportunitiesFound++;
      }
    }
    
    if (foundOpportunities === 0) {
      log(`No arbitrage opportunities found (all sums >= ${CONFIG.maxSum})`);
    }
    
    state.totalScans++;
    state.lastScan = new Date().toISOString();
    saveState();
    
  } catch (error) {
    log(`ERROR during scan: ${error.message}`);
  }
}

// Daily summary
function dailySummary() {
  const today = new Date().toISOString().split('T')[0];
  const todayAlerts = state.alerts.filter(a => a.timestamp.startsWith(today));
  
  log(`\n=== DAILY SUMMARY (${today}) ===`);
  log(`Total scans today: ${state.totalScans}`);
  log(`Opportunities found: ${todayAlerts.length}`);
  
  if (todayAlerts.length > 0) {
    log(`\nTop opportunities:`);
    todayAlerts
      .sort((a, b) => b.edge - a.edge)
      .slice(0, 5)
      .forEach((opp, i) => {
        log(`${i + 1}. ${opp.market.substring(0, 60)}...`);
        log(`   Edge: ${opp.potentialProfitPercent}% | Sum: ${opp.sum.toFixed(4)}`);
      });
  }
  
  log(`================================\n`);
}

// Main loop
async function main() {
  log('🦬 Polymarket Arbitrage Monitor Started');
  log('Mode: READ-ONLY (alerts only, no trades)');
  log(`Scan interval: ${CONFIG.scanIntervalMs / 1000}s`);
  log(`Min edge: ${CONFIG.minEdge * 100}%`);
  log(`Max sum: ${CONFIG.maxSum}`);
  log('---\n');
  
  // Initial scan
  await scanMarkets();
  
  // Periodic scans
  setInterval(scanMarkets, CONFIG.scanIntervalMs);
  
  // Daily summary at midnight
  const msUntilMidnight = new Date().setHours(24,0,0,0) - Date.now();
  setTimeout(() => {
    dailySummary();
    setInterval(dailySummary, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}

// Handle exit
process.on('SIGINT', () => {
  log('Monitor stopped by user');
  dailySummary();
  process.exit(0);
});

// Start
main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});
