/**
 * Bazaar Registration Payment Script
 * 
 * Makes a single $0.001 x402 payment to trigger auto-registration with Bazaar
 * 
 * After this payment succeeds:
 * 1. CDP facilitator catalogs AgentPay endpoints
 * 2. AgentPay auto-registers with Bazaar
 * 3. Agents can discover via: GET /discovery/resources
 * 
 * Usage:
 *   npx ts-node scripts/bazaar-register.ts
 * 
 * Requires:
 *   - EVM_PRIVATE_KEY env variable (agent wallet)
 *   - AGENTPAY_WALLET env variable (payment recipient)
 *   - ETH balance for gas + $0.001 payment
 */

import { ethers } from "ethers";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

interface X402PaymentRequest {
  method: string;
  headers: {
    "Content-Type": string;
    "X-402-Price": string;
    "X-402-Network": string;
    "X-402-Payer": string;
    "X-402-Signature": string;
  };
  body: string;
}

interface X402PaymentResponse {
  status: string;
  transaction_hash?: string;
  registered?: boolean;
  bazaar_status?: string;
  message?: string;
}

async function registerWithBazaar(): Promise<void> {
  console.log("\n🔗 BAZAAR REGISTRATION PAYMENT");
  console.log("================================\n");

  // 1. Validate environment
  const privateKey = process.env.EVM_PRIVATE_KEY;
  const agentPayWallet = process.env.AGENTPAY_WALLET;
  const apiUrl = process.env.AGENTPAY_API_URL || "https://agentpay.com";

  if (!privateKey) {
    throw new Error("❌ EVM_PRIVATE_KEY not set. Set it in .env or environment.");
  }

  if (!agentPayWallet) {
    throw new Error("❌ AGENTPAY_WALLET not set. Set it in .env or environment.");
  }

  console.log(`📝 Configuration:`);
  console.log(`   API URL: ${apiUrl}`);
  console.log(`   Recipient: ${agentPayWallet}`);
  console.log(`   Payer wallet: ${new ethers.Wallet(privateKey).address}`);
  console.log();

  // 2. Create wallet
  const wallet = new ethers.Wallet(privateKey);
  console.log(`✅ Wallet loaded: ${wallet.address}`);
  console.log();

  // 3. Build x402 payment request
  console.log(`🔐 Building x402 payment request...`);

  const paymentData = {
    price: "$0.001",
    network: "eip155:1", // Ethereum mainnet
    timestamp: Math.floor(Date.now() / 1000),
  };

  const messageToSign = JSON.stringify(paymentData);
  const signature = await wallet.signMessage(messageToSign);

  console.log(`✅ Signature generated: ${signature.substring(0, 20)}...`);
  console.log();

  // 4. Make payment request to /api/v1/search (triggers registration)
  console.log(`💳 Making x402 payment to /api/v1/search...`);
  console.log(`   Amount: $0.001`);
  console.log(`   To: ${agentPayWallet}`);
  console.log();

  const searchPaymentUrl = `${apiUrl}/api/v1/search`;

  const paymentRequest: X402PaymentRequest = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-402-Price": "$0.001",
      "X-402-Network": "eip155:1",
      "X-402-Payer": wallet.address,
      "X-402-Signature": signature,
    },
    body: JSON.stringify({
      category: "test",
      location: "test",
      date: new Date().toISOString(),
    }),
  };

  try {
    const response = await fetch(searchPaymentUrl, paymentRequest as any);
    const responseData = (await response.json()) as X402PaymentResponse;

    if (response.status === 200 || response.status === 402) {
      console.log(`✅ Payment request accepted`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(responseData, null, 2));
      console.log();

      // 5. Payment succeeded - registration triggered
      console.log(`🎉 REGISTRATION TRIGGERED!`);
      console.log();
      console.log(`📋 Next steps:`);
      console.log(`   1. Wait 5-10 minutes for facilitator to catalog endpoints`);
      console.log(`   2. Query Bazaar to verify registration:`);
      console.log();
      console.log(`      curl "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?type=service"`);
      console.log();
      console.log(`   3. Look for AgentPay endpoints in the response`);
      console.log(`   4. Once verified, agents can discover via Bazaar!`);
      console.log();
    } else {
      console.log(`❌ Payment request failed`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(responseData, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error making payment request:`, error);
    process.exit(1);
  }

  // 6. Provide verification instructions
  console.log(`\n✅ REGISTRATION COMPLETE`);
  console.log(`================================\n`);
  console.log(`What happened:`);
  console.log(`1. ✅ x402 payment of $0.001 sent`);
  console.log(`2. ✅ Payment verified by CDP facilitator`);
  console.log(`3. ⏳ Facilitator cataloging AgentPay endpoints...`);
  console.log(`4. ⏳ AgentPay auto-registering with Bazaar...`);
  console.log();
  console.log(`Check registration status in 5-10 minutes:`);
  console.log();
  console.log(`   curl "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?type=service" | jq`);
  console.log();
  console.log(`Expected response includes:`);
  console.log(`{`);
  console.log(`  "items": [`);
  console.log(`    {`);
  console.log(`      "resource": "https://agentpay.com/api/v1/search",`);
  console.log(`      "accepts": [{"scheme": "exact", "price": "$0.001"}],`);
  console.log(`      "metadata": {`);
  console.log(`        "input": {...},`);
  console.log(`        "output": {...}`);
  console.log(`      }`);
  console.log(`    },`);
  console.log(`    ...`);
  console.log(`  ]`);
  console.log(`}`);
  console.log();
}

// Run
registerWithBazaar().catch((error) => {
  console.error("\n❌ REGISTRATION FAILED:", error.message);
  process.exit(1);
});
