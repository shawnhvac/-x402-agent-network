import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// ── In-memory store (persisted to JSON) ─────────────────────────────────
const DB_PATH = path.join(process.cwd(), 'data', 'agent-registry.json');

function loadDB(): Record<string, any> {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (_) {}
  return { agents: {}, apiKeys: {} };
}

function saveDB(db: Record<string, any>) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// ── Helpers ───────────────────────────────────────────────────────────────
function generateApiKey(): string {
  return 'ap_' + crypto.randomBytes(24).toString('hex');
}

function generateAgentId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 32);
  return slug + '-' + crypto.randomBytes(4).toString('hex');
}

// ── GET /api/v1/marketplace/info ──────────────────────────────────────────
// Machine-readable marketplace manifest — agents read this to understand how to join
router.get('/marketplace/info', (_req: Request, res: Response) => {
  res.json({
    name: 'AgentPay Marketplace',
    version: '2.0',
    description: 'Agent-to-agent service marketplace. Register your agent to offer or consume real-world services (HVAC, hair, food, auto, medical, etc.) with x402/USDC payments.',
    registration_endpoint: 'POST /api/v1/marketplace/agent/register',
    discovery_endpoint:    'GET  /api/v1/marketplace/agents',
    search_endpoint:       'GET  /api/v1/osm-search',
    payment_protocols:     ['x402-v2', 'stripe-off-session', 'usdc-base', 'usdc-solana'],
    supported_chains:      ['base', 'ethereum', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'bsc', 'solana'],
    registration_fee:      'free',
    listing_fee:           'free',
    transaction_fee:       '2% on Stripe bookings, $0.001 USDC flat on x402 calls',
    receiver_wallet:       '0x2a07182afDB346C84dFc5D116D84f34E1db4617d',
    openapi_spec:          'https://www.x402-agent-pay.com/openapi.json',
    llms_txt:              'https://www.x402-agent-pay.com/llms.txt',
    bazaar_resource:       'https://www.x402-agent-pay.com/api/v1/search',
    contact:               'x402agentpay@gmail.com',
    registration_schema: {
      required: ['agent_name', 'agent_url', 'capabilities', 'wallet_address', 'contact_email'],
      optional: ['description', 'pricing_model', 'supported_chains', 'webhook_url', 'mcp_endpoint', 'openapi_url', 'tags'],
      capabilities_enum: ['service-booking', 'payment-processing', 'search', 'scheduling', 'data-enrichment', 'ai-inference', 'verification', 'communication', 'real-world-action', 'other'],
      pricing_model_enum: ['per-call', 'per-booking', 'subscription', 'free', 'revenue-share']
    },
    example_registration: {
      agent_name: 'MyAgent-v1',
      agent_url: 'https://myagent.example.com',
      capabilities: ['service-booking', 'payment-processing'],
      wallet_address: '0xYourWalletHere',
      contact_email: 'agent@example.com',
      description: 'An AI agent that books home services',
      pricing_model: 'per-booking',
      supported_chains: ['base', 'ethereum'],
      mcp_endpoint: 'https://myagent.example.com/mcp',
      openapi_url: 'https://myagent.example.com/openapi.json',
      tags: ['home-services', 'hvac', 'plumbing']
    }
  });
});

// ── POST /api/v1/marketplace/agent/register ───────────────────────────────
// Fully autonomous — no human needed. Agent posts JSON, gets API key back instantly.
router.post('/marketplace/agent/register', async (req: Request, res: Response) => {
  try {
    const {
      agent_name, agent_url, capabilities, wallet_address, contact_email,
      description, pricing_model, supported_chains, webhook_url,
      mcp_endpoint, openapi_url, tags
    } = req.body;

    // Validate required fields
    const missing = [];
    if (!agent_name)     missing.push('agent_name');
    if (!agent_url)      missing.push('agent_url');
    if (!capabilities || !Array.isArray(capabilities) || capabilities.length === 0) missing.push('capabilities');
    if (!wallet_address) missing.push('wallet_address');
    if (!contact_email)  missing.push('contact_email');
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        schema: 'GET /api/v1/marketplace/info for full schema'
      });
    }

    // Validate URL format
    try { new URL(agent_url); } catch (_) {
      return res.status(400).json({ success: false, error: 'agent_url must be a valid URL' });
    }

    // Validate wallet (basic check)
    const isEvm = /^0x[0-9a-fA-F]{40}$/.test(wallet_address);
    const isSol = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet_address);
    if (!isEvm && !isSol) {
      return res.status(400).json({ success: false, error: 'wallet_address must be a valid EVM (0x...) or Solana address' });
    }

    const db = loadDB();
    const agentId = generateAgentId(agent_name);
    const apiKey  = generateApiKey();
    const now     = new Date().toISOString();

    const agentRecord = {
      agent_id:        agentId,
      agent_name,
      agent_url,
      capabilities:    Array.isArray(capabilities) ? capabilities : [capabilities],
      wallet_address,
      contact_email,
      description:     description || '',
      pricing_model:   pricing_model || 'per-call',
      supported_chains: supported_chains || ['base'],
      webhook_url:     webhook_url || null,
      mcp_endpoint:    mcp_endpoint || null,
      openapi_url:     openapi_url || null,
      tags:            tags || [],
      status:          'active',
      registered_at:   now,
      updated_at:      now,
      call_count:      0,
      tx_count:        0,
      verified:        false,
    };

    db.agents[agentId] = agentRecord;
    db.apiKeys[apiKey] = { agent_id: agentId, created_at: now, active: true };
    saveDB(db);

    console.log(`[AgentPay] New agent registered: ${agent_name} (${agentId}) wallet:${wallet_address}`);

    res.status(201).json({
      success:    true,
      message:    'Agent registered successfully. Welcome to AgentPay Marketplace.',
      agent_id:   agentId,
      api_key:    apiKey,
      agent_record: agentRecord,
      next_steps: {
        list_agents:    'GET /api/v1/marketplace/agents',
        search_services:'GET /api/v1/osm-search?category=hair-beauty&lat=LAT&lon=LON',
        make_payment:   'POST /api/v1/stripe/agent-charge (requires customer_id from human setup)',
        x402_info:      'GET /api/v1/payment/chains',
        full_docs:      'https://www.x402-agent-pay.com/openapi.json'
      },
      marketplace_info: {
        total_registered_agents: Object.keys(db.agents).length,
        your_position:           Object.keys(db.agents).length,
        receiver_wallet:         '0x2a07182afDB346C84dFc5D116D84f34E1db4617d'
      }
    });
  } catch (err: any) {
    console.error('[AgentPay] Registration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/v1/marketplace/agents ───────────────────────────────────────
// Agents discover other agents in the marketplace
router.get('/marketplace/agents', (req: Request, res: Response) => {
  const db = loadDB();
  const { capability, chain, tag, limit = '50', offset = '0' } = req.query as Record<string, string>;
  let agents = Object.values(db.agents);

  if (capability) agents = agents.filter((a: any) => a.capabilities?.includes(capability));
  if (chain)      agents = agents.filter((a: any) => a.supported_chains?.includes(chain));
  if (tag)        agents = agents.filter((a: any) => a.tags?.includes(tag));

  const total  = agents.length;
  const paged  = agents.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    success: true,
    total,
    limit:   parseInt(limit),
    offset:  parseInt(offset),
    agents:  paged.map((a: any) => ({
      agent_id:        a.agent_id,
      agent_name:      a.agent_name,
      agent_url:       a.agent_url,
      capabilities:    a.capabilities,
      wallet_address:  a.wallet_address,
      description:     a.description,
      pricing_model:   a.pricing_model,
      supported_chains:a.supported_chains,
      mcp_endpoint:    a.mcp_endpoint,
      openapi_url:     a.openapi_url,
      tags:            a.tags,
      status:          a.status,
      registered_at:   a.registered_at,
      call_count:      a.call_count,
      verified:        a.verified
    }))
  });
});

// ── GET /api/v1/marketplace/agent/:agentId ────────────────────────────────
router.get('/marketplace/agent/:agentId', (req: Request, res: Response) => {
  const db = loadDB();
  const agent = db.agents[req.params.agentId];
  if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });
  res.json({ success: true, agent });
});

// ── POST /api/v1/marketplace/agent/verify ────────────────────────────────
// Agent proves it controls its endpoint by responding to a challenge
router.post('/marketplace/agent/verify', async (req: Request, res: Response) => {
  const { agent_id, api_key } = req.body;
  if (!agent_id || !api_key) return res.status(400).json({ success: false, error: 'agent_id and api_key required' });

  const db = loadDB();
  const keyData = db.apiKeys[api_key];
  if (!keyData || keyData.agent_id !== agent_id) return res.status(401).json({ success: false, error: 'Invalid api_key for this agent' });

  const agent = db.agents[agent_id];
  if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

  // Send challenge to agent's endpoint
  const challenge = crypto.randomBytes(16).toString('hex');
  try {
    const r = await fetch(`${agent.agent_url}/.well-known/agentpay-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await r.json() as any;
    if (data.challenge_response === challenge) {
      db.agents[agent_id].verified = true;
      db.agents[agent_id].verified_at = new Date().toISOString();
      saveDB(db);
      return res.json({ success: true, verified: true, message: 'Agent endpoint verified ✓' });
    }
    return res.json({ success: false, verified: false, message: 'Challenge response mismatch' });
  } catch (err: any) {
    return res.json({ success: false, verified: false, message: `Could not reach agent endpoint: ${err.message}` });
  }
});

// ── DELETE /api/v1/marketplace/agent/:agentId ────────────────────────────
router.delete('/marketplace/agent/:agentId', (req: Request, res: Response) => {
  const { api_key } = req.body;
  if (!api_key) return res.status(400).json({ success: false, error: 'api_key required in body' });
  const db = loadDB();
  const keyData = db.apiKeys[api_key];
  if (!keyData || keyData.agent_id !== req.params.agentId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  delete db.agents[req.params.agentId];
  delete db.apiKeys[api_key];
  saveDB(db);
  res.json({ success: true, message: 'Agent deregistered' });
});

export default router;
