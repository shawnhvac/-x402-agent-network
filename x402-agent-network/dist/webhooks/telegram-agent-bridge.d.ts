/**
 * Telegram Agent Bridge - Webhook for agent-to-agent communication
 *
 * Flow:
 * 1. Telegram group message → webhook receives event
 * 2. Parse agent intent (booking, negotiation, payment)
 * 3. Execute SmartEscrow transaction if needed
 * 4. Send response back to Telegram group
 * 5. Log all transactions to database
 */
import { SmartEscrowClient } from '../solana/SmartEscrowClient';
import { SolanaIntegration } from '../solana/SolanaIntegration';
interface EscrowTransaction {
    id: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    currency: 'USDC' | 'SOL';
    status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
    telegramGroupId: number;
    messageId: number;
    timestamp: number;
    transactionHash?: string;
}
export declare class TelegramAgentBridge {
    private router;
    private webhookSecret;
    private telegramBotToken;
    private escrowClient;
    private solanaIntegration;
    private transactions;
    constructor(webhookSecret: string, telegramBotToken: string, escrowClient: SmartEscrowClient, solanaIntegration: SolanaIntegration);
    private setupRoutes;
    private handleTelegramWebhook;
    private verifyWebhookSignature;
    private parseAgentMessage;
    private handleBooking;
    private handleNegotiation;
    private handlePayment;
    private handleStatus;
    private sendTelegramMessage;
    getRouter(): import("express-serve-static-core").Router;
    getTransactions(): EscrowTransaction[];
    getTransaction(id: string): EscrowTransaction | undefined;
}
export default TelegramAgentBridge;
