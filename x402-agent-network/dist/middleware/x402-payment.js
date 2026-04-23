/**
 * x402 Payment Middleware — AgentPay
 * Updated: Added Bazaar discovery extension for CDP indexing
 */
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { createPrivateKey } from "crypto";
import { SignJWT, importPKCS8 } from "jose";
import { readFileSync } from "fs";
const WALLET = (process.env.AGENTPAY_WALLET ||
    "0x52893C94B03B5c5732c5AE71728cD69E360645Ce");
const BASE_MAINNET = "eip155:8453";
const CDP_FACILITATOR_URL = "https://api.cdp.coinbase.com/platform/v2/x402";
const CDP_KEY_PATH = process.env.CDP_KEY_PATH || "/root/.openclaw/workspace/cdp_key.json";
async function buildCDPToken(action) {
    const cdpKey = JSON.parse(readFileSync(CDP_KEY_PATH, "utf8"));
    const keyObj = createPrivateKey({ key: cdpKey.privateKey, format: "pem" });
    const pkcs8 = keyObj.export({ type: "pkcs8", format: "pem" }).toString();
    const privateKey = await importPKCS8(pkcs8, "ES256");
    const now = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString().slice(2, 18);
    const method = action === "supported" ? "GET" : "POST";
    return new SignJWT({
        sub: cdpKey.name, iss: "cdp", aud: ["cdp_service"],
        uris: [`${method} api.cdp.coinbase.com/platform/v2/x402/${action}`],
        nbf: now,
    })
        .setProtectedHeader({ alg: "ES256", kid: cdpKey.name, nonce })
        .setIssuedAt(now)
        .setExpirationTime(now + 120)
        .sign(privateKey);
}
async function createAuthHeaders() {
    const [verifyToken, settleToken, supportedToken] = await Promise.all([
        buildCDPToken("verify"),
        buildCDPToken("settle"),
        buildCDPToken("supported"),
    ]);
    return {
        verify: { Authorization: `Bearer ${verifyToken}` },
        settle: { Authorization: `Bearer ${settleToken}` },
        supported: { Authorization: `Bearer ${supportedToken}` },
    };
}
const PAID_ROUTES = {
    "POST /api/v1/search": {
        accepts: [{ scheme: "exact", price: "$0.001", network: BASE_MAINNET, payTo: WALLET }],
        description: "Search for local service providers (HVAC, plumbing, hair salons, restaurants, etc.) by query, category, and location. Returns a ranked list of providers with pricing and availability.",
        extensions: {
            bazaar: {
                input: { query: "hvac repair", location: "Phoenix, AZ", category: "hvac" },
                inputSchema: {
                    properties: {
                        query: { type: "string", description: "Search term e.g. 'hvac repair' or 'hair salon'" },
                        location: { type: "string", description: "City and state e.g. 'Phoenix, AZ'" },
                        category: { type: "string", description: "Service category: hvac, plumbing, hair-beauty, food-dining, etc." },
                    },
                    required: ["query"],
                },
                bodyType: "json",
                output: {
                    example: { success: true, count: 5, results: [{ id: "hvac-phx-001", name: "Desert Air HVAC", price: 99, rating: 4.8 }] },
                },
            },
        },
    },
    "POST /api/v1/book": {
        accepts: [{ scheme: "exact", price: "$0.002", network: BASE_MAINNET, payTo: WALLET }],
        description: "Book a service appointment with a provider. Supply the service ID (from /search), service type, date, time, and customer details. Returns a booking confirmation with ID.",
        extensions: {
            bazaar: {
                input: { service_id: "salon-ny-001", service_type: "haircut", date: "2026-04-25", time: "10:00", customer_name: "Alice", customer_email: "alice@example.com" },
                inputSchema: {
                    properties: {
                        service_id: { type: "string", description: "Provider ID from /search results" },
                        service_type: { type: "string", description: "Type of service to book e.g. haircut, hvac-repair" },
                        date: { type: "string", description: "Appointment date in YYYY-MM-DD format" },
                        time: { type: "string", description: "Appointment time in HH:MM format" },
                        customer_name: { type: "string", description: "Customer full name" },
                        customer_email: { type: "string", description: "Customer email address" },
                    },
                    required: ["service_id", "service_type", "date", "time"],
                },
                bodyType: "json",
                output: {
                    example: { success: true, booking: { id: "BK-1234567890", service_name: "Manhattan Hair Studio", status: "pending_confirmation", price: 65 } },
                },
            },
        },
    },
    "POST /api/v1/pay": {
        accepts: [{ scheme: "exact", price: "$0.001", network: BASE_MAINNET, payTo: WALLET }],
        description: "Confirm payment for a completed service booking. Supply the booking ID and on-chain payment transaction hash to finalise the service transaction.",
        extensions: {
            bazaar: {
                input: { booking_id: "BK-1234567890", payment_tx: "0xabc123..." },
                inputSchema: {
                    properties: {
                        booking_id: { type: "string", description: "Booking ID returned from /book" },
                        payment_tx: { type: "string", description: "On-chain transaction hash for the service payment" },
                    },
                    required: ["booking_id", "payment_tx"],
                },
                bodyType: "json",
                output: {
                    example: { success: true, payment: { booking_id: "BK-1234567890", status: "confirmed" } },
                },
            },
        },
    },
};
function seedResourceServerSync(server, facilitatorClient) {
    const supportedResponse = {
        kinds: [{ x402Version: 2, scheme: "exact", network: BASE_MAINNET }],
    };
    if (!server.supportedResponsesMap.has(2))
        server.supportedResponsesMap.set(2, new Map());
    const respVersionMap = server.supportedResponsesMap.get(2);
    if (!respVersionMap.has(BASE_MAINNET))
        respVersionMap.set(BASE_MAINNET, new Map());
    respVersionMap.get(BASE_MAINNET).set("exact", supportedResponse);
    if (!server.facilitatorClientsMap.has(2))
        server.facilitatorClientsMap.set(2, new Map());
    const clientVersionMap = server.facilitatorClientsMap.get(2);
    if (!clientVersionMap.has(BASE_MAINNET))
        clientVersionMap.set(BASE_MAINNET, new Map());
    clientVersionMap.get(BASE_MAINNET).set("exact", facilitatorClient);
}
export function setupX402Middleware(app) {
    const facilitatorClient = new HTTPFacilitatorClient({
        url: CDP_FACILITATOR_URL,
        createAuthHeaders,
    });
    const evmScheme = new ExactEvmScheme();
    const server = new x402ResourceServer(facilitatorClient)
        .register(BASE_MAINNET, evmScheme);
    seedResourceServerSync(server, facilitatorClient);
    app.use(paymentMiddleware(PAID_ROUTES, server, undefined, undefined, false));
    console.log("\u2705 x402 middleware live — Base mainnet seeded, CDP facilitator per-request");
    console.log(`\u{1F4B3} Wallet: ${WALLET} | ${BASE_MAINNET}`);
    console.log("\u{1F310} POST /api/v1/search ($0.001) | /api/v1/book ($0.002) | /api/v1/pay ($0.001)");
    console.log("\u{1F50D} Bazaar extensions declared on all 3 routes");
}
export function getX402PaymentInfo() {
    return {
        wallet: WALLET,
        network: BASE_MAINNET,
        facilitator: CDP_FACILITATOR_URL,
        endpoints: Object.keys(PAID_ROUTES),
    };
}
//# sourceMappingURL=x402-payment.js.map