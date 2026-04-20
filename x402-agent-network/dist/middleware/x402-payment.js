/**
 * x402 Payment Middleware
 * Enables AgentPay endpoints to accept x402 payments via Bazaar
 *
 * Each endpoint requires agent to make x402 payment before accessing
 * Automatically registers with Bazaar after first successful payment
 */
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { bazaarResourceServerExtension, declareDiscoveryExtension, } from "@x402/extensions/bazaar";
/**
 * Initialize x402 payment infrastructure
 *
 * Uses CDP facilitator for production (handles Bazaar auto-registration)
 * Falls back to x402.org for testing/staging
 */
export const initializeX402 = () => {
    const facilitatorUrl = process.env.X402_FACILITATOR_URL ||
        "https://api.cdp.coinbase.com/platform/v2/x402/facilitator";
    const facilitatorClient = new HTTPFacilitatorClient({
        url: facilitatorUrl,
    });
    const x402Server = new x402ResourceServer(facilitatorClient);
    registerExactEvmScheme(x402Server);
    x402Server.registerExtension(bazaarResourceServerExtension);
    return { x402Server, facilitatorClient };
};
/**
 * Setup x402 payment middleware on Express app
 *
 * Protects three core endpoints:
 * 1. /api/v1/search - Find services ($0.001)
 * 2. /api/v1/book - Reserve service ($0.002)
 * 3. /api/v1/pay - Execute payment ($0.001)
 */
export const setupX402Middleware = (app) => {
    const { x402Server } = initializeX402();
    const agentPayWallet = process.env.AGENTPAY_WALLET ||
        "0x1234567890123456789012345678901234567890"; // Placeholder
    app.use(paymentMiddleware({
        // ===== ENDPOINT 1: SERVICE DISCOVERY =====
        "POST /api/v1/search": {
            accepts: {
                scheme: "exact",
                price: "$0.001",
                network: "eip155:1", // Ethereum mainnet
                payTo: agentPayWallet,
            },
            extensions: {
                ...declareDiscoveryExtension({
                    input: {
                        schema: {
                            type: "object",
                            properties: {
                                category: {
                                    type: "string",
                                    description: "Service category (salon, restaurant, mechanic, etc)"
                                },
                                location: {
                                    type: "string",
                                    description: "Location (address or coordinates)"
                                },
                                date: {
                                    type: "string",
                                    description: "Desired service date (ISO 8601)"
                                },
                                duration: {
                                    type: "integer",
                                    description: "Service duration in minutes (optional)"
                                },
                            },
                            required: ["category", "location"],
                        },
                    },
                    output: {
                        example: {
                            services: [
                                {
                                    id: "salon-123",
                                    name: "Local Salon",
                                    rating: 4.8,
                                    price_min: 45,
                                    price_max: 75,
                                    distance_miles: 1.2,
                                    availability: ["2026-04-18 2pm", "2026-04-19 10am"],
                                },
                                {
                                    id: "salon-456",
                                    name: "Premium Salon",
                                    rating: 4.9,
                                    price_min: 60,
                                    price_max: 120,
                                    distance_miles: 2.5,
                                    availability: ["2026-04-18 3pm", "2026-04-19 11am"],
                                },
                            ],
                        },
                        schema: {
                            type: "object",
                            properties: {
                                services: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                            rating: { type: "number" },
                                            price_min: { type: "number" },
                                            price_max: { type: "number" },
                                            distance_miles: { type: "number" },
                                            availability: { type: "array", items: { type: "string" } },
                                        },
                                        required: ["id", "name", "price_min", "availability"],
                                    },
                                },
                            },
                        },
                    },
                }),
            },
        },
        // ===== ENDPOINT 2: SERVICE BOOKING =====
        "POST /api/v1/book": {
            accepts: {
                scheme: "exact",
                price: "$0.002",
                network: "eip155:1",
                payTo: agentPayWallet,
            },
            extensions: {
                ...declareDiscoveryExtension({
                    input: {
                        schema: {
                            type: "object",
                            properties: {
                                service_id: {
                                    type: "string",
                                    description: "Service ID from search results"
                                },
                                booking_time: {
                                    type: "string",
                                    description: "Desired booking time (ISO 8601)"
                                },
                                customer_wallet: {
                                    type: "string",
                                    description: "Customer's Ethereum wallet address"
                                },
                                customer_name: {
                                    type: "string",
                                    description: "Customer name for booking"
                                },
                            },
                            required: ["service_id", "booking_time", "customer_wallet"],
                        },
                    },
                    output: {
                        example: {
                            booking_id: "booking-456",
                            status: "confirmed",
                            service_date: "2026-04-18 2pm",
                            service_name: "Hair Cut",
                            provider: "Local Salon",
                            price: 55.00,
                            confirmation_code: "AGPAY-ABC123",
                        },
                        schema: {
                            type: "object",
                            properties: {
                                booking_id: { type: "string" },
                                status: { type: "string" },
                                service_date: { type: "string" },
                                service_name: { type: "string" },
                                provider: { type: "string" },
                                price: { type: "number" },
                                confirmation_code: { type: "string" },
                            },
                            required: ["booking_id", "status", "service_date"],
                        },
                    },
                }),
            },
        },
        // ===== ENDPOINT 3: PAYMENT SETTLEMENT =====
        "POST /api/v1/pay": {
            accepts: {
                scheme: "exact",
                price: "$0.001", // Meta fee only
                network: "eip155:1",
                payTo: agentPayWallet,
            },
            extensions: {
                ...declareDiscoveryExtension({
                    input: {
                        schema: {
                            type: "object",
                            properties: {
                                booking_id: {
                                    type: "string",
                                    description: "Booking ID from /book endpoint"
                                },
                                service_price: {
                                    type: "number",
                                    description: "Service price in USD"
                                },
                                customer_wallet: {
                                    type: "string",
                                    description: "Customer wallet for escrow"
                                },
                            },
                            required: ["booking_id", "service_price", "customer_wallet"],
                        },
                    },
                    output: {
                        example: {
                            transaction_hash: "0xabcdef1234567890...",
                            status: "settled",
                            escrow_address: "0xescrow1234567890...",
                            booking_id: "booking-456",
                            amount: 55.00,
                        },
                        schema: {
                            type: "object",
                            properties: {
                                transaction_hash: { type: "string" },
                                status: { type: "string" },
                                escrow_address: { type: "string" },
                                booking_id: { type: "string" },
                                amount: { type: "number" },
                            },
                            required: ["transaction_hash", "status", "escrow_address"],
                        },
                    },
                }),
            },
        },
    }, x402Server));
};
/**
 * Extract x402 payment info from request
 * Called after payment middleware validates the payment
 */
export const getX402PaymentInfo = (req) => {
    return {
        verified: req.x402?.verified || false,
        payer: req.x402?.payer || null,
        amount: req.x402?.amount || null,
        network: req.x402?.network || null,
    };
};
//# sourceMappingURL=x402-payment.js.map