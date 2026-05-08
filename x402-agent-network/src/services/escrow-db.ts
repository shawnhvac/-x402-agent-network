import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join('/var/lib/agentpay', 'bookings.db');
const db = new Database(DB_PATH);

// Add escrow columns to bookings table
const cols = (db.prepare("PRAGMA table_info(bookings)").all() as any[]).map((c: any) => c.name);

if (!cols.includes('escrow_status'))       db.exec("ALTER TABLE bookings ADD COLUMN escrow_status TEXT DEFAULT 'none'");
if (!cols.includes('escrow_amount'))       db.exec("ALTER TABLE bookings ADD COLUMN escrow_amount REAL DEFAULT 0");
if (!cols.includes('escrow_tx_hash'))      db.exec("ALTER TABLE bookings ADD COLUMN escrow_tx_hash TEXT");
if (!cols.includes('escrow_wallet'))       db.exec("ALTER TABLE bookings ADD COLUMN escrow_wallet TEXT");
if (!cols.includes('payment_method'))      db.exec("ALTER TABLE bookings ADD COLUMN payment_method TEXT DEFAULT 'stripe'");
if (!cols.includes('stripe_payment_id'))   db.exec("ALTER TABLE bookings ADD COLUMN stripe_payment_id TEXT");
if (!cols.includes('consumer_confirmed'))  db.exec("ALTER TABLE bookings ADD COLUMN consumer_confirmed INTEGER DEFAULT 0");
if (!cols.includes('provider_confirmed'))  db.exec("ALTER TABLE bookings ADD COLUMN provider_confirmed INTEGER DEFAULT 0");
if (!cols.includes('released_at'))         db.exec("ALTER TABLE bookings ADD COLUMN released_at TEXT");
if (!cols.includes('dispute_at'))          db.exec("ALTER TABLE bookings ADD COLUMN dispute_at TEXT");
if (!cols.includes('consumer_wallet'))     db.exec("ALTER TABLE bookings ADD COLUMN consumer_wallet TEXT");
if (!cols.includes('provider_wallet'))     db.exec("ALTER TABLE bookings ADD COLUMN provider_wallet TEXT");

// Escrow ledger — all hold/release/refund events
db.exec(`
  CREATE TABLE IF NOT EXISTS escrow_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id   TEXT NOT NULL,
    event        TEXT NOT NULL,
    amount       REAL,
    tx_hash      TEXT,
    actor        TEXT,
    note         TEXT,
    created_at   TEXT DEFAULT (datetime('now'))
  );
`);

console.log('[EscrowDB] Migrations applied ✅');
export { db };
