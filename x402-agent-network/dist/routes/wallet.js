import { fileURLToPath as _fup } from 'url';
import { dirname as _dn } from 'path';
const __filename = _fup(import.meta.url);
const __dirname = _dn(__filename);
import { Router } from "express";
import { getWalletStatus, sendUSDC, getWalletAddress } from "../services/agent-wallet.js";
const router = Router();
/**
 * GET /api/v1/wallet/status
 * Returns wallet address, chain, ETH + USDC balances
 * (mirrors: awal status && awal balance)
 */
router.get("/status", async (req, res) => {
    try {
        const status = await getWalletStatus();
        res.json({ success: true, ...status });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * GET /api/v1/wallet/address
 * Returns the agent wallet EVM address
 */
router.get("/address", (req, res) => {
    try {
        const address = getWalletAddress();
        res.json({ success: true, address, chain: process.env.CHAIN || "base" });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * POST /api/v1/wallet/send
 * Body: { amount: "1.00", recipient: "0x..." }
 * Sends USDC on Base
 */
router.post("/send", async (req, res) => {
    try {
        const { amount, recipient } = req.body;
        if (!amount || !recipient) {
            return res.status(400).json({ error: "amount and recipient required" });
        }
        // Basic address validation
        if (!/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
            return res.status(400).json({ error: "Invalid EVM address" });
        }
        const result = await sendUSDC(amount, recipient);
        res.json({ success: true, ...result });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
export default router;
//# sourceMappingURL=wallet.js.map