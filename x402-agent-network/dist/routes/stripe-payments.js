import { Router } from 'express';
import Stripe from 'stripe';
const router = Router();
function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.length < 20)
        throw new Error('STRIPE_SECRET_KEY not configured');
    return new Stripe(key, { apiVersion: '2025-03-31.basil' });
}
const PUB_KEY = () => process.env.STRIPE_PUBLISHABLE_KEY || '';
// ════════════════════════════════════════════════════════════════════════════
// STEP 1 — Human registers their card (one-time setup)
// Agent calls this once per user to get a setup link or setup intent
// ════════════════════════════════════════════════════════════════════════════
/**
 * POST /api/v1/stripe/setup-customer
 * Create a Stripe Customer + SetupIntent so the human can save their card.
 * The agent stores the returned customer_id and uses it for all future charges.
 *
 * Body: { email, name, agent_id, user_id }
 * Returns: { customer_id, setup_intent_client_secret, setup_url }
 */
router.post('/stripe/setup-customer', async (req, res) => {
    try {
        const stripe = getStripe();
        const { email, name, agent_id, user_id, metadata = {} } = req.body;
        if (!email)
            return res.status(400).json({ success: false, error: 'email required' });
        // Create customer in Stripe
        const customer = await stripe.customers.create({
            email,
            name: name || email,
            metadata: { agent_id: agent_id || '', user_id: user_id || '', platform: 'agentpay', ...metadata }
        });
        // Create SetupIntent so human can save card for future agent charges
        const setupIntent = await stripe.setupIntents.create({
            customer: customer.id,
            payment_method_types: ['card'],
            usage: 'off_session', // key flag — card will be charged without human present
            metadata: { agent_id: agent_id || '', user_id: user_id || '' }
        });
        // Also create a hosted setup URL via checkout (easier for humans)
        const setupSession = await stripe.checkout.sessions.create({
            mode: 'setup',
            customer: customer.id,
            payment_method_types: ['card'],
            success_url: 'https://www.x402-agent-pay.com/card-saved?customer_id=' + customer.id,
            cancel_url: 'https://www.x402-agent-pay.com/card-cancelled',
            metadata: { agent_id: agent_id || '', customer_id: customer.id }
        });
        res.json({
            success: true,
            customer_id: customer.id,
            // For custom UI (Stripe Elements in app):
            setup_intent_client_secret: setupIntent.client_secret,
            publishable_key: PUB_KEY(),
            // For hosted redirect (simplest — send human this URL):
            setup_url: setupSession.url,
            instructions: 'Send setup_url to the human. Once they save their card, use customer_id for all agent charges.'
        });
    }
    catch (err) {
        console.error('Setup customer error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});
// ════════════════════════════════════════════════════════════════════════════
// STEP 2 — Agent charges the human's saved card (fully autonomous)
// No human interaction needed — fires instantly when agent books a service
// ════════════════════════════════════════════════════════════════════════════
/**
 * POST /api/v1/stripe/agent-charge
 * Agent charges a human's saved card on their behalf.
 * Fully autonomous — no human present, no redirect needed.
 *
 * Body: { customer_id, amount (cents), currency, service_name, booking_id, agent_id }
 * Returns: { success, charge_id, amount, status, receipt_url }
 */
router.post('/stripe/agent-charge', async (req, res) => {
    try {
        const stripe = getStripe();
        const { customer_id, amount, currency = 'usd', service_name = 'AgentPay Booking', booking_id, agent_id, business_name } = req.body;
        if (!customer_id)
            return res.status(400).json({ success: false, error: 'customer_id required' });
        if (!amount || amount < 50)
            return res.status(400).json({ success: false, error: 'amount required (min 50 cents)' });
        // Get customer's default payment method
        const customer = await stripe.customers.retrieve(customer_id);
        if (!customer || customer.deleted) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        // List their saved payment methods
        const paymentMethods = await stripe.paymentMethods.list({ customer: customer_id, type: 'card' });
        if (!paymentMethods.data.length) {
            return res.status(402).json({
                success: false,
                error: 'No saved card found for this customer. Ask them to set up a card first.',
                setup_url: 'POST /api/v1/stripe/setup-customer'
            });
        }
        const paymentMethod = paymentMethods.data[0]; // use most recent card
        // Create off-session payment intent and confirm immediately
        const intent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency,
            customer: customer_id,
            payment_method: paymentMethod.id,
            off_session: true, // agent acting on behalf of human
            confirm: true, // charge immediately, no redirect
            description: service_name + (business_name ? ` at \${business_name}` : ''),
            metadata: {
                booking_id: booking_id || '',
                agent_id: agent_id || '',
                service: service_name,
                platform: 'agentpay'
            },
            receipt_email: customer.email || undefined
        });
        if (intent.status === 'succeeded') {
            res.json({
                success: true,
                charge_id: intent.latest_charge,
                payment_intent_id: intent.id,
                amount: intent.amount,
                currency: intent.currency,
                status: intent.status,
                service: service_name,
                booking_id,
                customer_email: customer.email,
                card_last4: paymentMethod.card?.last4,
                card_brand: paymentMethod.card?.brand,
                receipt_url: `https://dashboard.stripe.com/payments/${intent.id}`,
                message: `Card ending in ${paymentMethod.card?.last4} charged $${(amount / 100).toFixed(2)} for ${service_name}`
            });
        }
        else if (intent.status === 'requires_action') {
            // 3D Secure required — card needs human auth
            res.status(402).json({
                success: false,
                requires_action: true,
                payment_intent_id: intent.id,
                client_secret: intent.client_secret,
                error: 'Card requires 3D Secure authentication. Human must complete checkout.',
                checkout_url: '/checkout?payment_intent_id=' + intent.id
            });
        }
        else {
            res.status(402).json({ success: false, status: intent.status, error: 'Payment not completed' });
        }
    }
    catch (err) {
        console.error('Agent charge error:', err.message);
        // Handle specific Stripe errors
        if (err.code === 'card_declined')
            return res.status(402).json({ success: false, error: 'Card declined', code: err.code });
        if (err.code === 'insufficient_funds')
            return res.status(402).json({ success: false, error: 'Insufficient funds', code: err.code });
        if (err.code === 'authentication_required')
            return res.status(402).json({ success: false, requires_action: true, error: 'Card requires authentication' });
        res.status(500).json({ success: false, error: err.message });
    }
});
// ════════════════════════════════════════════════════════════════════════════
// UTILITY ROUTES
// ════════════════════════════════════════════════════════════════════════════
/**
 * GET /api/v1/stripe/customer/:id
 * Get a customer's saved cards and billing info (for agent to check before charging)
 */
router.get('/stripe/customer/:id', async (req, res) => {
    try {
        const stripe = getStripe();
        const customer = await stripe.customers.retrieve(req.params.id);
        if (!customer || customer.deleted)
            return res.status(404).json({ success: false, error: 'Customer not found' });
        const methods = await stripe.paymentMethods.list({ customer: req.params.id, type: 'card' });
        res.json({
            success: true,
            customer_id: customer.id,
            email: customer.email,
            name: customer.name,
            cards: methods.data.map(m => ({
                id: m.id,
                brand: m.card?.brand,
                last4: m.card?.last4,
                exp_month: m.card?.exp_month,
                exp_year: m.card?.exp_year,
                is_default: m.id === (customer.invoice_settings?.default_payment_method)
            })),
            has_saved_card: methods.data.length > 0,
            agent_can_charge: methods.data.length > 0
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * GET /api/v1/stripe/config
 * Stripe publishable key + endpoints reference
 */
router.get('/stripe/config', (_req, res) => {
    res.json({
        publishable_key: PUB_KEY(),
        supported_methods: ['card', 'apple_pay', 'google_pay', 'link'],
        currencies: ['usd', 'eur', 'gbp', 'cad', 'aud', 'sgd', 'jpy', 'mxn', 'brl', 'inr'],
        flow: {
            step1_register_human_card: 'POST /api/v1/stripe/setup-customer — human saves card once',
            step2_agent_charges: 'POST /api/v1/stripe/agent-charge — agent charges autonomously per booking',
            check_card_on_file: 'GET  /api/v1/stripe/customer/:id — verify human has card saved',
            verify_payment: 'POST /api/v1/stripe/verify — confirm a charge succeeded',
            hosted_checkout: 'POST /api/v1/stripe/checkout — redirect-based checkout for new users'
        },
        note: 'Agents charge the human card off-session (no human interaction). Human registers card once via setup_url.'
    });
});
/**
 * POST /api/v1/stripe/checkout
 * Hosted checkout — redirect for one-off or new users without saved card
 */
router.post('/stripe/checkout', async (req, res) => {
    try {
        const stripe = getStripe();
        const { amount, currency = 'usd', service_name = 'AgentPay Booking', booking_id, business_name, success_url = 'https://www.x402-agent-pay.com/payment-success', cancel_url = 'https://www.x402-agent-pay.com/payment-cancel' } = req.body;
        if (!amount || amount < 50)
            return res.status(400).json({ success: false, error: 'amount required (min 50 cents)' });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price_data: { currency, product_data: {
                            name: service_name,
                            description: business_name ? `Booked via AgentPay at ${business_name}` : 'Booked via AgentPay',
                        }, unit_amount: Math.round(amount) }, quantity: 1 }],
            mode: 'payment',
            success_url: success_url + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url,
            metadata: { booking_id: booking_id || '', source: 'agentpay' },
        });
        res.json({ success: true, checkout_url: session.url, session_id: session.id, amount, currency });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * POST /api/v1/stripe/payment-intent
 * Payment intent (client-side Stripe Elements / mobile SDK)
 */
router.post('/stripe/payment-intent', async (req, res) => {
    try {
        const stripe = getStripe();
        const { amount, currency = 'usd', booking_id, service_id, agent_address } = req.body;
        if (!amount || amount < 50)
            return res.status(400).json({ success: false, error: 'amount required (min 50 cents)' });
        const intent = await stripe.paymentIntents.create({
            amount: Math.round(amount), currency,
            automatic_payment_methods: { enabled: true },
            metadata: { booking_id: booking_id || '', service_id: service_id || '', agent_address: agent_address || '', source: 'agentpay' },
        });
        res.json({ success: true, client_secret: intent.client_secret, payment_intent_id: intent.id, amount, currency, publishable_key: PUB_KEY() });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * POST /api/v1/stripe/verify
 */
router.post('/stripe/verify', async (req, res) => {
    try {
        const stripe = getStripe();
        const { payment_intent_id, session_id } = req.body;
        if (!payment_intent_id && !session_id)
            return res.status(400).json({ success: false, error: 'payment_intent_id or session_id required' });
        if (session_id) {
            const s = await stripe.checkout.sessions.retrieve(session_id);
            return res.json({ success: true, verified: s.payment_status === 'paid', status: s.payment_status, amount: s.amount_total, currency: s.currency, customer_email: s.customer_details?.email });
        }
        const i = await stripe.paymentIntents.retrieve(payment_intent_id);
        res.json({ success: true, verified: i.status === 'succeeded', status: i.status, amount: i.amount, currency: i.currency });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * POST /api/v1/stripe/webhook
 */
router.post('/stripe/webhook', (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        if (webhookSecret && sig) {
            event = getStripe().webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
        }
        else {
            event = req.body;
        }
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
    switch (event.type) {
        case 'checkout.session.completed':
        case 'payment_intent.succeeded':
            console.log('AgentPay payment confirmed:', event.type, event.data.object);
            break;
        case 'payment_intent.payment_failed':
            console.log('AgentPay payment failed:', event.data.object.last_payment_error?.message);
            break;
        case 'customer.created':
            console.log('New AgentPay customer:', event.data.object.email);
            break;
        case 'setup_intent.succeeded':
            console.log('Card saved for customer:', event.data.object.customer);
            break;
    }
    res.json({ received: true });
});
export default router;
//# sourceMappingURL=stripe-payments.js.map