/**
 * SmartEscrow Integration Layer
 *
 * Connects autonomous agents to real Solana smart contract
 * Handles:
 * - Escrow creation on-chain
 * - Milestone completion verification
 * - Automatic payment release
 * - On-chain reputation updates
 *
 * Bridge between TypeScript agents and Rust/Anchor SmartEscrow
 */
import { PublicKey } from '@solana/web3.js';
export interface EscrowConfig {
    rpcUrl: string;
    programId: string;
    buyer: PublicKey;
    seller: PublicKey;
    mint: PublicKey;
}
export interface MilestoneData {
    description: string;
    percentOfTotal: number;
    completed: boolean;
    completedAt: number | null;
}
export interface OnChainEscrow {
    escrowId: number;
    buyer: PublicKey;
    seller: PublicKey;
    amount: number;
    milestones: MilestoneData[];
    status: 'active' | 'completed' | 'disputed' | 'cancelled';
    createdAt: number;
    deadline: number;
}
/**
 * SmartEscrow Integration Class
 *
 * Provides interface for agents to interact with on-chain escrow
 */
export declare class SmartEscrowIntegration {
    private connection;
    private programId;
    private buyer;
    private seller;
    private mint;
    private escrowCounter;
    private escrowCache;
    constructor(config: EscrowConfig);
    /**
     * Create escrow on-chain
     *
     * Flow:
     * 1. Derive escrow account address
     * 2. Create escrow with buyer funds
     * 3. Set milestones
     * 4. Return escrow ID for off-chain reference
     */
    createEscrow(amount: number, // USDC (will be converted to lamports)
    milestones: MilestoneData[], deadlineMinutes?: number): Promise<{
        escrowId: number;
        escrowAddress: PublicKey;
        transactionSignature: string;
    }>;
    /**
     * Complete milestone and trigger payment
     *
     * Flow:
     * 1. Verify milestone exists
     * 2. Mark as completed with proof
     * 3. Release partial payment if triggered
     * 4. Update on-chain state
     */
    completeMilestone(escrowId: number, milestoneIndex: number, proofHash: string): Promise<{
        success: boolean;
        paymentAmount: number;
        transactionSignature: string;
    }>;
    /**
     * Get escrow state from on-chain
     */
    getEscrowState(escrowId: number): Promise<OnChainEscrow | null>;
    /**
     * Verify milestone completion on-chain
     *
     * Returns:
     * - True if milestone marked as complete
     * - False if not yet completed
     * - Throws if escrow not found
     */
    verifyMilestoneCompletion(escrowId: number, milestoneIndex: number): Promise<boolean>;
    /**
     * Get escrow balance available for release
     */
    getEscrowBalance(escrowId: number): Promise<number>;
    /**
     * Listen for milestone completion events
     *
     * In production: Subscribe to SmartEscrow program events
     */
    watchMilestoneCompletions(escrowId: number, callback: (milestone: MilestoneData, index: number) => void): Promise<void>;
    /**
     * Dispute escrow (halt payments, initiate arbitration)
     */
    disputeEscrow(escrowId: number, reason: string): Promise<string>;
    /**
     * Refund escrow if deadline exceeded
     */
    refundOnTimeout(escrowId: number): Promise<number>;
    /**
     * Get integration stats
     */
    getStats(): {
        totalEscrows: number;
        activeEscrows: number;
        completedEscrows: number;
        totalVolume: number;
    };
}
export default SmartEscrowIntegration;
