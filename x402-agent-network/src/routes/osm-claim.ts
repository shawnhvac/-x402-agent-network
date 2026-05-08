import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import crypto from 'crypto';

const router = Router();
const DB_PATH = '/var/lib/agentpay/providers.db';

function getDb() { return new Database(DB_PATH); }

// Store pending claims in DB
const db = getDb();
db.exec(`
  CREATE TABLE IF NOT EXISTS osm_claims (
    id          TEXT PRIMARY KEY,
    osm_id      TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    osm_phone   TEXT,
    verify_code TEXT NOT NULL,
    status      TEXT DEFAULT 'pending',
    created_at  TEXT DEFAULT (datetime('now')),
    expires_at  TEXT NOT NULL
  );
`);
try { db.exec('ALTER TABLE providers ADD COLUMN osm_id TEXT'); } catch {}
try { db.exec('ALTER TABLE providers ADD COLUMN verified INTEGER DEFAULT 0'); } catch {}

function requireAuth(req: any, res: Response, next: Function) {
  const token = req.headers['x-provider-token'] as string;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const provider = getDb().prepare('SELECT * FROM providers WHERE token = ?').get(token) as any;
  if (!provider) return res.status(401).json({ error: 'Invalid token' });
  req.provider = provider;
  next();
}

// ── GET /api/v1/osm-claim/lookup?q=business+name&lat=33.6&lon=-112.1 ─────────
router.get('/lookup', requireAuth, async (req: any, res: Response) => {
  const { q, lat, lon } = req.query as any;
  if (!q) return res.status(400).json({ error: 'q (business name) required' });

  try {
    const params = new URLSearchParams({ q, format: 'json', limit: '5', addressdetails: '1', extratags: '1' });
    if (lat && lon) { params.set('lat', lat); params.set('lon', lon); }
    const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'User-Agent': 'AgentPay/2.0' }, signal: AbortSignal.timeout(8000) });
    const results = await r.json() as any[];

    const matches = results.map((item: any) => ({
      osm_id:   item.osm_type + '/' + item.osm_id,
      name:     item.display_name.split(',')[0],
      address:  item.display_name,
      phone:    item.extratags?.phone || item.extratags?.['contact:phone'] || null,
      lat:      parseFloat(item.lat),
      lon:      parseFloat(item.lon),
      already_claimed: !!getDb().prepare('SELECT id FROM providers WHERE osm_id = ?').get(item.osm_type + '/' + item.osm_id),
    }));

    res.json({ success: true, matches });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/osm-claim/start — initiate claim, return code (email verify replaces SMS) ──
router.post('/start', requireAuth, async (req: any, res: Response) => {
  const { osm_id, osm_phone, osm_name } = req.body;
  if (!osm_id) return res.status(400).json({ error: 'osm_id required' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const claimId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  getDb().prepare(
    'INSERT INTO osm_claims (id, osm_id, provider_id, osm_phone, verify_code, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(claimId, osm_id, req.provider.id, osm_phone || null, code, expiresAt);

  // NOTE: SMS verification removed (Twilio removed). Code returned directly for now.
  // In production: send code via email using sendEmailNotification.
  console.log(`[OSM-Claim] Claim ${claimId} code: ${code} for provider ${req.provider.id}`);

  res.json({
    success: true,
    claimId,
    message: 'Verification code generated. Check server logs or integrate email delivery.',
    // dev-only: expose code so client can verify without SMS
    dev_code: process.env.NODE_ENV !== 'production' ? code : undefined,
  });
});

// ── POST /api/v1/osm-claim/verify ─────────────────────────────────
router.post('/verify', requireAuth, async (req: any, res: Response) => {
  const { claim_id, code } = req.body;
  if (!claim_id || !code) return res.status(400).json({ error: 'claim_id and code required' });

  const claim = getDb().prepare('SELECT * FROM osm_claims WHERE id = ?').get(claim_id) as any;
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  if (claim.status !== 'pending') return res.status(400).json({ error: 'Claim already processed' });
  if (new Date(claim.expires_at) < new Date()) return res.status(400).json({ error: 'Code expired' });
  if (claim.verify_code !== code) return res.status(400).json({ error: 'Invalid code' });

  getDb().prepare('UPDATE osm_claims SET status = ? WHERE id = ?').run('verified', claim_id);
  getDb().prepare('UPDATE providers SET osm_id = ?, verified = 1 WHERE id = ?').run(claim.osm_id, req.provider.id);

  res.json({ success: true, message: 'Business verified successfully', osm_id: claim.osm_id });
});

export default router;
