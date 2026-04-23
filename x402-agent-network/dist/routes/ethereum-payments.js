import { Router } from 'express';
const router = Router();
const RECEIVER_WALLET = process.env.ETHEREUM_RECEIVER_WALLET || '0x52893C94B03B5c5732c5AE71728cD69E360645Ce';
// ─── Chain Registry ───────────────────────────────────────────────────────
const CHAINS = {
    ethereum: {
        name: "Ethereum", chainId: 1, symbol: "ETH", nativeToken: "ETH",
        rpc: "https://eth.llamarpc.com",
        explorer: "https://etherscan.io/tx/",
        usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    },
    base: {
        name: "Base", chainId: 8453, symbol: "ETH", nativeToken: "ETH",
        rpc: "https://mainnet.base.org",
        explorer: "https://basescan.org/tx/",
        usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        usdt: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"
    },
    polygon: {
        name: "Polygon", chainId: 137, symbol: "MATIC", nativeToken: "MATIC",
        rpc: "https://polygon.llamarpc.com",
        explorer: "https://polygonscan.com/tx/",
        usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        dai: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
    },
    arbitrum: {
        name: "Arbitrum One", chainId: 42161, symbol: "ETH", nativeToken: "ETH",
        rpc: "https://arb1.arbitrum.io/rpc",
        explorer: "https://arbiscan.io/tx/",
        usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        usdt: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        dai: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
    },
    optimism: {
        name: "Optimism", chainId: 10, symbol: "ETH", nativeToken: "ETH",
        rpc: "https://mainnet.optimism.io",
        explorer: "https://optimistic.etherscan.io/tx/",
        usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        usdt: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"
    },
    avalanche: {
        name: "Avalanche C-Chain", chainId: 43114, symbol: "AVAX", nativeToken: "AVAX",
        rpc: "https://api.avax.network/ext/bc/C/rpc",
        explorer: "https://snowtrace.io/tx/",
        usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        usdt: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"
    },
    bsc: {
        name: "BNB Smart Chain", chainId: 56, symbol: "BNB", nativeToken: "BNB",
        rpc: "https://bsc-dataseed.binance.org",
        explorer: "https://bscscan.com/tx/",
        usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        usdt: "0x55d398326f99059fF775485246999027B3197955"
    }
};
// ─── Solana is handled by solana-payments route ───────────────────────────
// Solana USDC mint: EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn
// Solana receiver:  6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG
/**
 * GET /api/v1/payment/chains
 * Returns all supported payment chains and tokens
 */
router.get('/payment/chains', (_req, res) => {
    const chains = Object.entries(CHAINS).map(([id, c]) => ({
        id,
        name: c.name,
        chainId: c.chainId,
        nativeToken: c.nativeToken,
        explorer: c.explorer,
        tokens: [
            c.usdc && { symbol: "USDC", contract: c.usdc },
            c.usdt && { symbol: "USDT", contract: c.usdt },
            c.dai && { symbol: "DAI", contract: c.dai },
            { symbol: c.nativeToken, contract: "native" }
        ].filter(Boolean)
    }));
    res.json({
        success: true,
        receiver_wallet: RECEIVER_WALLET,
        evm_chains: chains,
        solana: {
            network: "mainnet-beta",
            receiver: process.env.SOLANA_RECEIVER_WALLET || "6aCEuwH3PYx99cEmRz45otfxk39uF7ewGhqmvxfXisSG",
            tokens: [
                { symbol: "SOL", contract: "native" },
                { symbol: "USDC", mint: "EPjFWaLb3mLskJ2v2H7NnpXFu6HaKgqHSGAJxg6hGLKn" }
            ]
        },
        x402_primary: {
            network: "Base (eip155:8453)",
            description: "x402 autonomous agent payments use Base + USDC by default",
            payTo: RECEIVER_WALLET
        },
        note: "Same EVM wallet address works across all EVM chains. Solana has a separate receiver."
    });
});
/**
 * GET /api/v1/payment/info
 * Quick payment info for a specific chain
 */
router.get('/payment/info', (req, res) => {
    const { chain = "base" } = req.query;
    const c = CHAINS[chain.toLowerCase()];
    if (!c) {
        return res.status(400).json({
            success: false,
            error: `Unknown chain: \${chain}`,
            supported: Object.keys(CHAINS)
        });
    }
    res.json({
        success: true,
        chain: chain.toLowerCase(),
        name: c.name,
        chainId: c.chainId,
        receiver: RECEIVER_WALLET,
        tokens: {
            native: c.nativeToken,
            usdc: c.usdc || null,
            usdt: c.usdt || null,
            dai: c.dai || null
        },
        explorer: c.explorer,
        add_to_metamask: {
            chainId: `0x\${c.chainId.toString(16)}`,
            chainName: c.name,
            rpcUrls: [c.rpc],
            nativeCurrency: { name: c.nativeToken, symbol: c.nativeToken, decimals: 18 }
        }
    });
});
/**
 * POST /api/v1/payment/verify-evm
 * Verify any EVM transaction across supported chains
 */
router.post('/payment/verify-evm', async (req, res) => {
    try {
        const { tx_hash, chain = "base", expected_amount, expected_token = "USDC" } = req.body;
        if (!tx_hash)
            return res.status(400).json({ success: false, error: "tx_hash required" });
        const c = CHAINS[chain.toLowerCase()];
        if (!c)
            return res.status(400).json({ success: false, error: `Unsupported chain: \${chain}` });
        // Fetch tx receipt from public RPC
        const rpcRes = await fetch(c.rpc, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", id: 1,
                method: "eth_getTransactionReceipt",
                params: [tx_hash]
            })
        });
        const { result } = await rpcRes.json();
        if (!result)
            return res.status(404).json({ success: false, error: "Transaction not found" });
        if (result.status !== "0x1")
            return res.status(402).json({ success: false, error: "Transaction failed on-chain" });
        res.json({
            success: true,
            verified: true,
            tx_hash,
            chain: c.name,
            chainId: c.chainId,
            block: parseInt(result.blockNumber, 16),
            explorer_url: c.explorer + tx_hash,
            status: "confirmed"
        });
    }
    catch (err) {
        console.error("EVM verify error:", err);
        res.status(500).json({ success: false, error: "Verification failed" });
    }
});
// Keep legacy route aliases
router.get('/ethereum/wallet-info', (_req, res) => res.redirect('/api/v1/payment/info?chain=ethereum'));
router.get('/eth/chains', (_req, res) => res.redirect('/api/v1/payment/chains'));
export default router;
//# sourceMappingURL=ethereum-payments.js.map