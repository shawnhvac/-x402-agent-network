import { Router } from 'express';
const router = Router();
let businesses = new Map();
let bookings = new Map();
/**
 * POST /api/v1/business/register
 * Register a new business
 */
router.post('/business/register', (req, res) => {
    try {
        const { email, password, businessName, category, location, city, country, address, phone, services, description, website, wallet } = req.body;
        if (!email || !businessName || !category) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        const businessId = 'biz_' + Date.now();
        const business = {
            id: businessId,
            email,
            businessName,
            category,
            location,
            address: address || '',
            phone,
            description: description || '',
            city: city || '',
            country: country || '',
            website: website || '',
            wallet: wallet || '',
            services_offered: services || [],
            rating: 0,
            reviews: 0,
            services: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        businesses.set(businessId, business);
        res.status(201).json({
            success: true,
            business: {
                id: businessId,
                email,
                businessName,
                category,
                location
            },
            message: 'Business registered successfully'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});
/**
 * POST /api/v1/business/login
 * Login business
 */
router.post('/business/login', (req, res) => {
    try {
        const { email, password } = req.body;
        // TODO: Verify password (implement proper authentication)
        const business = Array.from(businesses.values()).find(b => b.email === email);
        if (!business) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // Generate mock token
        const token = Buffer.from(`${business.id}:${Date.now()}`).toString('base64');
        res.json({
            success: true,
            token,
            business: {
                id: business.id,
                businessName: business.businessName,
                email: business.email,
                category: business.category
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});
/**
 * GET /api/v1/business/:id
 * Get business profile
 */
router.get('/business/:id', (req, res) => {
    try {
        const business = businesses.get(req.params.id);
        if (!business) {
            return res.status(404).json({
                success: false,
                error: 'Business not found'
            });
        }
        res.json({
            success: true,
            business
        });
    }
    catch (error) {
        console.error('Get business error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch business'
        });
    }
});
/**
 * PUT /api/v1/business/:id
 * Update business profile
 */
router.put('/business/:id', (req, res) => {
    try {
        const business = businesses.get(req.params.id);
        if (!business) {
            return res.status(404).json({
                success: false,
                error: 'Business not found'
            });
        }
        const updated = {
            ...business,
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        businesses.set(req.params.id, updated);
        res.json({
            success: true,
            business: updated
        });
    }
    catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            error: 'Update failed'
        });
    }
});
/**
 * POST /api/v1/business/:id/services
 * Add a new service
 */
router.post('/business/:id/services', (req, res) => {
    try {
        const business = businesses.get(req.params.id);
        if (!business) {
            return res.status(404).json({
                success: false,
                error: 'Business not found'
            });
        }
        const { name, category, description, price, duration } = req.body;
        const service = {
            id: 'svc_' + Date.now(),
            name,
            category,
            description,
            price,
            duration: duration || 60,
            available: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        business.services.push(service);
        businesses.set(req.params.id, business);
        res.status(201).json({
            success: true,
            service
        });
    }
    catch (error) {
        console.error('Service creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create service'
        });
    }
});
/**
 * GET /api/v1/business/:id/services
 * Get all services for a business
 */
router.get('/business/:id/services', (req, res) => {
    try {
        const business = businesses.get(req.params.id);
        if (!business) {
            return res.status(404).json({
                success: false,
                error: 'Business not found'
            });
        }
        res.json({
            success: true,
            count: business.services.length,
            services: business.services
        });
    }
    catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch services'
        });
    }
});
/**
 * PUT /api/v1/business/:businessId/services/:serviceId
 * Update a service
 */
router.put('/business/:businessId/services/:serviceId', (req, res) => {
    try {
        const business = businesses.get(req.params.businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                error: 'Business not found'
            });
        }
        const service = business.services.find(s => s.id === req.params.serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }
        const updated = {
            ...service,
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        business.services = business.services.map(s => s.id === service.id ? updated : s);
        businesses.set(req.params.businessId, business);
        res.json({
            success: true,
            service: updated
        });
    }
    catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update service'
        });
    }
});
/**
 * DELETE /api/v1/business/:businessId/services/:serviceId
 * Delete a service
 */
router.delete('/business/:businessId/services/:serviceId', (req, res) => {
    try {
        const business = businesses.get(req.params.businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                error: 'Business not found'
            });
        }
        business.services = business.services.filter(s => s.id !== req.params.serviceId);
        businesses.set(req.params.businessId, business);
        res.json({
            success: true,
            message: 'Service deleted'
        });
    }
    catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete service'
        });
    }
});
/**
 * GET /api/v1/business/:id/bookings
 * Get bookings for a business
 */
router.get('/business/:id/bookings', (req, res) => {
    try {
        const businessBookings = Array.from(bookings.values()).filter(b => b.businessId === req.params.id);
        res.json({
            success: true,
            count: businessBookings.length,
            bookings: businessBookings
        });
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
});
/**
 * PUT /api/v1/business/:businessId/bookings/:bookingId
 * Update booking status
 */
router.put('/business/:businessId/bookings/:bookingId', (req, res) => {
    try {
        const booking = bookings.get(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        const { status } = req.body;
        const updated = {
            ...booking,
            status,
            updatedAt: new Date().toISOString()
        };
        bookings.set(req.params.bookingId, updated);
        res.json({
            success: true,
            booking: updated
        });
    }
    catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update booking'
        });
    }
});
/**
 * GET /api/v1/business/:id/analytics
 * Get business analytics
 */
router.get('/business/:id/analytics', (req, res) => {
    try {
        const businessBookings = Array.from(bookings.values()).filter(b => b.businessId === req.params.id);
        const totalRevenue = businessBookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + b.amount, 0);
        const stats = {
            totalBookings: businessBookings.length,
            completedBookings: businessBookings.filter(b => b.status === 'completed').length,
            pendingBookings: businessBookings.filter(b => b.status === 'pending').length,
            cancelledBookings: businessBookings.filter(b => b.status === 'cancelled').length,
            totalRevenue,
            averageBookingValue: businessBookings.length > 0 ? totalRevenue / businessBookings.length : 0
        };
        res.json({
            success: true,
            stats
        });
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
});
export default router;
//# sourceMappingURL=business-portal.js.map