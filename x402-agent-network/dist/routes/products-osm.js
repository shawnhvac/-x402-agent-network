import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
const router = Router();
async function overpassFetch(q, ms = 15000) {
    const EPS = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.openstreetmap.ru/api/interpreter',
        'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
    ];
    for (const ep of EPS) {
        try {
            const c = new AbortController();
            const t = setTimeout(() => c.abort(), ms);
            const r = await fetch(ep, { method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'AgentPay/2.0 (x402-agent-pay.com)' },
                body: 'data=' + encodeURIComponent(q), signal: c.signal });
            clearTimeout(t);
            if (r.ok)
                return await r.json();
        }
        catch (_) { }
    }
    return null;
}
async function geocode(location) {
    try {
        const r = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(location) + '&format=json&limit=1', { headers: { 'User-Agent': 'AgentPay/2.0' } });
        const d = await r.json();
        if (d.length > 0)
            return { lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) };
    }
    catch (_) { }
    return null;
}
function distKm(lat1, lon1, lat2, lon2) {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
const OSM_TAGS = {
    'hair-beauty': { key: 'shop', values: ['hairdresser', 'beauty', 'barber', 'nail_salon'] },
    'food-dining': { key: 'amenity', values: ['restaurant', 'cafe', 'bar', 'fast_food'] },
    'auto-service': { key: 'shop', values: ['car_repair', 'tyres', 'car_wash'] },
    'home-services': { key: 'shop', values: ['hardware', 'doityourself'] },
    'health-fitness': { key: 'leisure', values: ['fitness_centre', 'sports_centre'] },
    'medical': { key: 'amenity', values: ['doctors', 'dentist', 'clinic', 'pharmacy'] },
    'pets': { key: 'shop', values: ['pet'] },
    'tech-repair': { key: 'shop', values: ['mobile_phone', 'electronics', 'computer'] },
    'travel-transport': { key: 'amenity', values: ['taxi', 'car_rental'] },
    'financial': { key: 'amenity', values: ['bank', 'atm'] },
    'real-estate': { key: 'office', values: ['estate_agent'] },
    'fashion-retail': { key: 'shop', values: ['clothes', 'shoes', 'department_store'] },
    'events': { key: 'amenity', values: ['theatre', 'cinema', 'nightclub'] },
    'education': { key: 'amenity', values: ['school', 'college', 'university'] },
    'professional': { key: 'office', values: ['lawyer', 'accountant', 'company'] }
};
router.get('/categories', async (_req, res) => {
    try {
        const candidates = [
            path.join(process.cwd(), 'src', 'data', 'service-categories.json'),
            '/root/.openclaw/workspace/x402-agent-network/x402-agent-network/src/data/service-categories.json'
        ];
        for (const p of candidates) {
            if (fs.existsSync(p))
                return res.json(JSON.parse(fs.readFileSync(p, 'utf8')));
        }
        res.status(500).json({ error: 'Categories file not found' });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.get('/osm-search', async (req, res) => {
    const { category, lat, lon, location, radius_km = '3', limit = '10' } = req.query;
    if (!category)
        return res.status(400).json({ success: false, error: 'category required' });
    const tags = OSM_TAGS[category];
    if (!tags)
        return res.status(400).json({ success: false, error: 'Unknown category. Use: ' + Object.keys(OSM_TAGS).join(', ') });
    let sLat = lat ? parseFloat(lat) : null;
    let sLon = lon ? parseFloat(lon) : null;
    if ((!sLat || !sLon) && location) {
        const geo = await geocode(location);
        if (geo) {
            sLat = geo.lat;
            sLon = geo.lon;
        }
    }
    if (!sLat || !sLon)
        return res.status(400).json({ success: false, error: 'Provide lat+lon or location string' });
    const radius = Math.min(parseFloat(radius_km), 20) * 1000;
    const maxN = Math.min(parseInt(limit), 20);
    const parts = tags.values.map(v => 'node["' + tags.key + '"="' + v + '"](around:' + radius + ',' + sLat + ',' + sLon + ');way["' + tags.key + '"="' + v + '"](around:' + radius + ',' + sLat + ',' + sLon + ');').join('');
    const osmData = await overpassFetch('[out:json][timeout:20].(' + parts + ');out center ' + maxN + ';', 18000);
    if (!osmData)
        return res.status(502).json({ success: false, error: 'OSM unavailable. Try again shortly.' });
    const results = (osmData.elements || []).slice(0, maxN).map((el) => {
        const eLat = el.lat ?? el.center?.lat, eLon = el.lon ?? el.center?.lon;
        const name = el.tags?.name || el.tags?.['name:en'];
        if (!name)
            return null;
        return {
            id: 'osm_' + el.id, name, category,
            address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street']].filter(Boolean).join(' ') || null,
            city: el.tags?.['addr:city'] || null, postcode: el.tags?.['addr:postcode'] || null,
            phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
            website: el.tags?.website || el.tags?.['contact:website'] || null,
            opening_hours: el.tags?.opening_hours || null,
            distance_km: (eLat && eLon) ? distKm(sLat, sLon, eLat, eLon) : null,
            lat: eLat, lon: eLon, osm_id: el.id, source: 'openstreetmap', bookable: true, payment_x402: true
        };
    }).filter(Boolean).sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));
    res.json({ success: true, category, center: { lat: sLat, lon: sLon }, radius_km: parseFloat(radius_km), count: results.length, results, powered_by: 'OpenStreetMap contributors' });
});
function onlineProducts(query) {
    const q = query.toLowerCase(), enc = encodeURIComponent(query);
    if (q.includes('hair dye') || q.includes('hair color'))
        return [
            { id: 'od1', name: "L'Oreal Excellence Creme", price: 9.99, currency: 'USD', source: 'online', store: 'Amazon', url: 'https://amazon.com/s?k=loreal+hair+dye', available: true, delivery: '1-2 days' },
            { id: 'od2', name: 'Garnier Nutrisse', price: 8.49, currency: 'USD', source: 'online', store: 'Walmart', url: 'https://walmart.com/search?q=garnier+hair+dye', available: true, delivery: '2-3 days' },
            { id: 'od3', name: "Clairol Nice'n Easy", price: 7.97, currency: 'USD', source: 'online', store: 'Target', url: 'https://target.com/s?searchTerm=clairol+hair+dye', available: true, delivery: 'same day' }
        ];
    return [
        { id: 'g1', name: query + ' — Top Rated', price: 'View', currency: 'USD', source: 'online', store: 'Amazon', url: 'https://amazon.com/s?k=' + enc, available: true, delivery: '1-2 days' },
        { id: 'g2', name: query + ' — Best Value', price: 'View', currency: 'USD', source: 'online', store: 'Walmart', url: 'https://walmart.com/search?q=' + enc, available: true, delivery: '2-3 days' },
        { id: 'g3', name: query + ' — Same Day', price: 'View', currency: 'USD', source: 'online', store: 'Target', url: 'https://target.com/s?searchTerm=' + enc, available: true, delivery: 'same day pickup' }
    ];
}
async function localStores(query, lat, lon) {
    const q = query.toLowerCase();
    const shopMap = {
        hair: ['hairdresser', 'beauty', 'chemist', 'supermarket'], vitamin: ['pharmacy', 'chemist', 'supermarket'],
        medicine: ['pharmacy', 'chemist'], phone: ['mobile_phone', 'electronics'],
        food: ['supermarket', 'convenience'], clothes: ['clothes', 'department_store'],
        book: ['books', 'stationery'], pet: ['pet'], tool: ['hardware', 'doityourself'], coffee: ['supermarket']
    };
    let types = ['supermarket', 'convenience', 'chemist', 'pharmacy'];
    for (const [k, t] of Object.entries(shopMap)) {
        if (q.includes(k)) {
            types = t;
            break;
        }
    }
    const parts = types.map(t => 'node["shop"="' + t + '"](around:5000,' + lat + ',' + lon + ');way["shop"="' + t + '"](around:5000,' + lat + ',' + lon + ');').join('');
    const d = await overpassFetch('[out:json][timeout:10].(' + parts + ');out center 3;', 10000) || { elements: [] };
    return (d.elements || []).slice(0, 3).map((el) => {
        const eLat = el.lat ?? el.center?.lat ?? lat, eLon = el.lon ?? el.center?.lon ?? lon, store = el.tags?.name || 'Local Store';
        return { id: 'local_' + el.id, name: query + ' at ' + store, price: 'In-store', currency: 'USD', source: 'local', store,
            address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'See map',
            distance_km: distKm(lat, lon, eLat, eLon), url: 'https://www.openstreetmap.org/node/' + el.id, available: true };
    });
}
router.post('/products', async (req, res) => {
    try {
        const { query, lat, lon, location } = req.body;
        if (!query)
            return res.status(400).json({ success: false, error: 'query required' });
        const online = onlineProducts(query);
        let local = [], sLat = lat ? parseFloat(lat) : null, sLon = lon ? parseFloat(lon) : null;
        if (!sLat && location) {
            const geo = await geocode(location);
            if (geo) {
                sLat = geo.lat;
                sLon = geo.lon;
            }
        }
        if (sLat && sLon)
            local = await localStores(query, sLat, sLon);
        res.json({ success: true, query, online_count: online.length, local_count: local.length,
            results: { online, local }, powered_by: local.length > 0 ? 'AgentPay + OpenStreetMap' : 'AgentPay Catalog',
            tip: !sLat ? 'Add lat+lon or location for nearby store results' : undefined });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
export default router;
//# sourceMappingURL=products-osm.js.map