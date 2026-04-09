/**
 * Stellar Chain Support for AgentPay
 * Simple account-based verification like Solana
 */
import axios from 'axios';
const STELLAR_RPC = 'https://horizon.stellar.org';
const USDC_ISSUER = 'GBUQWP3BOUZX34ZONKCS5DUV3QQ7T5N5VS37VMRG5FORGE7EOAE2HUZ'; // Stellar USDC issuer
const USDC_CODE = 'USDC';
const XLM_CODE = 'XLM'; // Native Stellar
/**
 * Verify USDC or XLM payment on Stellar
 */
export async function verifyStellarPayment(txHash, requesterWallet, treasuryWallet, expectedAmount) {
    try {
        // Get transaction details from Horizon API
        const response = await axios.get(`${STELLAR_RPC}/transactions/${txHash}`, { timeout: 10000 });
        const tx = response.data;
        // Check if transaction succeeded
        if (!tx.successful) {
            console.log('❌ Stellar TX failed:', txHash);
            return false;
        }
        // Get operations in the transaction
        const opsResponse = await axios.get(`${STELLAR_RPC}/transactions/${txHash}/operations`, { timeout: 10000 });
        const operations = opsResponse.data._embedded.records;
        // Look for USDC payment
        const usdcPayment = operations.find((op) => {
            return (op.type === 'payment' &&
                op.source_account === requesterWallet &&
                op.destination_account === treasuryWallet &&
                op.asset_code === USDC_CODE &&
                op.asset_issuer === USDC_ISSUER &&
                parseFloat(op.amount) >= expectedAmount);
        });
        if (usdcPayment) {
            console.log(`✅ Stellar USDC payment verified: ${usdcPayment.amount} USDC`);
            return true;
        }
        // Look for XLM (native) payment
        const xlmPayment = operations.find((op) => {
            return (op.type === 'payment' &&
                op.source_account === requesterWallet &&
                op.destination_account === treasuryWallet &&
                op.asset_type === 'native' &&
                parseFloat(op.amount) >= expectedAmount);
        });
        if (xlmPayment) {
            console.log(`✅ Stellar XLM payment verified: ${xlmPayment.amount} XLM`);
            return true;
        }
        console.log('❌ No matching USDC or XLM payment found');
        return false;
    }
    catch (error) {
        console.error('❌ Stellar verification error:', error);
        return false;
    }
}
/**
 * Check account balance on Stellar (USDC or XLM)
 */
export async function getStellarBalance(walletAddress, assetCode = 'USDC') {
    try {
        const response = await axios.get(`${STELLAR_RPC}/accounts/${walletAddress}`, { timeout: 10000 });
        const balances = response.data.balances;
        if (assetCode === 'XLM') {
            // Native XLM balance
            const xlmBalance = balances.find((b) => b.asset_type === 'native');
            return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
        }
        else {
            // USDC balance
            const usdcBalance = balances.find((b) => b.asset_code === USDC_CODE && b.asset_issuer === USDC_ISSUER);
            return usdcBalance ? parseFloat(usdcBalance.balance) : 0;
        }
    }
    catch (error) {
        console.error('❌ Error fetching Stellar balance:', error);
        return null;
    }
}
/**
 * Get Stellar account info
 */
export async function getStellarAccount(walletAddress) {
    try {
        const response = await axios.get(`${STELLAR_RPC}/accounts/${walletAddress}`, { timeout: 10000 });
        return {
            address: walletAddress,
            sequence: response.data.sequence,
            subentryCount: response.data.subentry_count,
            balances: response.data.balances,
            valid: true
        };
    }
    catch (error) {
        console.error('❌ Error fetching Stellar account:', error);
        return { valid: false };
    }
}
export default {
    verifyStellarPayment,
    getStellarBalance,
    getStellarAccount
};
//# sourceMappingURL=stellar.js.map