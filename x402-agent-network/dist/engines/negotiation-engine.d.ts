/**
 * Autonomous Negotiation Engine
 *
 * Enables AI agents to autonomously:
 * 1. Discover available services
 * 2. Request quotes from multiple providers
 * 3. Evaluate offers (reputation + price + time)
 * 4. Auto-select best deal
 * 5. Create escrow automatically
 *
 * Core philosophy: Agents make economic decisions without human intervention
 */
export interface Service {
    serviceId: string;
    agentAddress: string;
    name: string;
    description: string;
    basePriceUSDC: number;
    estimatedTimeMinutes: number;
    active: boolean;
}
export interface QuoteRequest {
    requestId: string;
    buyerAgent: string;
    serviceType: string;
    maxBudgetUSDC: number;
    maxTimeMinutes: number;
    urgency: 'low' | 'medium' | 'high';
    requirements?: string[];
    createdAt: number;
    expiresAt: number;
}
export interface Quote {
    quoteId: string;
    requestId: string;
    sellerAgent: string;
    serviceId: string;
    priceUSDC: number;
    estimatedTimeMinutes: number;
    availability: boolean;
    qualityScore?: number;
    milestones?: {
        description: string;
        percentOfTotal: number;
    }[];
    expiresAt: number;
    signedAt: number;
}
export interface EvaluatedOffer {
    quoteId: string;
    sellerAgent: string;
    overallScore: number;
    reputationScore: number;
    priceScore: number;
    timeScore: number;
    breakdownScore?: {
        reputation: number;
        price: number;
        time: number;
    };
}
export interface NegotiationResult {
    selectedQuoteId: string;
    selectedSeller: string;
    selectedPrice: number;
    selectedTime: number;
    escrowId?: number;
    selectedMilestones?: any[];
    negotiationTime: number;
}
export declare class AutonomousNegotiationEngine {
    private agentAddress;
    private agentRegistry;
    private reputationCache;
    constructor(agentAddress: string, agentRegistry: AgentRegistry);
    /**
     * Query AgentRegistry for available services matching criteria
     */
    discoverServices(serviceType: string, maxBudget: number, maxTime: number): Promise<Service[]>;
    /**
     * Send quote requests to multiple service providers
     * Returns array of quotes from different agents
     */
    requestQuotes(serviceType: string, maxBudgetUSDC: number, maxTimeMinutes: number, urgency?: 'low' | 'medium' | 'high'): Promise<Quote[]>;
    /**
     * Request quote from individual agent
     */
    private requestQuoteFromAgent;
    /**
     * Evaluate all quotes and score them based on:
     * - Reputation (40% weight)
     * - Price (35% weight)
     * - Time (25% weight)
     */
    evaluateOffers(quotes: Quote[]): Promise<EvaluatedOffer[]>;
    /**
     * Autonomously select the best quote based on evaluation
     * Default: Pick top-ranked offer, but allow customization
     */
    selectBestDeal(evaluatedOffers: EvaluatedOffer[], minAcceptableScore?: number): EvaluatedOffer | null;
    /**
     * Automatically create escrow based on selected offer
     */
    createEscrow(selectedOffer: EvaluatedOffer, originalQuote: Quote, milestoneDefs?: {
        description: string;
        percentOfTotal: number;
    }[]): Promise<NegotiationResult>;
    /**
     * Get agent reputation from cache or query registry
     */
    private getAgentReputation;
    /**
     * Clear reputation cache (useful for testing)
     */
    clearCache(): void;
}
/**
 * Complete autonomous negotiation flow
 * Agent calls this one function to:
 * 1. Discover services
 * 2. Get quotes
 * 3. Evaluate offers
 * 4. Select best deal
 * 5. Create escrow
 * ALL AUTOMATICALLY
 */
export declare function autonomousNegotiate(engine: AutonomousNegotiationEngine, quotes: Quote[], minAcceptableScore?: number): Promise<NegotiationResult | null>;
export interface AgentRegistry {
    getAllAgents(): Promise<Agent[]>;
    getAgent(address: string): Promise<Agent | null>;
    getAgentServices(agentAddress: string): Promise<Service[]>;
}
export interface Agent {
    walletAddress: string;
    name: string;
    reputation: number;
    totalTransactions: number;
    successRate: number;
    active: boolean;
}
/**
 * Example: Vehicle Agent autonomously getting tune-up
 *
 * const vehicleAgent = new AutonomousNegotiationEngine(
 *   vehicleWalletAddress,
 *   agentRegistry
 * );
 *
 * // 1. Request quotes
 * const quotes = await vehicleAgent.requestQuotes(
 *   'tune-up',
 *   100,        // max 100 USDC
 *   120,        // max 120 minutes
 *   'medium'    // medium urgency
 * );
 *
 * // 2-5. All automatic
 * const result = await autonomousNegotiate(vehicleAgent, quotes);
 *
 * // Result: Escrow created with best mechanic, payment ready
 * // Vehicle proceeds autonomously
 */
export default AutonomousNegotiationEngine;
