import 'dotenv/config';

export const config = {
  // Telegram
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
  
  // Solana
  heliusRpc: process.env.HELIUS_RPC || 'https://api.mainnet-beta.solana.com',
  
  // Treasury
  treasuryWallet: process.env.TREASURY_WALLET || '',
  
  // $MUSKOX Token
  muskoxMint: process.env.MUSKOX_MINT || '6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt',
  minHoldForRevenueShare: parseInt(process.env.MIN_HOLD_FOR_REVENUE_SHARE || '5000000'),
  
  // Subscription
  subscriptionFeeMuskox: parseInt(process.env.SUBSCRIPTION_FEE_MUSKOX || '25'),
  subscriptionDays: 30,
  
  // Fees & Trading
  snipeFeePercent: parseFloat(process.env.SNIPE_FEE_PERCENT || '3'),
  lockFeePercent: parseFloat(process.env.LOCK_FEE_PERCENT || '2'),
  maxSlippageBps: parseInt(process.env.MAX_SLIPPAGE_BPS || '50'),
  
  // Bot
  port: parseInt(process.env.PORT || '3000'),
  environment: process.env.NODE_ENV || 'production',
};

export const validateConfig = () => {
  const required = ['telegramToken', 'treasuryWallet'];
  for (const key of required) {
    if (!config[key as keyof typeof config]) {
      throw new Error(`Missing required config: ${key}`);
    }
  }
};
