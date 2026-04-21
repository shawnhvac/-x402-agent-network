/**
 * Agents API
 * REST endpoints for agent registration, discovery, and management
 */
import { Router } from 'express';
import { MongoClient } from 'mongodb';
const router = Router();
let db;
/**
 * Initialize database connection
 */
export async function initializeAgentsDB(mongoUrl) {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db('agentpay');
    // Create indexes
    await db.collection('agents').createIndex({ 'location.city': 1 });
    await db.collection('agents').createIndex({ serviceType: 1 });
    await db.collection('agents').createIndex({ 'location.lat': '2dsphere', 'location.lng': '2dsphere' });
    await db.collection('agents').createIndex({ walletAddress: 1 });
    console.log('✅ Agents DB initialized');
}
/**
 * GET /api/agents
 * Fetch all agents with optional filtering
 */
router.get('/agents', async (req, res) => {
    try {
        const { serviceType, city, state, minRating, maxPrice } = req.query;
        // Build query
        const query = {};
        if (serviceType)
            query.serviceType = serviceType;
        if (city)
            query['location.city'] = { $regex: city, $options: 'i' };
        if (state)
            query['location.state'] = state;
        if (minRating)
            query.rating = { $gte: parseFloat(minRating) };
        if (maxPrice)
            query.pricePerHour = { $lte: parseFloat(maxPrice) };
        const agents = await db.collection('agents').find(query).toArray();
        res.json(agents);
    }
    catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});
/**
 * GET /api/agents/:id
 * Get single agent by ID
 */
router.get('/agents/:id', async (req, res) => {
    try {
        const agent = await db.collection('agents').findOne({ id: req.params.id });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(agent);
    }
    catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
});
/**
 * GET /api/agents/nearby
 * Find nearby agents (geo query)
 */
router.get('/agents/nearby', async (req, res) => {
    try {
        const { latitude, longitude, radiusKm = 15, serviceType } = req.query;
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'latitude and longitude required' });
        }
        const query = {
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseFloat(radiusKm) * 1000 // Convert km to meters
                }
            }
        };
        if (serviceType) {
            query.serviceType = serviceType;
        }
        const agents = await db.collection('agents').find(query).toArray();
        res.json(agents);
    }
    catch (error) {
        console.error('Error finding nearby agents:', error);
        res.status(500).json({ error: 'Failed to find nearby agents' });
    }
});
/**
 * POST /api/agents
 * Register new agent ($20/month)
 */
router.post('/agents', async (req, res) => {
    try {
        const { name, serviceType, description, pricePerHour, city, state, walletAddress, latitude, longitude } = req.body;
        // Validation
        if (!name || !serviceType || !pricePerHour || !city || !state || !walletAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if wallet already registered
        const existing = await db.collection('agents').findOne({ walletAddress });
        if (existing) {
            return res.status(409).json({ error: 'Wallet already registered' });
        }
        // Create agent
        const agent = {
            id: `agent_${Date.now()}`,
            name,
            serviceType,
            description,
            pricePerHour,
            location: {
                city,
                state,
                lat: latitude || 0,
                lng: longitude || 0
            },
            walletAddress,
            rating: 5.0, // New agents start with 5 stars
            reviews: 0,
            verified: false,
            totalTransactions: 0,
            successRate: 1.0,
            responseTime: '< 5 min',
            totalEarnings: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection('agents').insertOne(agent);
        res.status(201).json({
            id: agent.id,
            message: 'Agent registered successfully',
            note: 'Subscription: $20/month (billing will be enabled when Solana mainnet is live)'
        });
    }
    catch (error) {
        console.error('Error registering agent:', error);
        res.status(500).json({ error: 'Failed to register agent' });
    }
});
/**
 * PUT /api/agents/:id
 * Update agent profile
 */
router.put('/agents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Don't allow updating wallet address or ID
        delete updates.id;
        delete updates.walletAddress;
        updates.updatedAt = new Date();
        const result = await db.collection('agents').updateOne({ id }, { $set: updates });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json({ message: 'Agent updated successfully' });
    }
    catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({ error: 'Failed to update agent' });
    }
});
/**
 * GET /api/agents/:id/earnings
 * Get agent earnings and transaction history
 */
router.get('/agents/:id/earnings', async (req, res) => {
    try {
        const agent = await db.collection('agents').findOne({ id: req.params.id });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        // Get recent transactions
        const transactions = await db.collection('transactions')
            .find({ agentId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();
        res.json({
            totalEarnings: agent.totalEarnings,
            totalTransactions: agent.totalTransactions,
            averageValue: agent.totalEarnings / Math.max(agent.totalTransactions, 1),
            recentTransactions: transactions
        });
    }
    catch (error) {
        console.error('Error fetching earnings:', error);
        res.status(500).json({ error: 'Failed to fetch earnings' });
    }
});
/**
 * POST /api/agents/:id/rating
 * Update agent rating (after transaction completion)
 */
router.post('/agents/:id/rating', async (req, res) => {
    try {
        const { rating, review } = req.body;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const agent = await db.collection('agents').findOne({ id: req.params.id });
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        // Calculate new average rating
        const newReviews = agent.reviews + 1;
        const newRating = ((agent.rating * agent.reviews) + rating) / newReviews;
        await db.collection('agents').updateOne({ id: req.params.id }, {
            $set: {
                rating: parseFloat(newRating.toFixed(2)),
                reviews: newReviews,
                updatedAt: new Date()
            }
        });
        res.json({
            newRating: parseFloat(newRating.toFixed(2)),
            totalReviews: newReviews
        });
    }
    catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ error: 'Failed to update rating' });
    }
});
/**
 * DELETE /api/agents/:id
 * Delete agent (deactivate)
 */
router.delete('/agents/:id', async (req, res) => {
    try {
        const result = await db.collection('agents').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json({ message: 'Agent deactivated' });
    }
    catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ error: 'Failed to delete agent' });
    }
});
/**
 * GET /api/agents/stats/overview
 * Get marketplace statistics
 */
router.get('/agents/stats/overview', async (req, res) => {
    try {
        const stats = await db.collection('agents').aggregate([
            {
                $group: {
                    _id: null,
                    totalAgents: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    averagePrice: { $avg: '$pricePerHour' },
                    totalEarnings: { $sum: '$totalEarnings' },
                    serviceTypes: { $push: '$serviceType' }
                }
            }
        ]).toArray();
        res.json(stats[0] || {});
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
export default router;
//# sourceMappingURL=agents.js.map