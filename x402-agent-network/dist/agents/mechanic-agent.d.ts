/**
 * Mechanic Agent - Autonomous Service Provider AI
 *
 * Behavior:
 * - Registers available services
 * - Responds to service requests with quotes
 * - Accepts escrow agreements
 * - Performs work (simulated)
 * - Completes milestones
 * - Receives payments automatically
 * - Builds reputation through successful transactions
 *
 * NO HUMAN INTERVENTION REQUIRED
 */
export interface MechanicCapabilities {
    serviceType: string;
    basePrice: number;
    estimatedTime: number;
    quality: number;
    availability: boolean;
}
export interface MilestoneCompletion {
    milestoneIndex: number;
    description: string;
    completedAt: number;
    resultHash: string;
}
export interface ServiceJob {
    escrowId: number;
    vehicleAgent: string;
    serviceType: string;
    price: number;
    startedAt: number;
    estimatedCompletion: number;
    status: 'pending' | 'in_progress' | 'completed';
    milestonesCompleted: MilestoneCompletion[];
}
/**
 * Mechanic Agent Class
 *
 * Represents an autonomous service provider that can:
 * 1. Advertise services
 * 2. Quote for service requests
 * 3. Accept escrow agreements
 * 4. Complete work and milestones
 * 5. Receive payments automatically
 */
export declare class MechanicAgent {
    private agentId;
    private walletAddress;
    private name;
    private reputation;
    private capabilities;
    private activeJobs;
    private completedJobs;
    private totalEarnings;
    constructor(agentId: string, walletAddress: string, name: string, capabilities: MechanicCapabilities[]);
    /**
     * Get list of services this mechanic offers
     */
    getAvailableServices(): MechanicCapabilities[];
    /**
     * Check if mechanic can provide specific service
     */
    canProvideService(serviceType: string): boolean;
    /**
     * Generate quote for service request
     * Quote is based on mechanic's capabilities and current load
     */
    generateQuote(serviceType: string, requestId: string): {
        quoteId: string;
        priceUSDC: number;
        estimatedTimeMinutes: number;
        availability: boolean;
    } | null;
    /**
     * Accept escrow and begin service
     */
    acceptEscrow(escrowId: number, vehicleAgent: string, serviceType: string, price: number, estimatedTime: number): ServiceJob;
    /**
     * Complete a milestone and emit proof
     */
    completeMilestone(escrowId: number, milestoneIndex: number, description: string): MilestoneCompletion | null;
    /**
     * Mark job as completed and move to history
     */
    private completeJob;
    /**
     * Receive payment automatically when milestone completed
     * This is called by SmartEscrow.completeMilestone()
     */
    receivePayment(escrowId: number, amount: number, milestone: string): void;
    getAgentId(): string;
    getWalletAddress(): string;
    getName(): string;
    getReputation(): number;
    getActiveJobs(): ServiceJob[];
    getCompletedJobs(): ServiceJob[];
    getTotalEarnings(): number;
    getStats(): {
        reputation: number;
        activeJobs: number;
        completedJobs: number;
        totalEarnings: number;
        avgQuality: number;
    };
}
export default MechanicAgent;
