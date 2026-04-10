import {
  Connection,
  PublicKey,
  VersionedTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import axios from 'axios';
import { config } from './config';

// Force reliable public RPC (Helius free tier is rate-limited)
const RPC_URL = 'https://api.mainnet-beta.solana.com';
console.log(`[SOLANA] Using RPC: ${RPC_URL}`);

const connection = new Connection(RPC_URL, 'confirmed');

/**
 * Fetch Jupiter swap quote for token snipe
 */
export const getJupiterQuote = async (
  inputMint: string,
  outputMint: string,
  amountInLamports: number,
  slippageBps: number = 50
) => {
  const startTime = Date.now();
  console.log(`[JUPITER] Fetching quote: ${inputMint} → ${outputMint}, amount: ${amountInLamports}`);
  
  try {
    const response = await axios.get('https://quote-api.jup.ag/v6/quote', {
      params: {
        inputMint,
        outputMint,
        amount: amountInLamports,
        slippageBps,
      },
      timeout: 15000, // 15 second timeout
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`[JUPITER] Quote received in ${elapsed}ms: outAmount=${response.data.outAmount}`);
    return response.data;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[JUPITER ERROR] (${elapsed}ms): ${errorMsg}`);
    console.error(`[JUPITER ERROR] Full error:`, error);
    throw new Error(`Jupiter API failed: ${errorMsg}`);
  }
};

/**
 * Create unsigned swap transaction
 */
export const createSwapTransaction = async (
  quote: any,
  userPubkey: string
): Promise<string> => {
  const startTime = Date.now();
  console.log(`[JUPITER] Creating swap transaction for user: ${userPubkey}`);
  
  try {
    const response = await axios.post(
      'https://quote-api.jup.ag/v6/swap',
      {
        quoteResponse: quote,
        userPublicKey: userPubkey,
        wrapAndUnwrapSol: true,
      },
      { timeout: 15000 } // 15 second timeout
    );

    const elapsed = Date.now() - startTime;
    console.log(`[JUPITER] Swap transaction created in ${elapsed}ms`);
    return response.data.swapTransaction; // base64 unsigned tx
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[JUPITER ERROR] Swap failed (${elapsed}ms): ${errorMsg}`);
    console.error(`[JUPITER ERROR] Full error:`, error);
    throw new Error(`Failed to create swap: ${errorMsg}`);
  }
};

/**
 * Broadcast signed transaction to Solana
 */
export const broadcastSignedTransaction = async (
  signedBase64: string
): Promise<string> => {
  try {
    const buffer = Buffer.from(signedBase64, 'base64');
    const tx = VersionedTransaction.deserialize(buffer);
    
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: true,
      maxRetries: 5,
    });

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    return signature;
  } catch (error) {
    console.error('Broadcast error:', error);
    throw new Error('Failed to broadcast transaction');
  }
};

/**
 * Get token balance for user
 */
export const getUserTokenBalance = async (
  userPubkey: string,
  mint: string
): Promise<number> => {
  try {
    const pubkey = new PublicKey(userPubkey);
    const mintPubkey = new PublicKey(mint);
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      pubkey,
      { mint: mintPubkey }
    );

    if (tokenAccounts.value.length === 0) return 0;

    const balance = tokenAccounts.value.reduce((sum, account) => {
      const amount = account.account.data.parsed?.info?.tokenAmount?.uiAmount || 0;
      return sum + amount;
    }, 0);

    return balance;
  } catch (error) {
    console.error('Balance check error:', error);
    return 0;
  }
};

/**
 * Validate Solana public key
 */
export const isValidPublicKey = (key: string): boolean => {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get token info (name, symbol, decimals)
 */
export const getTokenInfo = async (mint: string) => {
  try {
    const response = await axios.get(`https://api.helius.xyz/v0/token/metadata`, {
      params: { tokens: [mint] },
      timeout: 5000,
    });
    return response.data?.[0] || null;
  } catch (error) {
    console.error('Token info error:', error);
    return null;
  }
};

export { connection };
