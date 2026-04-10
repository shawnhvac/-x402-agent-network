export interface UserSession {
  telegramId: number;
  walletPubkey: string;
  subscribedUntil?: Date;
  lastSnipeTime?: number;
}

export interface SnipeHistory {
  userId: number;
  targetMint: string;
  solAmount: number;
  timestamp: number;
  signature?: string;
  status: 'pending' | 'confirmed' | 'failed';
  profitPercent?: number;
}

export interface Leaderboard {
  userId: number;
  username?: string;
  totalSniped: number;
  totalProfit: number;
  rank: number;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: number;
  outAmount: number;
  slippageBps: number;
  platformFee?: number;
}
