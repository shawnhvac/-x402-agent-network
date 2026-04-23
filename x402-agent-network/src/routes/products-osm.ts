import { Router, Request, Response } from 'express';

const router = Router();

// ─── Overpass fetch — one tag at a time, fast timeout ────────────────────────
async function overpassOne(key: string, value: string, lat: number, lon: number, radius: number, limit: number): Promise<any[]> {
  const EPS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  const q = `[out:json][timeout:6];(node["${key}"="${value}"](around:${radius},${lat},${lon});way["${key}"="${value}"](around:${radius},${lat},${lon}););out center ${limit};`;
  for (const ep of EPS) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 7000);
      const r = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'AgentPay/2.0' },
        body: 'data=' + encodeURIComponent(q),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (r.ok) {
        const d = await r.json() as any;
        if (Array.isArray(d.elements)) return d.elements;
      }
    } catch (_) {}
  }
  return [];
}

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(location) + '&format=json&limit=1',
      { headers: { 'User-Agent': 'AgentPay/2.0' }, signal: AbortSignal.timeout(5000) });
    const d = await r.json() as any[];
    if (d.length > 0) return { lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) };
  } catch (_) {}
  return null;
}

function distKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

const OSM_TAGS: Record<string, { key: string; values: string[] }> = {
  'hair-beauty':      { key: 'shop',    values: ['hairdresser', 'beauty', 'barber', 'nail_salon'] },
  'food-dining':      { key: 'amenity', values: ['restaurant', 'cafe', 'bar', 'fast_food'] },
  'auto-service':     { key: 'shop',    values: ['car_repair', 'tyres', 'car_wash'] },
  'home-services':    { key: 'shop',    values: ['hardware', 'doityourself'] },
  'health-fitness':   { key: 'leisure', values: ['fitness_centre', 'sports_centre'] },
  'medical':          { key: 'amenity', values: ['doctors', 'dentist', 'clinic', 'pharmacy'] },
  'pets':             { key: 'shop',    values: ['pet'] },
  'tech-repair':      { key: 'shop',    values: ['mobile_phone', 'electronics', 'computer'] },
  'travel-transport': { key: 'amenity', values: ['taxi', 'car_rental'] },
  'financial':        { key: 'amenity', values: ['bank', 'atm'] },
  'real-estate':      { key: 'office',  values: ['estate_agent'] },
  'fashion-retail':   { key: 'shop',    values: ['clothes', 'shoes', 'department_store'] },
  'events':           { key: 'amenity', values: ['theatre', 'cinema', 'nightclub'] },
  'education':        { key: 'amenity', values: ['school', 'college', 'university'] },
  'professional':     { key: 'office',  values: ['lawyer', 'accountant', 'company'] },
};

// ─── GET /api/v1/categories ──────────────────────────────────────────────────
router.get('/categories', (_req: Request, res: Response) => {
  res.json(Object.keys(OSM_TAGS).map(id => ({ id, label: id.replace(/-/g, ' ') })));
});

// ─── GET /api/v1/osm-search ──────────────────────────────────────────────────
router.get('/osm-search', async (req: Request, res: Response) => {
  const { category, lat, lon, location, radius_km = '5', limit = '15' } = req.query as Record<string, string>;
  if (!category) return res.status(400).json({ success: false, error: 'category required' });
  const tags = OSM_TAGS[category];
  if (!tags) return res.status(400).json({ success: false, error: 'Unknown category. Use: ' + Object.keys(OSM_TAGS).join(', ') });

  let sLat = lat ? parseFloat(lat) : null;
  let sLon = lon ? parseFloat(lon) : null;
  if ((!sLat || !sLon) && location) {
    const geo = await geocode(location);
    if (geo) { sLat = geo.lat; sLon = geo.lon; }
  }
  if (!sLat || !sLon) return res.status(400).json({ success: false, error: 'Provide lat+lon or location string' });

  const radius = Math.min(parseFloat(radius_km), 20) * 1000;
  const maxN   = Math.min(parseInt(limit), 30);
  const perTag = Math.ceil(maxN / tags.values.length);

  // Fetch all tag types in PARALLEL — each is a small fast query
  const tagResults = await Promise.all(
    tags.values.map(v => overpassOne(tags.key, v, sLat!, sLon!, radius, perTag))
  );
  const seen = new Set<number>();
  let elements: any[] = [];
  for (const arr of tagResults) {
    for (const el of arr) {
      if (!seen.has(el.id)) { seen.add(el.id); elements.push(el); }
    }
  }

  let results = elements.map((el: any) => {
    const eLat = el.lat ?? el.center?.lat;
    const eLon = el.lon ?? el.center?.lon;
    const name = el.tags?.name || el.tags?.['name:en'];
    if (!name) return null;
    return {
      id: 'osm_' + el.id, name, category,
      address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street']].filter(Boolean).join(' ') || null,
      city: el.tags?.['addr:city'] || null,
      postcode: el.tags?.['addr:postcode'] || null,
      phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
      website: el.tags?.website || el.tags?.['contact:website'] || null,
      opening_hours: el.tags?.opening_hours || null,
      distance_km: (eLat && eLon) ? distKm(sLat!, sLon!, eLat, eLon) : null,
      lat: eLat, lon: eLon, osm_id: el.id,
      source: 'openstreetmap', bookable: true, payment_x402: true,
    };
  }).filter(Boolean).sort((a: any, b: any) => (a.distance_km ?? 99) - (b.distance_km ?? 99)).slice(0, maxN);

  // Also pull self-registered AgentPay providers matching this category
  try {
    const Database = require('better-sqlite3');
    const pdb = new Database('/var/lib/agentpay/providers.db');
    const catMap: Record<string, string[]> = {
      'hair-beauty':    ['hair', 'beauty', 'barber', 'salon', 'nail'],
      'auto-service':   ['auto', 'car', 'vehicle', 'tyre', 'mechanic'],
      'home-services':  ['hvac', 'plumb', 'electric', 'handyman', 'roof', 'paint', 'home'],
      'health-fitness': ['fitness', 'gym', 'health', 'sport'],
      'medical':        ['medical', 'doctor', 'dentist', 'clinic', 'pharmacy'],
      'food-dining':    ['food', 'restaurant', 'cafe', 'catering'],
      'tech-repair':    ['tech', 'repair', 'computer', 'phone', 'electronic'],
      'pets':           ['pet', 'vet', 'grooming'],
      'professional':   ['lawyer', 'accountant', 'consult', 'legal'],
      'events':         ['event', 'entertainment', 'party'],
    };
    const keywords = catMap[category] || [category.replace('-', ' ')];
    const allProviders: any[] = pdb.prepare('SELECT * FROM providers WHERE status = ?').all('active');
    const matched = allProviders.filter((p: any) =>
      keywords.some(k => (p.category || p.business_name || '').toLowerCase().includes(k))
    ).map((p: any) => ({
      id: 'ap_' + p.id, name: p.business_name, category,
      address: null, city: null, postcode: null,
      phone: p.phone || null, website: null, opening_hours: null,
      distance_km: null, lat: null, lon: null, osm_id: null,
      source: 'agentpay', bookable: true, payment_x402: true, verified: true, email: p.email,
    }));
    results.unshift(...matched);
  } catch (_) {}

  res.json({
    success: true, category,
    center: { lat: sLat, lon: sLon },
    radius_km: parseFloat(radius_km),
    count: results.length, results,
    powered_by: 'OpenStreetMap + AgentPay',
  });
});

// ─── POST /api/v1/products ───────────────────────────────────────────────────
function onlineProducts(query: string): any[] {
  const enc = encodeURIComponent(query);
  return [
    { id: 'od1', name: query + ' — Amazon',  price: 'View', currency: 'USD', source: 'online', store: 'Amazon',  url: 'https://amazon.com/s?k=' + enc, available: true, delivery: '1-2 days' },
    { id: 'od2', name: query + ' — Walmart', price: 'View', currency: 'USD', source: 'online', store: 'Walmart', url: 'https://walmart.com/search?q=' + enc, available: true, delivery: '2-3 days' },
    { id: 'od3', name: query + ' — Target',  price: 'View', currency: 'USD', source: 'online', store: 'Target',  url: 'https://target.com/s?searchTerm=' + enc, available: true, delivery: 'same day pickup' },
  ];
}

async function localStores(query: string, lat: number, lon: number): Promise<any[]> {
  const q = query.toLowerCase();
  const shopMap: Record<string, string[]> = {
    hair: ['hairdresser', 'beauty', 'chemist', 'supermarket'], vitamin: ['pharmacy', 'chemist', 'supermarket'],
    medicine: ['pharmacy', 'chemist'], phone: ['mobile_phone', 'electronics'],
    food: ['supermarket', 'convenience'], clothes: ['clothes', 'department_store'],
    book: ['books', 'stationery'], pet: ['pet'], tool: ['hardware', 'doityourself'],
  };
  let types = ['supermarket', 'convenience', 'chemist', 'pharmacy'];
  for (const [k, t] of Object.entries(shopMap)) { if (q.includes(k)) { types = t; break; } }

  const elements = (await Promise.all(
    types.slice(0, 2).map(t => overpassOne('shop', t, lat, lon, 5000, 2))
  )).flat().slice(0, 3);

  return elements.map((el: any) => {
    const eLat = el.lat ?? el.center?.lat ?? lat, eLon = el.lon ?? el.center?.lon ?? lon;
    const store = el.tags?.name || 'Local Store';
    return {
      id: 'local_' + el.id, name: query + ' at ' + store, price: 'In-store', currency: 'USD',
      source: 'local', store,
      address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'See map',
      distance_km: distKm(lat, lon, eLat, eLon),
      url: 'https://www.openstreetmap.org/node/' + el.id, available: true,
    };
  });
}

router.post('/products', async (req: Request, res: Response) => {
  try {
    const { query, lat, lon, location } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'query required' });
    const online = onlineProducts(query);
    let local: any[] = [], sLat = lat ? parseFloat(lat) : null, sLon = lon ? parseFloat(lon) : null;
    if (!sLat && location) { const geo = await geocode(location); if (geo) { sLat = geo.lat; sLon = geo.lon; } }
    if (sLat && sLon) local = await localStores(query, sLat, sLon);
    res.json({
      success: true, query,
      online_count: online.length, local_count: local.length,
      results: { online, local },
      powered_by: local.length > 0 ? 'AgentPay + OpenStreetMap' : 'AgentPay Catalog',
      tip: !sLat ? 'Add lat+lon or location for nearby store results' : undefined,
    });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

export default router;
