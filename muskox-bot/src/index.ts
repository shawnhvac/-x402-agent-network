import 'dotenv/config';
import { bot } from './bot';
import { config } from './config';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Leaderboard storage
const leaderboardFile = path.join(__dirname, '../leaderboard.json');

interface LeaderboardEntry {
  player: string;
  score: number;
  timestamp: string;
}

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    if (fs.existsSync(leaderboardFile)) {
      const data = fs.readFileSync(leaderboardFile, 'utf-8');
      return JSON.parse(data).sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
    }
  } catch (e) {
    console.error('Error loading leaderboard:', e);
  }
  return [];
}

function saveLeaderboard(scores: LeaderboardEntry[]): void {
  try {
    fs.writeFileSync(leaderboardFile, JSON.stringify(scores, null, 2));
  } catch (e) {
    console.error('Error saving leaderboard:', e);
  }
}

function addScore(player: string, score: number): { rank: number; success: boolean } {
  const scores = loadLeaderboard();
  scores.push({ player, score, timestamp: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  
  // Keep only top 100
  const topScores = scores.slice(0, 100);
  saveLeaderboard(topScores);
  
  const rank = topScores.findIndex(s => s.player === player && s.score === score) + 1;
  return { rank, success: true };
}

// HTTP server for game and API
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Game file
  if (req.url === '/game.html' || req.url === '/game') {
    const gameFile = path.join(__dirname, '../public/game.html');
    if (fs.existsSync(gameFile)) {
      const content = fs.readFileSync(gameFile, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Game not found');
    }
    return;
  }

  // Leaderboard GET
  if (req.url === '/api/leaderboard' && req.method === 'GET') {
    const scores = loadLeaderboard();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ scores }));
    return;
  }

  // Leaderboard POST
  if (req.url === '/api/leaderboard' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const result = addScore(data.player, data.score);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

const PORT = config.port;

// Start HTTP server
server.listen(PORT, () => {
  console.log(`🟢 HTTP server running on port ${PORT}`);
  console.log(`   Game: http://localhost:${PORT}/game.html`);
  console.log(`   API: http://localhost:${PORT}/api/leaderboard`);
});

// Start Telegram bot
(async () => {
  try {
    if (!config.telegramToken || config.telegramToken.includes('your_bot_token')) {
      console.error('\n❌ TELEGRAM_BOT_TOKEN not set in .env file!');
      console.error('\nHow to get your bot token:');
      console.error('1. Open Telegram and search for @BotFather');
      console.error('2. Send /start');
      console.error('3. Send /newbot and follow the steps');
      console.error('4. Copy the token (looks like: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)');
      console.error('5. Paste it in .env as: TELEGRAM_BOT_TOKEN=your_token_here');
      console.error('\nThen restart the bot.\n');
      process.exit(1);
    }

    console.log('🦬 Starting $MUSKOX Telegram Bot...');
    await bot.start({
      onStart: () => {
        console.log('✅ $MUSKOX Bot is LIVE and listening for messages');
        console.log(`📱 Bot Token: ${config.telegramToken.substring(0, 10)}...`);
        console.log(`💰 Treasury: ${config.treasuryWallet}`);
        console.log(`🌐 RPC: ${config.heliusRpc.substring(0, 50)}...`);
        console.log(`\n🚀 Bot is ready! Users can find it on Telegram and start sniping.\n`);
      },
    });
  } catch (error) {
    console.error('❌ Bot startup failed:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  await bot.stop();
  server.close();
  process.exit(0);
});
