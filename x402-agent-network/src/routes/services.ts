import { Router, Request, Response } from 'express';
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
router.post('/book', (req: Request, res: Response) => {
  try {
    const { service_id, date, time, service_type } = req.body;

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

    if (!service.services.includes(service_type)) {
      return res.status(400).json({
        success: false,
        error: `Service type '${service_type}' not available at this location`
      });
    }

    const price = service.pricing[service_type.replace(' ', '_')] || 0;

    res.json({
      success: true,
      booking: {
        id: `BK-${Date.now()}`,
        service_id,
        service_name: service.name,
        service_type,
        date,
        time,
        price,
        status: 'pending_confirmation',
        confirmation_required: true
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

export default router;
