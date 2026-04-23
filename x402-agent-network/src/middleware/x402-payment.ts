/**
 * x402 Payment Middleware - AgentPay
 * Chains: Base mainnet (eip155:8453) + Polygon (eip155:137)
 * Security fixes: nonce replay, rate limiting, wallet validation
 */
import { Express } from "express";
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { createPrivateKey } from "crypto";
import { SignJWT, importPKCS8 } from "jose";
import { readFileSync } from "fs";
import rateLimit from "express-rate-limit";

// ── Wallet ────────────────────────────────────────────────────────────────────
const WALLET = (process.env.AGENTPAY_WALLET || "0x52893C94B03B5c5732c5AE71728cD69E360645Ce") as `0x${string}`;

// SECURITY FIX 3: Wallet validation at startup
if (!process.env.AGENTPAY_WALLET) console.warn("[SECURITY] AGENTPAY_WALLET not in .env — using fallback");
if (!/^0x[0-9a-fA-F]{40}$/.test(WALLET)) throw new Error("[SECURITY] Invalid AGENTPAY_WALLET: " + WALLET);

// ── Chain IDs ─────────────────────────────────────────────────────────────────
const BASE_MAINNET    = "eip155:8453";
const POLYGON_MAINNET = "eip155:137";
const POLYGON_USDC    = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

// ── CDP auth helpers ──────────────────────────────────────────────────────────
const CDP_URL      = process.env.X402_FACILITATOR_URL || "https://api.cdp.coinbase.com/platform/v2/x402";
const CDP_KEY_PATH = process.env.CDP_KEY_PATH || "/root/.openclaw/workspace/cdp_key.json";

async function buildCDPToken(action: string): Promise<string> {
  const cdpKey = JSON.parse(readFileSync(CDP_KEY_PATH, "utf8"));
  const keyObj = createPrivateKey({ key: cdpKey.privateKey, format: "pem" });
  const pkcs8 = keyObj.export({ type: "pkcs8", format: "pem" }).toString();
  const pk = await importPKCS8(pkcs8, "ES256");
  const now = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString().slice(2, 18);
  const method = action === "supported" ? "GET" : "POST";
  return new SignJWT({
    sub: cdpKey.name, iss: "cdp", aud: ["cdp_service"],
    uris: [`${method} api.cdp.coinbase.com/platform/v2/x402/${action}`],
    nbf: now,
  })
    .setProtectedHeader({ alg: "ES256", kid: cdpKey.name, nonce })
    .setIssuedAt(now).setExpirationTime(now + 120)
    .sign(pk);
}

// ── Custom facilitator: hardcoded getSupported + live CDP verify/settle ───────
// This avoids the startup HTTP call that was failing with 401/unsupported-network
class AgentPayFacilitator {
  // Called once at init — returns our supported chains/schemes directly (no HTTP)
  async getSupported() {
    return {
      kinds: [
        { x402Version: 2, scheme: "exact", network: BASE_MAINNET },
        { x402Version: 2, scheme: "exact", network: POLYGON_MAINNET },
      ],
    };
  }

  async verify(paymentPayload: any, requirements: any) {
    try {
      const token = await buildCDPToken("verify");
      const res = await fetch(`${CDP_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ x402Version: paymentPayload.x402Version, paymentPayload, paymentRequirements: requirements }),
      });
      if (!res.ok) throw new Error(`CDP verify ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error("[x402] verify error:", err.message);
      throw err;
    }
  }

  async settle(paymentPayload: any, requirements: any) {
    try {
      const token = await buildCDPToken("settle");
      const res = await fetch(`${CDP_URL}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ x402Version: paymentPayload.x402Version, paymentPayload, paymentRequirements: requirements }),
      });
      if (!res.ok) throw new Error(`CDP settle ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error("[x402] settle error:", err.message);
      throw err;
    }
  }
}

// ── SECURITY FIX 1: Nonce replay prevention ───────────────────────────────────
const usedPaymentNonces = new Set<string>();
export function checkAndStoreNonce(nonce: string): boolean {
  if (usedPaymentNonces.has(nonce)) {
    console.warn("[SECURITY] Duplicate payment nonce rejected:", nonce);
    return false;
  }
  usedPaymentNonces.add(nonce);
  if (usedPaymentNonces.size > 10000) {
    const iter = usedPaymentNonces.values();
    for (let i = 0; i < 1000; i++) usedPaymentNonces.delete(iter.next().value);
  }
  return true;
}

// ── SECURITY FIX 2: Rate limiter ─────────────────────────────────────────────
const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, max: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
  skip: (req: any) => req.method === "OPTIONS",
});

// ── Multi-chain accepts ───────────────────────────────────────────────────────
function multiChainAccepts(price: string, wallet: `0x${string}`) {
  return [
    { scheme: "exact" as const, price, network: BASE_MAINNET,    payTo: wallet },
    { scheme: "exact" as const, price, network: POLYGON_MAINNET, payTo: wallet },
  ];
}

// ── Paid routes ───────────────────────────────────────────────────────────────
const PAID_ROUTES = {
  "POST /api/v1/search":    { accepts: multiChainAccepts("$0.001", WALLET), description: "Search local service providers." },
  "POST /api/v1/book":      { accepts: multiChainAccepts("$0.002", WALLET), description: "Book a service appointment." },
  "POST /api/v1/ai/search": { accepts: multiChainAccepts("$0.002", WALLET), description: "AI-powered natural language search via NVIDIA NIM." },
  "POST /api/v1/llm":       { accepts: multiChainAccepts("$0.001", WALLET), description: "AI inference — Llama 3.3 70B, Mistral, Gemma, 80+ models." },
  "POST /api/v1/pay":       { accepts: multiChainAccepts("$0.001", WALLET), description: "Process a service payment." },
};

// ── Setup ─────────────────────────────────────────────────────────────────────
export async function setupX402Middleware(app: Express): Promise<void> {
  const paidPaths = ["/api/v1/search", "/api/v1/book", "/api/v1/ai/search", "/api/v1/llm", "/api/v1/pay"];

  // Rate limit before payment check
  for (const path of paidPaths) app.use(path, paymentRateLimiter);

  // Build ResourceServer with our custom facilitator
  const facilitator = new AgentPayFacilitator();
  const ResourceServer = new x402ResourceServer(facilitator as any);

  // Register EVM scheme for both networks
  ResourceServer.register(BASE_MAINNET,    new ExactEvmScheme());
  ResourceServer.register(POLYGON_MAINNET, new ExactEvmScheme());

  app.use(paymentMiddleware(PAID_ROUTES as any, ResourceServer));

  console.log("[x402] Payment middleware ready — Base + Polygon");
  console.log("[x402] Payee wallet:", WALLET);
  console.log("[x402] Paid routes:", Object.keys(PAID_ROUTES).join(", "));
}

// ── Info ──────────────────────────────────────────────────────────────────────
export function getX402PaymentInfo() {
  return { wallet: WALLET, networks: [BASE_MAINNET, POLYGON_MAINNET], polygon_usdc: POLYGON_USDC, routes: PAID_ROUTES };
}
