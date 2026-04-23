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
    created_at TEXT NOT NULL
  );
`);
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

export default router;
