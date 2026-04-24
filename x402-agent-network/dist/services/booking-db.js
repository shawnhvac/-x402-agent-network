import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
// Store DB in /var/lib/agentpay/ for persistence across deploys
const DB_DIR = '/var/lib/agentpay';
const DB_PATH = path.join(DB_DIR, 'bookings.db');
if (!fs.existsSync(DB_DIR))
    fs.mkdirSync(DB_DIR, { recursive: true });
const db = new Database(DB_PATH);
// ── Schema ────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'pending',
    business_name TEXT,
    phone TEXT,
    email TEXT,
    service_type TEXT,
    customer_name TEXT,
    customer_email TEXT,
    date TEXT,
    time TEXT,
    price REAL,
    fee REAL,
    net REAL,
    notification_method TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    confirmed_at TEXT,
    declined_at TEXT
  );

  CREATE TABLE IF NOT EXISTS booking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id TEXT NOT NULL,
    event TEXT NOT NULL,
    source TEXT,
    data TEXT,
    created_at TEXT NOT NULL
  );
`);
console.log('[BookingDB] SQLite ready at', DB_PATH);
// ── CRUD ──────────────────────────────────────────────────────────
export function createBooking(booking) {
    const now = new Date().toISOString();
    const record = { ...booking, created_at: now, updated_at: now, status: booking.status ?? 'pending' };
    db.prepare(`
    INSERT INTO bookings (id, status, business_name, phone, email, service_type, customer_name, customer_email,
      date, time, price, fee, net, notification_method, created_at, updated_at)
    VALUES (@id, @status, @business_name, @phone, @email, @service_type, @customer_name, @customer_email,
      @date, @time, @price, @fee, @net, @notification_method, @created_at, @updated_at)
  `).run(record);
    logEvent(booking.id, 'created', 'system', {});
    return record;
}
export function getBooking(id) {
    return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
}
export function updateBookingStatus(id, status, extra = {}, source = 'system') {
    const now = new Date().toISOString();
    const fields = ['status = @status', 'updated_at = @updated_at'];
    const params = { id, status, updated_at: now };
    if (status === 'confirmed') {
        fields.push('confirmed_at = @confirmed_at');
        params.confirmed_at = now;
    }
    if (status === 'declined') {
        fields.push('declined_at = @declined_at');
        params.declined_at = now;
    }
    if (extra.notification_method) {
        fields.push('notification_method = @notification_method');
        params.notification_method = extra.notification_method;
    }
    const result = db.prepare(`UPDATE bookings SET ${fields.join(', ')} WHERE id = @id`).run(params);
    if (result.changes > 0)
        logEvent(id, `status_${status}`, source, extra);
    return result.changes > 0;
}
export function findPendingByPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const all = db.prepare("SELECT * FROM bookings WHERE status = 'pending'").all();
    return all.find(b => (b.phone ?? '').replace(/\D/g, '') === cleaned);
}
export function listBookings(limit = 50, offset = 0) {
    return db.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
}
export function getStats() {
    const total = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
    const pending = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status='pending'").get().c;
    const confirmed = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status='confirmed'").get().c;
    const declined = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status='declined'").get().c;
    const revenue = db.prepare("SELECT SUM(fee) as s FROM bookings WHERE status='confirmed'").get().s ?? 0;
    return { total, pending, confirmed, declined, revenue_usd: Math.round(revenue * 100) / 100 };
}
function logEvent(bookingId, event, source, data) {
    db.prepare('INSERT INTO booking_events (booking_id, event, source, data, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(bookingId, event, source, JSON.stringify(data), new Date().toISOString());
}
export default db;
//# sourceMappingURL=booking-db.js.map