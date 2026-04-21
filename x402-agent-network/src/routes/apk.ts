import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const APK_PATH = path.join(__dirname, '../../public/download/agentpay-latest.apk');

/**
 * GET /api/apk/status
 * Returns APK status (available, size, last built)
 */
router.get('/status', (req, res) => {
  try {
    if (fs.existsSync(APK_PATH)) {
      const stats = fs.statSync(APK_PATH);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
      
      res.json({
        status: 'available',
        filename: 'agentpay-latest.apk',
        path: '/download/agentpay-latest.apk',
        size: stats.size,
        sizeLabel: `${sizeInMB} MB`,
        lastModified: stats.mtime,
        buildDate: stats.mtime.toISOString(),
        downloadUrl: 'https://x402-agent-pay.com/download/agentpay-latest.apk'
      });
    } else {
      res.status(404).json({
        status: 'not_found',
        message: 'APK file not found',
        expectedPath: APK_PATH
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/apk/download
 * Downloads the APK file
 */
router.get('/download', (req, res) => {
  try {
    if (!fs.existsSync(APK_PATH)) {
      return res.status(404).json({
        status: 'error',
        message: 'APK file not found'
      });
    }
    
    const stats = fs.statSync(APK_PATH);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', 'attachment; filename="agentpay-latest.apk"');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const fileStream = fs.createReadStream(APK_PATH);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('Error streaming APK:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download APK' });
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/apk/info
 * Returns full APK build information
 */
router.get('/info', (req, res) => {
  try {
    if (fs.existsSync(APK_PATH)) {
      const stats = fs.statSync(APK_PATH);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(1);
      
      res.json({
        app: 'AgentPay',
        version: '1.0.0',
        buildType: 'debug',
        agentSystem: {
          status: 'integrated',
          components: 5,
          linesOfCode: 1946,
          features: [
            'Autonomous decision-making',
            'SmartEscrow integration',
            'Transaction signing',
            'HTTP API (6 endpoints)',
            'Real-time monitoring'
          ]
        },
        apk: {
          filename: 'agentpay-latest.apk',
          size: stats.size,
          sizeLabel: `${sizeInMB} MB`,
          lastBuilt: stats.mtime.toISOString(),
          downloadUrl: '/download/agentpay-latest.apk'
        },
        tabs: [
          '🎤 Voice',
          '⚙️ Settings',
          '📋 History',
          '💰 Wallet',
          '🤖 Agent (NEW)'
        ],
        requirements: {
          androidVersion: '9.0+',
          apiLevel: 28,
          minSize: '29 MB'
        }
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'APK not available'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
