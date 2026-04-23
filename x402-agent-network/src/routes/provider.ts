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
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'active',
    token TEXT,
    created_at TEXT NOT NULL
  );
`);
// Migration: add token column if missing
try { db.exec('ALTER TABLE providers ADD COLUMN token TEXT'); } catch {}
console.log('[ProviderDB] SQLite ready at', DB_PATH);

const router = Router();

function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw + 'agentpay-salt-2026').digest('hex');
}

// ── POST /api/v1/provider/register ───────────────────────────────
router.post('/register', (req: Request, res: Response) => {
  try {
    const { businessName, email, phone, password, category } = req.body;
    if (!businessName || !email || !password) {
      return res.status(400).json({ error: 'Business name, email, and password are required.' });
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    // Check duplicate
    const existing = db.prepare('SELECT id FROM providers WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO providers (id, business_name, email, phone, password_hash, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, businessName.trim(), email.toLowerCase().trim(), phone ?? '', hashPassword(password), category ?? '', new Date().toISOString());

    console.log('[Provider] Registered:', email, businessName);
    return res.json({ ok: true, id, message: 'Account created successfully.' });
  } catch (err: any) {
    console.error('[Provider] Register error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/v1/provider/login ───────────────────────────────────
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const provider = db.prepare('SELECT * FROM providers WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!provider || provider.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (provider.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('UPDATE providers SET token = ? WHERE id = ?').run(token, provider.id);
    console.log('[Provider] Login:', email);
    return res.json({
      ok: true,
      token,
      provider: {
        id: provider.id,
        businessName: provider.business_name,
        email: provider.email,
        phone: provider.phone,
        category: provider.category
      }
    });
  } catch (err: any) {
    console.error('[Provider] Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});


// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAuth(req: any, res: Response, next: any) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const provider = db.prepare('SELECT * FROM providers WHERE token = ?').get(token) as any;
  if (!provider) return res.status(401).json({ error: 'Invalid token' });
  req.provider = provider;
  next();
}

// ── GET /profile ──────────────────────────────────────────────────────────────
router.get('/profile', requireAuth, (req: any, res: Response) => {
  const p = req.provider;
  return res.json({
    ok: true,
    provider: {
      id: p.id,
      businessName: p.business_name,
      email: p.email,
      phone: p.phone,
      category: p.category,
      status: p.status,
      createdAt: p.created_at,
    }
  });
});

// ── PUT /profile — update business info ───────────────────────────────────────
router.put('/profile', requireAuth, (req: any, res: Response) => {
  const { businessName, phone, category } = req.body;
  try {
    db.prepare(
      'UPDATE providers SET business_name = COALESCE(?, business_name), phone = COALESCE(?, phone), category = COALESCE(?, category) WHERE id = ?'
    ).run(businessName || null, phone || null, category || null, req.provider.id);
    return res.json({ ok: true, message: 'Profile updated.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Update failed.' });
  }
});

// ── GET /bookings — provider's incoming bookings ──────────────────────────────
router.get('/bookings', requireAuth, (req: any, res: Response) => {
  try {
    const bookingsDb = new Database('/var/lib/agentpay/bookings.db');
    const bookings = bookingsDb.prepare(
      "SELECT * FROM bookings WHERE provider_phone = ? OR provider_email = ? ORDER BY created_at DESC LIMIT 50"
    ).all(req.provider.phone, req.provider.email);
    return res.json({ ok: true, bookings });
  } catch (err: any) {
    console.error('[Provider] bookings error:', err);
    return res.json({ ok: true, bookings: [] });
  }
});

// ── POST /booking/:id/respond — confirm or decline a booking ─────────────────
router.post('/booking/:id/respond', requireAuth, (req: any, res: Response) => {
  const { id } = req.params;
  const { action } = req.body; // "confirm" or "decline"
  if (!['confirm', 'decline'].includes(action)) {
    return res.status(400).json({ error: 'action must be confirm or decline' });
  }
  try {
    const bookingsDb = new Database('/var/lib/agentpay/bookings.db');
    const status = action === 'confirm' ? 'confirmed' : 'declined';
    bookingsDb.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
    return res.json({ ok: true, status });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to respond.' });
  }
});

// ── POST /logout ──────────────────────────────────────────────────────────────
router.post('/logout', requireAuth, (req: any, res: Response) => {
  try {
    db.prepare("UPDATE providers SET token = NULL WHERE id = ?").run(req.provider.id);
    return res.json({ ok: true });
  } catch {
    return res.json({ ok: true });
  }
});


export default router;
