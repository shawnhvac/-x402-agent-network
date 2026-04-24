import { Router } from 'express';
import Database from 'better-sqlite3';
import twilio from 'twilio';
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
try {
    db.exec('ALTER TABLE providers ADD COLUMN osm_id TEXT');
}
catch { }
try {
    db.exec('ALTER TABLE providers ADD COLUMN verified INTEGER DEFAULT 0');
}
catch { }
const tw = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
function requireAuth(req, res, next) {
    const token = req.headers['x-provider-token'];
    if (!token)
        return res.status(401).json({ error: 'Missing token' });
    const provider = getDb().prepare('SELECT * FROM providers WHERE token = ?').get(token);
    if (!provider)
        return res.status(401).json({ error: 'Invalid token' });
    req.provider = provider;
    next();
}
// ── GET /api/v1/osm-claim/lookup?q=business+name&lat=33.6&lon=-112.1 ─────────
// Called from the app to search OSM for the provider's own business
router.get('/lookup', requireAuth, async (req, res) => {
    const { q, lat, lon } = req.query;
    if (!q)
        return res.status(400).json({ error: 'q (business name) required' });
    try {
        // Search Nominatim for the business
        const params = new URLSearchParams({ q, format: 'json', limit: '5', addressdetails: '1', extratags: '1' });
        if (lat && lon) {
            params.set('lat', lat);
            params.set('lon', lon);
        }
        const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { 'User-Agent': 'AgentPay/2.0' }, signal: AbortSignal.timeout(8000) });
        const results = await r.json();
        const matches = results.map((item) => ({
            osm_id: item.osm_type + '/' + item.osm_id,
            name: item.display_name.split(',')[0],
            address: item.display_name,
            phone: item.extratags?.phone || item.extratags?.['contact:phone'] || null,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            already_claimed: !!getDb().prepare('SELECT id FROM providers WHERE osm_id = ?').get(item.osm_type + '/' + item.osm_id),
        }));
        res.json({ success: true, matches });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ── POST /api/v1/osm-claim/start — initiate claim, send SMS verification ─────
router.post('/start', requireAuth, async (req, res) => {
    const { osm_id, osm_phone, osm_name } = req.body;
    if (!osm_id)
        return res.status(400).json({ error: 'osm_id required' });
    // Check if already claimed by someone else
    const existing = getDb().prepare('SELECT id, business_name FROM providers WHERE osm_id = ?').get(osm_id);
    if (existing && existing.id !== req.provider.id) {
        return res.status(409).json({ error: 'This business has already been claimed by another provider.' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const claimId = 'claim_' + Date.now();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
    // Delete any existing pending claim for this provider+osm combo
    getDb().prepare('DELETE FROM osm_claims WHERE provider_id = ? AND osm_id = ?').run(req.provider.id, osm_id);
    getDb().prepare('INSERT INTO osm_claims (id, osm_id, provider_id, osm_phone, verify_code, expires_at) VALUES (?, ?, ?, ?, ?, ?)').run(claimId, osm_id, req.provider.id, osm_phone || null, code, expires);
    let smsSent = false;
    let verifyPhone = osm_phone || req.provider.phone;
    if (verifyPhone) {
        // Clean phone number
        verifyPhone = verifyPhone.replace(/\D/g, '');
        if (verifyPhone.length === 10)
            verifyPhone = '1' + verifyPhone;
        verifyPhone = '+' + verifyPhone;
        try {
            await tw.messages.create({
                to: verifyPhone,
                from: process.env.TWILIO_PHONE_NUMBER,
                body: `AgentPay verification: Your code to claim "${osm_name || 'your business'}" is ${code}. Expires in 15 minutes.`
            });
            smsSent = true;
            console.log(`[Claim] Sent verification code to ${verifyPhone} for ${osm_id}`);
        }
        catch (err) {
            console.error('[Claim] SMS failed:', err.message);
        }
    }
    res.json({
        success: true,
        claim_id: claimId,
        sms_sent: smsSent,
        verify_phone: smsSent ? verifyPhone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '+1 ($2) $3-$4') : null,
        message: smsSent
            ? `Verification code sent to ${verifyPhone.slice(-4).padStart(verifyPhone.length, '*')}. Enter it in the app.`
            : 'No phone found on this OSM listing. Enter the code we\'ll send to your registered phone.',
    });
});
// ── POST /api/v1/osm-claim/verify — confirm code and claim the business ───────
router.post('/verify', requireAuth, async (req, res) => {
    const { claim_id, code, osm_id } = req.body;
    if (!claim_id || !code)
        return res.status(400).json({ error: 'claim_id and code required' });
    const claim = getDb().prepare("SELECT * FROM osm_claims WHERE id = ? AND provider_id = ? AND status = 'pending'").get(claim_id, req.provider.id);
    if (!claim)
        return res.status(404).json({ error: 'Claim not found or already used.' });
    if (new Date(claim.expires_at) < new Date())
        return res.status(410).json({ error: 'Code expired. Please start again.' });
    if (claim.verify_code !== code.trim())
        return res.status(401).json({ error: 'Incorrect code. Try again.' });
    // Mark claim as verified
    getDb().prepare("UPDATE osm_claims SET status = 'verified' WHERE id = ?").run(claim_id);
    // Link OSM business to provider + mark verified
    getDb().prepare('UPDATE providers SET osm_id = ?, verified = 1 WHERE id = ?').run(claim.osm_id, req.provider.id);
    console.log(`[Claim] Provider ${req.provider.email} successfully claimed ${claim.osm_id}`);
    res.json({ success: true, message: 'Business claimed and verified! Your listing is now live for agents.' });
});
export default router;
//# sourceMappingURL=osm-claim.js.map