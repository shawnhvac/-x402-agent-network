/**
 * Hedera Chain Support for AgentPay
 * High throughput, stable fees
 */

import axios from 'axios';

const HEDERA_RPC = 'https://mainnet.mirrornode.hedera.com';
const USDC_TOKEN_ID = '0.0.456858'; // Hedera USDC token ID
const HBAR_CODE = 'HBAR'; // Native Hedera token

interface HederaTransaction {
  transaction_hash: string;
  consensus_timestamp: string;
  valid_start_timestamp: string;
  charged_tx_fee: number;
  result: string;
}

/**
 * Verify USDC or HBAR payment on Hedera
 */
export async function verifyHederaPayment(
  txHash: string,
  senderAccount: string,
  receiverAccount: string,
  expectedAmount: number
): Promise<boolean> {
  try {
    // Get transaction from Hedera Mirror Node
    const response = await axios.get(
      `${HEDERA_RPC}/api/v1/transactions/${txHash}`,
      { timeout: 10000 }
    );

    const tx = response.data.transactions[0];

    if (tx.result !== 'SUCCESS') {
      console.log('❌ Hedera TX failed:', tx.result);
      return false;
    }

    // Check for HBAR (native) transfer
    if (tx.transfers) {
      const hbarTransfer = tx.transfers.find((t: any) => {
        const amount = Math.abs(t.amount) / 1e8; // HBAR has 8 decimals
        return (
          t.account === receiverAccount &&
          t.amount > 0 &&
          amount >= expectedAmount
        );
      });

      if (hbarTransfer) {
        console.log(`✅ Hedera HBAR payment verified: ${Math.abs(hbarTransfer.amount) / 1e8} HBAR`);
        return true;
      }
    }

    // Get token transfers in transaction
    const transfersResponse = await axios.get(
      `${HEDERA_RPC}/api/v1/transactions/${txHash}/token_transfers`,
      { timeout: 10000 }
    );

    const transfers = transfersResponse.data.token_transfers;

    // Look for USDC transfer
    const usdcTransfer = transfers.find((t: any) => {
      const amount = Math.abs(t.amount) / 1e6; // USDC has 6 decimals
      return (
        t.token_id === USDC_TOKEN_ID &&
        t.account === senderAccount &&
        amount >= expectedAmount
      );
    });

    if (usdcTransfer) {
      console.log(`✅ Hedera USDC payment verified: ${usdcTransfer.amount / 1e6} USDC`);
      return true;
    }

    console.log('❌ No matching HBAR or USDC transfer found');
    return false;
  } catch (error) {
    console.error('❌ Hedera verification error:', error);
    return false;
  }
}

/**
 * Get Hedera account balance
 */
export async function getHederaBalance(
  accountId: string
): Promise<number | null> {
  try {
    const response = await axios.get(
      `${HEDERA_RPC}/api/v1/accounts/${accountId}/token_balances`,
      { timeout: 10000 }
    );

    const balances = response.data.tokens;
    const usdcBalance = balances.find((b: any) => b.token_id === USDC_TOKEN_ID);

    return usdcBalance ? usdcBalance.balance / 1e6 : 0;
  } catch (error) {
    console.error('❌ Error fetching Hedera balance:', error);
    return null;
  }
}

/**
 * Get Hedera account info
 */
export async function getHederaAccount(accountId: string) {
  try {
    const response = await axios.get(
      `${HEDERA_RPC}/api/v1/accounts/${accountId}`,
      { timeout: 10000 }
    );

    const account = response.data.accounts[0];

    return {
      accountId: accountId,
      balance: account.balance.balance,
      publicKey: account.key?.key,
      valid: true
    };
  } catch (error) {
    console.error('❌ Error fetching Hedera account:', error);
    return { valid: false };
  }
}

export default {
  verifyHederaPayment,
  getHederaBalance,
  getHederaAccount
};
