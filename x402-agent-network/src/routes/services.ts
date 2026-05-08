import { fileURLToPath as _fup } from 'url';
import { dirname as _dn } from 'path';
const __filename = _fup(import.meta.url);
const __dirname = _dn(__filename);
import { Router, Request, Response } from 'express';
import { notifyBusiness, calculateFee, feePercent } from '../services/sentdm-notify.js';
import { registerBooking } from './notify.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Load service data
const servicesPath = path.join(__dirname, '../data/services.json');
const categoriesPath = path.join(__dirname, '../data/service-categories.json');
const locationsPath = path.join(__dirname, '../data/locations.json');

interface Service {
  id: string;
  name: string;
  category: string;
  location: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  description: string;
  services: string[];
  pricing: Record<string, number>;
  hours: string;
  website: string;
  payment_methods: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  average_duration_minutes: number;
  services: string[];
}

interface Location {
  city: string;
  state: string;
  country: string;
  timezone: string;
  population: number;
  latitude: number;
  longitude: number;
  region: string;
}

let services: Service[] = [];
let categories: Category[] = [];
let locations: Location[] = [];

// Load data on startup
function loadData() {
  try {
    if (fs.existsSync(servicesPath)) {
      const data = fs.readFileSync(servicesPath, 'utf-8');
      services = JSON.parse(data).services;
    }
  } catch (error) {
    console.error('Error loading services:', error);
  }

  try {
    if (fs.existsSync(categoriesPath)) {
      const data = fs.readFileSync(categoriesPath, 'utf-8');
      categories = JSON.parse(data).categories;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }

  try {
    if (fs.existsSync(locationsPath)) {
      const data = fs.readFileSync(locationsPath, 'utf-8');
      locations = JSON.parse(data).locations;
    }
  } catch (error) {
    console.error('Error loading locations:', error);
  }
}

loadData();

/**
 * GET /api/v1/services
 * Get all services with optional filtering
 * Query params: category, location, search, limit, offset
 */
router.get('/services', (req: Request, res: Response) => {
  try {
    const { category, location, search, limit = '50', offset = '0' } = req.query;

    let filtered = [...services];

    // Filter by category
    if (category && typeof category === 'string') {
      filtered = filtered.filter(
        s => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by location
    if (location && typeof location === 'string') {
      const locationLower = location.toLowerCase();
      filtered = filtered.filter(s =>
        s.location.toLowerCase().includes(locationLower) ||
        s.city.toLowerCase().includes(locationLower) ||
        s.state.toLowerCase().includes(locationLower)
      );
    }

    // Search by name or description
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.services.some(svc => svc.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      count: paginated.length,
      total: filtered.length,
      limit: limitNum,
      offset: offsetNum,
      services: paginated
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

/**
 * GET /api/v1/services/categories
 * Get all service categories
 */
router.get('/services/categories', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * GET /api/v1/services/locations
 * Get all available locations
 */
router.get('/services/locations', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
});

/**
 * GET /api/v1/services/:id
 * Get a specific service by ID
 */
router.get('/services/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = services.find(s => s.id === id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service'
    });
  }
});

/**
 * GET /api/v1/services/by-category/:category
 * Get all services in a specific category
 */
router.get('/services/by-category/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const filtered = services.filter(
      s => s.category.toLowerCase() === category.toLowerCase()
    );

    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      category,
      count: paginated.length,
      total: filtered.length,
      services: paginated
    });
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

/**
 * GET /api/v1/services/by-location/:location
 * Get all services in a specific location
 */
router.get('/services/by-location/:location', (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const locationLower = location.toLowerCase();
    const filtered = services.filter(s =>
      s.location.toLowerCase().includes(locationLower) ||
      s.city.toLowerCase().includes(locationLower)
    );

    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      location,
      count: paginated.length,
      total: filtered.length,
      services: paginated
    });
  } catch (error) {
    console.error('Error fetching services by location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

/**
 * POST /api/v1/search
 * Search for services (x402 endpoint)
 * Body: { query: string, category?: string, location?: string }
 */
router.post('/search', (req: Request, res: Response) => {
  try {
    const { query, category, location } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter required'
      });
    }

    let filtered = [...services];

    if (category) {
      filtered = filtered.filter(
        s => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (location) {
      const locationLower = location.toLowerCase();
      filtered = filtered.filter(s =>
        s.location.toLowerCase().includes(locationLower) ||
        s.city.toLowerCase().includes(locationLower)
      );
    }

    const queryLower = query.toLowerCase();
    const results = filtered.filter(s =>
      s.name.toLowerCase().includes(queryLower) ||
      s.description.toLowerCase().includes(queryLower) ||
      s.services.some(svc => svc.toLowerCase().includes(queryLower))
    ).slice(0, 20);

    res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

/**
 * POST /api/v1/book
 * Book a service appointment (x402 endpoint)
 * Body: { service_id: string, date: string, time: string, service_type: string }
 */
router.post('/book', async (req: Request, res: Response) => {
  try {
    const { service_id, date, time, service_type, customer_name, estimated_price } = req.body;

    if (!service_id || !date || !time || !service_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: service_id, date, time, service_type'
      });
    }

    const service = services.find(s => s.id === service_id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    const price = estimated_price || service.pricing[service_type.replace(/ /g, '_')] || 0;
    const fee   = calculateFee(price);
    const pct   = feePercent(price);
    const net   = Math.round((price - fee) * 100) / 100;
    const bookingId = `BK-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Register booking so SMS reply handler can look it up
    registerBooking({
      id: bookingId,
      phone: service.phone,
      businessName: service.name,
      serviceType: service_type,
      date,
      time,
      price,
    });

    // Respond immediately — notification is async
    res.json({
      success: true,
      booking: {
        id: bookingId,
        service_id,
        service_name: service.name,
        service_type,
        date,
        time,
        price,
        platform_fee: fee,
        fee_percent: pct,
        business_payout: net,
        status: 'pending_confirmation',
        confirmation_required: true,
        notification: 'Business is being notified now'
      }
    });

    // Fire-and-forget: notify business via SMS/voice/email
    setImmediate(async () => {
      try {
        const result = await notifyBusiness({
          bookingId,
          businessName: service.name,
          businessPhone: service.phone,
          businessEmail: (service as any).email,
          serviceType: service_type,
          customerName: customer_name,
          date,
          time,
          price,
          attempt: 1
        });
        console.log(`[Booking ${bookingId}] Notification result:`, result);

        // Attempt 2 after 30 min if no response (simplified — in production use a job queue)
        if (!result.sent) {
          console.warn(`[Booking ${bookingId}] Initial notification failed — will retry`);
        }
      } catch (err) {
        console.error(`[Booking ${bookingId}] Notification error:`, err);
      }
    });

  } catch (error) {
    console.error('Error booking service:', error);
    res.status(500).json({
      success: false,
      error: 'Booking failed'
    });
  }
});

/**
 * POST /api/v1/notify/ivr-response/:bookingId
 * Twilio IVR webhook — business pressed 1 (confirm) or 2 (decline)
 */
router.post('/notify/ivr-response/:bookingId', (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const digit = req.body.Digits;
  console.log(`[IVR] Booking ${bookingId} — pressed: ${digit}`);

  let message = '';
  if (digit === '1') {
    message = 'Thank you! The booking has been confirmed. We will send you the customer details shortly. Goodbye.';
    console.log(`[IVR] Booking ${bookingId} CONFIRMED by business`);
  } else if (digit === '2') {
    message = 'The booking has been declined. We will find another provider for the customer. Goodbye.';
    console.log(`[IVR] Booking ${bookingId} DECLINED by business`);
  } else {
    message = 'We did not receive a valid response. Please call AgentPay support if you have questions. Goodbye.';
  }

  // Respond with TwiML
  res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${message}</Say>
</Response>`);
});

/**
 * POST /api/v1/pay
 * Confirm payment and complete booking (x402 endpoint)
 * Body: { booking_id: string, payment_tx: string }
 */
router.post('/pay', (req: Request, res: Response) => {
  try {
    const { booking_id, payment_tx } = req.body;

    if (!booking_id || !payment_tx) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: booking_id, payment_tx'
      });
    }

    res.json({
      success: true,
      payment: {
        booking_id,
        tx_hash: payment_tx,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        next_steps: 'You will receive a confirmation email with details'
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
});

/**
 * GET /api/v1/stats
 * Get marketplace statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const categories_count = new Set(services.map(s => s.category)).size;
    const locations_count = new Set(services.map(s => s.location)).size;
    const avg_rating = (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(2);
    const total_reviews = services.reduce((sum, s) => sum + s.reviews, 0);

    res.json({
      success: true,
      stats: {
        total_services: services.length,
        total_categories: categories_count,
        total_locations: locations_count,
        average_rating: parseFloat(avg_rating as string),
        total_reviews,
        data_last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});


/**
 * POST /api/v1/llm - Real AI Inference via NVIDIA NIM (x402 protected)
 */
import { nvidiaNIM, NVIDIA_MODELS, DEFAULT_MODEL } from "../services/nvidia-nim.js";

router.post("/llm", async (req: Request, res: Response): Promise<any> => {
  try {
    const { prompt, messages, model, max_tokens = 512, temperature = 0.7 } = req.body;

    let msgs = messages;
    if (!msgs && prompt) msgs = [{ role: "user", content: prompt }];
    if (!Array.isArray(msgs) || msgs.length === 0) {
      return res.status(400).json({ error: "Provide prompt or messages[]" });
    }

    const resolvedModel = (model && NVIDIA_MODELS[model]) ? model : DEFAULT_MODEL;
    const resp = await nvidiaNIM.chat({ model: resolvedModel, messages: msgs, max_tokens, temperature });
    const completion = resp.choices[0]?.message?.content || "";

    return res.json({
      success: true,
      output: {
        model: resp.model,
        completion,
        usage: resp.usage,
        cost: 0.001,
        provider: "NVIDIA NIM",
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "LLM inference failed" });
  }
});


/**
 * POST /api/v1/ai/search — AI-powered natural language service search
 * Uses NVIDIA NIM to interpret the query, then searches the services database.
 * x402 protected: $0.002 USDC per call
 */
router.post("/ai/search", async (req: Request, res: Response): Promise<any> => {
  try {
    const { query, location, max_results = 5 } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "query string is required" });
    }

    // Step 1: Ask NVIDIA NIM to interpret the query
    const systemPrompt = `You are a service search assistant. Extract structured intent from a user's natural language service request.
Return ONLY valid JSON with these fields:
- category: one of [hvac, plumbing, electrical, hair-beauty, food-dining, mechanic, cleaning, landscaping, other]
- keywords: array of 3-5 relevant search terms
- location: city/area if mentioned, or null
- urgency: "high" | "normal" | "low"
- intent: short phrase describing what they want (max 8 words)`;

    const nimResp = await nvidiaNIM.chat({
      model: "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      max_tokens: 200,
      temperature: 0.1,
    });

    let interpreted: any = { category: "other", keywords: [query], location: null, urgency: "normal", intent: query };
    try {
      const raw = nimResp.choices[0]?.message?.content || "{}";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) interpreted = JSON.parse(jsonMatch[0]);
    } catch (_) {}

    // Step 2: Search services with AI-extracted keywords
    const searchTerms = [
      ...(interpreted.keywords || []),
      interpreted.category !== "other" ? interpreted.category : "",
      location || interpreted.location || "",
    ].filter(Boolean).map((t: string) => t.toLowerCase());

    const locationHint = (location || interpreted.location || "").toLowerCase();

    let candidates = [...services];
    if (locationHint) {
      candidates = candidates.filter(s =>
        s.location.toLowerCase().includes(locationHint) ||
        s.city.toLowerCase().includes(locationHint)
      );
    }
    if (interpreted.category && interpreted.category !== "other") {
      const catMatches = candidates.filter(s =>
        s.category.toLowerCase() === interpreted.category.toLowerCase()
      );
      if (catMatches.length > 0) candidates = catMatches;
    }

    // Step 3: Score each result by keyword overlap
    const scored = candidates.map(s => {
      const blob = [s.name, s.description, s.category, ...s.services].join(" ").toLowerCase();
      const hits = searchTerms.filter(t => blob.includes(t)).length;
      const score = searchTerms.length > 0 ? hits / searchTerms.length : 0.5;
      return { ...s, relevance_score: parseFloat(score.toFixed(2)) };
    });

    const results = scored
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, max_results);

    return res.json({
      success: true,
      query,
      ai_interpreted: interpreted,
      count: results.length,
      results,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "AI search failed" });
  }
});

export default router;
