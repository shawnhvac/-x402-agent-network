/**
 * Polygon Chain Support for AgentPay
 * Chain: Polygon Mainnet (eip155:137)
 * USDC: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 (native USDC, not bridged)
 * RPC:  https://polygon-rpc.com (public) or POLYGON_RPC_ENDPOINT env var
 */
import { createPublicClient, createWalletClient, http, parseAbi, parseUnits, formatUnits } from 'viem';
import { polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
// ── Chain constants ──────────────────────────────────────────────────────────
export const POLYGON_CHAIN_ID = 137;
export const POLYGON_NETWORK_ID = 'eip155:137';
export const POLYGON_RPC = process.env.POLYGON_RPC_ENDPOINT || 'https://polygon-rpc.com';
export const POLYGON_USDC = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
export const POLYGON_USDC_BRIDGED = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // USDC.e fallback
// EIP-3009 transferWithAuthorization ABI (same as Base USDC)
const EIP3009_ABI = parseAbi([
    'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)',
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function name() view returns (string)',
    'function version() view returns (string)',
    'function nonces(address owner) view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
]);
// ── viem clients ─────────────────────────────────────────────────────────────
export function getPolygonPublicClient() {
    return createPublicClient({
        chain: polygon,
        transport: http(POLYGON_RPC),
    });
}
export function getPolygonWalletClient(privateKey) {
    const account = privateKeyToAccount(privateKey);
    return {
        client: createWalletClient({
            account,
            chain: polygon,
            transport: http(POLYGON_RPC),
        }),
        account,
    };
}
// ── Balance check ─────────────────────────────────────────────────────────────
export async function getPolygonUSDCBalance(address) {
    const client = getPolygonPublicClient();
    try {
        const balance = await client.readContract({
            address: POLYGON_USDC,
            abi: EIP3009_ABI,
            functionName: 'balanceOf',
            args: [address],
        });
        return formatUnits(balance, 6); // USDC is 6 decimals
    }
    catch {
        // Fallback to bridged USDC.e
        const balance = await client.readContract({
            address: POLYGON_USDC_BRIDGED,
            abi: EIP3009_ABI,
            functionName: 'balanceOf',
            args: [address],
        });
        return formatUnits(balance, 6);
    }
}
// ── EIP-3009 payment verification ────────────────────────────────────────────
export async function verifyPolygonPayment(txHash, expectedFrom, expectedTo, expectedAmountUSDC) {
    const client = getPolygonPublicClient();
    try {
        const receipt = await client.getTransactionReceipt({ hash: txHash });
        if (!receipt || receipt.status !== 'success') {
            return { valid: false, reason: 'Transaction failed or not found' };
        }
        // Verify USDC transfer logs
        const expectedAmount = parseUnits(expectedAmountUSDC, 6);
        const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'; // Transfer(address,address,uint256)
        const usdcLog = receipt.logs.find(log => (log.address.toLowerCase() === POLYGON_USDC.toLowerCase() ||
            log.address.toLowerCase() === POLYGON_USDC_BRIDGED.toLowerCase()) &&
            log.topics[0] === transferTopic &&
            log.topics[2]?.toLowerCase().includes(expectedTo.toLowerCase().slice(2)));
        if (!usdcLog) {
            return { valid: false, reason: 'No USDC transfer to payee found in transaction' };
        }
        return { valid: true };
    }
    catch (err) {
        return { valid: false, reason: `RPC error: ${err.message}` };
    }
}
// ── x402 payment acceptance config (used by middleware) ──────────────────────
export function getPolygonX402Config(payToWallet) {
    return {
        scheme: 'exact',
        network: POLYGON_NETWORK_ID,
        payTo: payToWallet,
        asset: POLYGON_USDC,
        extra: {
            name: 'Polygon',
            nativeCurrency: 'MATIC / POL',
            blockExplorer: 'https://polygonscan.com',
            gasToken: 'POL',
            avgBlockTime: '2s',
            bridgeFrom: 'https://wallet.polygon.technology',
        },
    };
}
export default {
    POLYGON_CHAIN_ID,
    POLYGON_NETWORK_ID,
    POLYGON_RPC,
    POLYGON_USDC,
    getPolygonPublicClient,
    getPolygonWalletClient,
    getPolygonUSDCBalance,
    verifyPolygonPayment,
    getPolygonX402Config,
};
//# sourceMappingURL=polygon.js.map