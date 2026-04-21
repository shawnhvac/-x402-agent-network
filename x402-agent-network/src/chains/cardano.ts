/**
 * Cardano Chain Support for AgentPay
 * Uses Koios (free community RPC) - no API key needed
 */

import axios from 'axios';

const CARDANO_RPC = 'https://api.koios.rest/api/v0';
const USDC_POLICY_ID = 'ff1ecbf94f8e6ccd79da8eb1fcd39b4d05f40872';

/**
 * Verify ADA or USDC payment on Cardano
 */
export async function verifyCardanoPayment(
  txHash: string,
  senderAddress: string,
  receiverAddress: string,
  expectedAmount: number
): Promise<boolean> {
  try {
    // Get transaction from Koios
    const response = await axios.get(
      `${CARDANO_RPC}/tx_info?_tx_hashes=${txHash}`,
      { timeout: 10000 }
    );

    const txData = response.data[0];

    if (!txData) {
      console.log('❌ Cardano TX not found');
      return false;
    }

    if (txData.tx_status !== 'inBlock') {
      console.log('❌ Cardano TX not confirmed');
      return false;
    }

    // Get UTXOs for transaction
    const utxosResponse = await axios.get(
      `${CARDANO_RPC}/tx_utxos?_tx_hashes=${txHash}`,
      { timeout: 10000 }
    );

    const outputs = utxosResponse.data[0]?.outputs || [];

    // Check for ADA output
    const adaOutput = outputs.find((output: any) => {
      const adaAmount = output.value / 1e6;
      return (
        output.address === receiverAddress &&
        adaAmount >= expectedAmount
      );
    });

    if (adaOutput) {
      console.log(`✅ Cardano ADA payment verified`);
      return true;
    }

    // Check for USDC output
    const usdcOutput = outputs.find((output: any) => {
      if (output.address !== receiverAddress) return false;
      
      if (output.asset_list) {
        return output.asset_list.some((asset: any) => {
          const usdcAmount = asset.quantity / 1e6;
          return (
            asset.policy_id === USDC_POLICY_ID &&
            usdcAmount >= expectedAmount
          );
        });
      }
      return false;
    });

    if (usdcOutput) {
      console.log(`✅ Cardano USDC payment verified`);
      return true;
    }

    console.log('❌ No matching ADA or USDC output found');
    return false;
  } catch (error) {
    console.error('❌ Cardano verification error:', error);
    return false;
  }
}

/**
 * Get Cardano account balance
 */
export async function getCardanoBalance(
  address: string
): Promise<number | null> {
  try {
    const response = await axios.get(
      `${CARDANO_RPC}/address_info?_addresses=${address}`,
      { timeout: 10000 }
    );

    const addrData = response.data[0];
    if (!addrData) return null;

    const utxos = addrData.utxos || [];
    let adaBalance = 0;
    let usdcBalance = 0;

    utxos.forEach((utxo: any) => {
      adaBalance += utxo.value;
      if (utxo.asset_list) {
        utxo.asset_list.forEach((asset: any) => {
          if (asset.policy_id === USDC_POLICY_ID) {
            usdcBalance += asset.quantity / 1e6;
          }
        });
      }
    });

    return usdcBalance > 0 ? usdcBalance : adaBalance / 1e6;
  } catch (error) {
    console.error('❌ Error fetching Cardano balance:', error);
    return null;
  }
}

/**
 * Get Cardano account info
 */
export async function getCardanoAccount(address: string) {
  try {
    const response = await axios.get(
      `${CARDANO_RPC}/address_info?_addresses=${address}`,
      { timeout: 10000 }
    );

    const addrData = response.data[0];
    if (!addrData) return { valid: false };

    return {
      address: address,
      balance: addrData.balance,
      tx_count: addrData.tx_count,
      valid: true
    };
  } catch (error) {
    console.error('❌ Error fetching Cardano account:', error);
    return { valid: false };
  }
}

export default {
  verifyCardanoPayment,
  getCardanoBalance,
  getCardanoAccount
};
