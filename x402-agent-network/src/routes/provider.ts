import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_DIR = '/var/lib/agentpay';
const DB_PATH = path.join(DB_DIR, 'providers.db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS providers (
    id          TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    phone       TEXT,
    password_hash TEXT,
    category    TEXT,
    address     TEXT,
    city        TEXT,
    lat         REAL,
    lon         REAL,
    description TEXT,
    status      TEXT DEFAULT 'active',
    token       TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS provider_services (
    id          TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    category    TEXT,
    price       REAL DEFAULT 0,
    duration    INTEGER DEFAULT 60,
    available   INTEGER DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);
// Migrations — add columns if missing
const providerCols = (db.prepare("PRAGMA table_info(providers)").all() as any[]).map((c:any) => c.name);
if (!providerCols.includes('token'))       try { db.exec('ALTER TABLE providers ADD COLUMN token TEXT'); } catch {}
if (!providerCols.includes('address'))     try { db.exec('ALTER TABLE providers ADD COLUMN address TEXT'); } catch {}
if (!providerCols.includes('city'))        try { db.exec('ALTER TABLE providers ADD COLUMN city TEXT'); } catch {}
if (!providerCols.includes('lat'))         try { db.exec('ALTER TABLE providers ADD COLUMN lat REAL'); } catch {}
if (!providerCols.includes('lon'))         try { db.exec('ALTER TABLE providers ADD COLUMN lon REAL'); } catch {}
if (!providerCols.includes('description')) try { db.exec('ALTER TABLE providers ADD COLUMN description TEXT'); } catch {}

console.log('[ProviderDB] SQLite ready at', DB_PATH);

const router = Router();
const hashPassword = (p: string) => crypto.createHash('sha256').update(p + 'agentpay_salt').digest('hex');
const makeToken    = () => crypto.randomBytes(32).toString('hex');

// ── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req: any, res: Response, next: Function) {
  const token = req.headers['x-provider-token'] as string;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const provider = db.prepare('SELECT * FROM providers WHERE token = ?').get(token) as any;
  if (!provider) return res.status(401).json({ error: 'Invalid token' });
  req.provider = provider;
  next();
}

// ── POST /api/v1/provider/register ──────────────────────────────────────────
router.post('/register', (req: Request, res: Response) => {
  try {
    const { businessName, email, phone, password, category, address, city, lat, lon, description } = req.body;
    if (!businessName || !email || !password) return res.status(400).json({ error: 'businessName, email and password required' });
    const existing = db.prepare('SELECT id FROM providers WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const id = 'prov_' + Date.now();
    const token = makeToken();
    db.prepare(`
      INSERT INTO providers (id, business_name, email, phone, password_hash, category, address, city, lat, lon, description, token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, businessName, email.toLowerCase().trim(), phone || null,
           hashPassword(password), category || null, address || null,
           city || null, lat || null, lon || null, description || null, token);
    console.log('[Provider] Registered:', email, businessName);
    res.json({ success: true, token, providerId: id });
  } catch (err: any) {
    console.error('[Provider] Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/v1/provider/login ──────────────────────────────────────────────
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const provider = db.prepare('SELECT * FROM providers WHERE email = ?').get(email?.toLowerCase().trim()) as any;
    if (!provider || provider.password_hash !== hashPassword(password))
      return res.status(401).json({ error: 'Invalid credentials' });
    if (provider.status !== 'active') return res.status(403).json({ error: 'Account suspended' });
    const token = makeToken();
    db.prepare('UPDATE providers SET token = ? WHERE id = ?').run(token, provider.id);
    console.log('[Provider] Login:', email);
    res.json({ success: true, token, provider: { id: provider.id, businessName: provider.business_name, email: provider.email, phone: provider.phone, category: provider.category, address: provider.address, city: provider.city } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/v1/provider/profile ─────────────────────────────────────────────
router.get('/profile', requireAuth, (req: any, res: Response) => {
  const p = req.provider;
  const services = db.prepare('SELECT * FROM provider_services WHERE provider_id = ? AND available = 1').all(p.id);
  res.json({ success: true, provider: { id: p.id, businessName: p.business_name, email: p.email, phone: p.phone, category: p.category, address: p.address, city: p.city, lat: p.lat, lon: p.lon, description: p.description }, services });
});

// ── PUT /api/v1/provider/profile ─────────────────────────────────────────────
router.put('/profile', requireAuth, (req: any, res: Response) => {
  try {
    const { businessName, phone, category, address, city, lat, lon, description } = req.body;
    db.prepare(`
      UPDATE providers SET
        business_name = COALESCE(?, business_name),
        phone         = COALESCE(?, phone),
        category      = COALESCE(?, category),
        address       = COALESCE(?, address),
        city          = COALESCE(?, city),
        lat           = COALESCE(?, lat),
        lon           = COALESCE(?, lon),
        description   = COALESCE(?, description)
      WHERE id = ?
    `).run(businessName||null, phone||null, category||null, address||null, city||null, lat||null, lon||null, description||null, req.provider.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/v1/provider/services ────────────────────────────────────────────
router.get('/services', requireAuth, (req: any, res: Response) => {
  const services = db.prepare('SELECT * FROM provider_services WHERE provider_id = ?').all(req.provider.id);
  res.json({ success: true, services });
});

// ── POST /api/v1/provider/services ───────────────────────────────────────────
// Sync full services list from the Android app
router.post('/services', requireAuth, (req: any, res: Response) => {
  try {
    const { services } = req.body;
    if (!Array.isArray(services)) return res.status(400).json({ error: 'services must be an array' });
    // Replace all services for this provider
    db.prepare('DELETE FROM provider_services WHERE provider_id = ?').run(req.provider.id);
    const insert = db.prepare(`
      INSERT INTO provider_services (id, provider_id, name, category, price, duration, available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((svcs: any[]) => {
      for (const s of svcs) {
        insert.run(s.id || ('svc_' + Date.now() + Math.random()), req.provider.id, s.name, s.category || req.provider.category, s.price || 0, s.duration || 60, s.available !== false ? 1 : 0);
      }
    });
    insertMany(services);
    console.log(`[Provider] Synced ${services.length} services for ${req.provider.email}`);
    res.json({ success: true, count: services.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/v1/provider/services/:id ─────────────────────────────────────
router.delete('/services/:id', requireAuth, (req: any, res: Response) => {
  db.prepare('DELETE FROM provider_services WHERE id = ? AND provider_id = ?').run(req.params.id, req.provider.id);
  res.json({ success: true });
});

// ── GET /api/v1/provider/bookings ────────────────────────────────────────────
router.get('/bookings', requireAuth, (req: any, res: Response) => {
  try {
    const bdb = new Database('/var/lib/agentpay/bookings.db');
    const bookings = bdb.prepare(
      "SELECT * FROM bookings WHERE provider_phone = ? OR provider_email = ? ORDER BY created_at DESC LIMIT 50"
    ).all(req.provider.phone, req.provider.email);
    res.json({ success: true, bookings });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/v1/provider/logout ─────────────────────────────────────────────
router.post('/logout', requireAuth, (req: any, res: Response) => {
  db.prepare('UPDATE providers SET token = NULL WHERE id = ?').run(req.provider.id);
  res.json({ success: true });
});

// ── GET /api/v1/provider/list — public, for agents ───────────────────────────
router.get('/list', (req: Request, res: Response) => {
  const { category, city, q } = req.query as any;
  let sql = `
    SELECT p.id, p.business_name, p.category, p.phone, p.address, p.city, p.lat, p.lon, p.description,
           json_group_array(json_object('id', s.id, 'name', s.name, 'category', s.category, 'price', s.price, 'duration', s.duration)) as services
    FROM providers p
    LEFT JOIN provider_services s ON s.provider_id = p.id AND s.available = 1
    WHERE p.status = 'active'
  `;
  const params: any[] = [];
  if (category) { sql += ' AND (p.category LIKE ? OR s.category LIKE ?)'; params.push(`%${category}%`, `%${category}%`); }
  if (city)     { sql += ' AND p.city LIKE ?'; params.push(`%${city}%`); }
  if (q)        { sql += ' AND (p.business_name LIKE ? OR p.description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  sql += ' GROUP BY p.id LIMIT 50';
  const providers = db.prepare(sql).all(...params).map((p: any) => ({
    ...p,
    services: (() => { try { return JSON.parse(p.services).filter((s:any) => s.id); } catch { return []; } })()
  }));
  res.json({ success: true, count: providers.length, providers });
});

export default router;
