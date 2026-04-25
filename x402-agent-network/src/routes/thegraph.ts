import { Router, Request, Response } from 'express';

const router = Router();

// ─── The Graph x402 Integration ──────────────────────────────────────────────
// AgentPay uses The Graph Network for indexed blockchain data queries.
// Payment: USDC on Base mainnet via x402 protocol (same stack as AgentPay itself)
// Docs: https://thegraph.com/docs/en/subgraphs/guides/x402-payments/

const GRAPH_GATEWAY_MAINNET = 'https://gateway.thegraph.com';
const GRAPH_GATEWAY_TESTNET = 'https://testnet.gateway.thegraph.com';

// Key subgraphs useful for AgentPay's blockchain data needs
const SUBGRAPHS = {
  // USDC transfers on Base — track AgentPay payment flows
  usdcBase: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
  // Uniswap v3 on Base — USDC/ETH pricing data
  uniswapV3Base: 'HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B',
  // ENS — resolve wallet addresses to names
  ens: '5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH',
};

/**
 * Helper: Query any Graph subgraph via x402 payment
 * Uses AgentPay's EOA wallet (EOA can sign EIP-3009)
 */
async function queryGraphX402(subgraphId: string, gqlQuery: string, testnet = false): Promise<any> {
  const gateway = testnet ? GRAPH_GATEWAY_TESTNET : GRAPH_GATEWAY_MAINNET;
  const endpoint = `${gateway}/api/x402/subgraphs/id/${subgraphId}`;

  // Step 1: Send query, expect 402 back
  const probe = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: gqlQuery }),
  });

  if (probe.status !== 402) {
    // Already authorized or no payment needed
    return await probe.json();
  }

  // Step 2: Parse payment requirements from 402 response
  const paymentRequired = await probe.json();
  const { amount, network, asset, recipient, scheme } = paymentRequired?.accepts?.[0] || {};

  if (!amount || !recipient) {
    throw new Error('Invalid 402 payment requirements from The Graph');
  }

  // Step 3: Sign EIP-3009 payment using EOA wallet private key
  // The EOA wallet (0x59b59B...) can sign EIP-3009 unlike the Smart Wallet
  const { signPayment } = await import('../services/agent-wallet.js');
  const paymentHeader = await signPayment({ amount, network, asset, recipient, scheme });

  // Step 4: Retry with payment header
  const result = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Payment': paymentHeader,
    },
    body: JSON.stringify({ query: gqlQuery }),
  });

  return await result.json();
}

/**
 * GET /api/v1/graph/wallet-history
 * Query USDC transfer history for a wallet address via The Graph
 */
router.get('/wallet-history', async (req: Request, res: Response) => {
  try {
    const { address, limit = '10' } = req.query as { address: string; limit: string };
    if (!address) return res.status(400).json({ success: false, error: 'address required' });

    const query = `{
      transfers(
        first: ${parseInt(limit)}
        where: { or: [{ from: "${address.toLowerCase()}" }, { to: "${address.toLowerCase()}" }] }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        from
        to
        value
        timestamp
        transaction { id }
      }
    }`;

    const data = await queryGraphX402(SUBGRAPHS.usdcBase, query);
    res.json({ success: true, source: 'the-graph-x402', data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/graph/usdc-price
 * Get live USDC/ETH price from Uniswap v3 on Base via The Graph
 */
router.get('/usdc-price', async (req: Request, res: Response) => {
  try {
    const query = `{
      pools(
        where: { token0_: { symbol: "USDC" }, token1_: { symbol: "WETH" } }
        orderBy: totalValueLockedUSD
        orderDirection: desc
        first: 1
      ) {
        token0Price
        token1Price
        totalValueLockedUSD
        volumeUSD
      }
    }`;

    const data = await queryGraphX402(SUBGRAPHS.uniswapV3Base, query);
    res.json({ success: true, source: 'the-graph-x402', data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/graph/ens-lookup
 * Resolve an ENS name to an address (or address to ENS name)
 */
router.get('/ens-lookup', async (req: Request, res: Response) => {
  try {
    const { name } = req.query as { name: string };
    if (!name) return res.status(400).json({ success: false, error: 'name required' });

    const query = `{
      domains(where: { name: "${name.toLowerCase()}" }) {
        name
        resolvedAddress { id }
        owner { id }
      }
    }`;

    const data = await queryGraphX402(SUBGRAPHS.ens, query);
    res.json({ success: true, source: 'the-graph-x402', data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/graph/subgraphs
 * List AgentPay's registered subgraph endpoints
 */
router.get('/subgraphs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    description: 'AgentPay uses The Graph Network for indexed blockchain data via x402 payments',
    payment_method: 'USDC on Base mainnet (x402 protocol)',
    gateway: GRAPH_GATEWAY_MAINNET,
    subgraphs: SUBGRAPHS,
    docs: 'https://thegraph.com/docs/en/subgraphs/guides/x402-payments/',
  });
});

/**
 * POST /api/v1/graph/query
 * Generic endpoint — pass any subgraph ID + GraphQL query
 * Useful for AgentPay's internal agents to query arbitrary subgraphs
 */
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { subgraph_id, query, testnet = false } = req.body;
    if (!subgraph_id || !query) {
      return res.status(400).json({ success: false, error: 'subgraph_id and query required' });
    }
    const data = await queryGraphX402(subgraph_id, query, testnet);
    res.json({ success: true, source: 'the-graph-x402', subgraph_id, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
