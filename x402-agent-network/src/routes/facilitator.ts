import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// ─── AgentPay x402 Facilitator ───────────────────────────────────────────────
// Facilitators verify x402 payment headers before data is released.
// The Graph and other x402 services can register AgentPay as their facilitator.
// Revenue model: AgentPay collects tiered fee on each verified transaction.
//
// Facilitator spec: https://github.com/coinbase/x402
// Our endpoint: https://www.x402-agent-pay.com/api/v1/facilitator/verify

const AGENTPAY_FEE_TIERS = [
  { maxAmount: 50_000,   fee: 0.03 },  // 3% under $50
  { maxAmount: 200_000,  fee: 0.02 },  // 2% $50-$200
  { maxAmount: Infinity, fee: 0.01 },  // 1% over $200
];

function calculateFee(amountUsdc: number): number {
  const tier = AGENTPAY_FEE_TIERS.find(t => amountUsdc <= t.maxAmount);
  return (tier?.fee || 0.01) * amountUsdc;
}

// In-memory nonce store (replace with Redis/DB in production)
const usedNonces = new Set<string>();

/**
 * POST /api/v1/facilitator/verify
 * x402 payment verification endpoint.
 * Called by The Graph gateway (and any x402 service) to verify payments.
 *
 * Request body (x402 spec):
 * {
 *   x402Version: 1,
 *   scheme: "exact",
 *   network: "base",
 *   payload: { signature, authorization: { from, to, value, validAfter, validBefore, nonce } }
 * }
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { x402Version, scheme, network, payload } = req.body;

    // Validate x402 version
    if (x402Version !== 1) {
      return res.status(400).json({ isValid: false, invalidReason: 'Unsupported x402 version' });
    }

    // Only support 'exact' scheme (matches The Graph's requirements)
    if (scheme !== 'exact') {
      return res.status(400).json({ isValid: false, invalidReason: `Unsupported scheme: ${scheme}` });
    }

    // Only support Base mainnet and Base Sepolia
    if (!['base', 'base-sepolia'].includes(network)) {
      return res.status(400).json({ isValid: false, invalidReason: `Unsupported network: ${network}` });
    }

    const { signature, authorization } = payload || {};
    if (!signature || !authorization) {
      return res.status(400).json({ isValid: false, invalidReason: 'Missing signature or authorization' });
    }

    const { from, to, value, validAfter, validBefore, nonce } = authorization;

    // 1. Check nonce hasn't been used (replay protection)
    if (usedNonces.has(nonce)) {
      return res.status(400).json({ isValid: false, invalidReason: 'Nonce already used (replay attack)' });
    }

    // 2. Check time validity
    const now = Math.floor(Date.now() / 1000);
    if (now < parseInt(validAfter)) {
      return res.status(400).json({ isValid: false, invalidReason: 'Payment not yet valid' });
    }
    if (now > parseInt(validBefore)) {
      return res.status(400).json({ isValid: false, invalidReason: 'Payment expired' });
    }

    // 3. Verify EIP-3009 signature (transferWithAuthorization)
    // In production: use ethers.js to recover signer from signature
    // For now: validate signature format (65 bytes hex)
    if (!/^0x[0-9a-fA-F]{130}$/.test(signature)) {
      return res.status(400).json({ isValid: false, invalidReason: 'Invalid signature format' });
    }

    // 4. Calculate AgentPay fee
    const amountUsdc = parseInt(value) / 1_000_000; // USDC has 6 decimals
    const feeUsdc = calculateFee(amountUsdc);

    // 5. Mark nonce as used
    usedNonces.add(nonce);

    // 6. Log the verified payment
    console.log(`[Facilitator] Verified payment: ${amountUsdc} USDC from ${from} to ${to}, fee: ${feeUsdc.toFixed(6)} USDC`);

    // Return x402 spec compliant response
    res.json({
      isValid: true,
      x402Version: 1,
      payer: from,
      payee: to,
      network,
      scheme,
      amountUsdc,
      agentpayFee: feeUsdc,
      agentpayFeeAddress: '0x52893C94B03B5c5732c5AE71728cD69E360645Ce',
      verifiedAt: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error('[Facilitator] Verify error:', err);
    res.status(500).json({ isValid: false, invalidReason: 'Internal facilitator error' });
  }
});

/**
 * POST /api/v1/facilitator/settle
 * Called after successful data delivery to settle/record the payment.
 * Optional in x402 spec but good practice for bookkeeping.
 */
router.post('/settle', async (req: Request, res: Response) => {
  try {
    const { nonce, txHash, amountUsdc, payer, payee } = req.body;
    // In production: write to DB, trigger fee collection
    console.log(`[Facilitator] Settled: ${amountUsdc} USDC, tx: ${txHash}`);
    res.json({ success: true, settled: true, nonce, txHash });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/facilitator/info
 * Facilitator discovery endpoint — The Graph and other services
 * can call this to learn AgentPay's facilitator capabilities.
 */
router.get('/info', (_req: Request, res: Response) => {
  res.json({
    name: 'AgentPay x402 Facilitator',
    version: '1.0.0',
    operator: 'x402AgentPay LLC',
    contact: 'X402agentpay@gmail.com',
    website: 'https://www.x402-agent-pay.com',
    patent: 'US Provisional Patent 64/049,095',
    supportedSchemes: ['exact'],
    supportedNetworks: ['base', 'base-sepolia'],
    supportedAssets: {
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',       // USDC on Base
      'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
    },
    feeStructure: {
      tier1: { range: '$0-$50', fee: '3%' },
      tier2: { range: '$50-$200', fee: '2%' },
      tier3: { range: '$200+', fee: '1%' },
    },
    endpoints: {
      verify: 'https://www.x402-agent-pay.com/api/v1/facilitator/verify',
      settle: 'https://www.x402-agent-pay.com/api/v1/facilitator/settle',
    },
  });
});

export default router;
