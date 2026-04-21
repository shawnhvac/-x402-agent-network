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

import { PublicKey } from '@solana/web3.js';

// ===== DATA STRUCTURES =====

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
  urgency: 'low' | 'medium' | 'high'; // Impacts scoring
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
  qualityScore?: number; // 0-100, based on seller reputation
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
  overallScore: number; // 0-100
  reputationScore: number; // 0-100
  priceScore: number; // 0-100 (higher = cheaper)
  timeScore: number; // 0-100 (higher = faster)
  breakdownScore?: {
    reputation: number; // Weight: 0.40
    price: number; // Weight: 0.35
    time: number; // Weight: 0.25
  };
}

export interface NegotiationResult {
  selectedQuoteId: string;
  selectedSeller: string;
  selectedPrice: number;
  selectedTime: number;
  escrowId?: number; // Set after escrow creation
  selectedMilestones?: any[];
  negotiationTime: number; // ms taken to decide
}

// ===== NEGOTIATION ENGINE CLASS =====

export class AutonomousNegotiationEngine {
  private agentAddress: string;
  private agentRegistry: AgentRegistry;
  private reputationCache: Map<string, number> = new Map();

  constructor(agentAddress: string, agentRegistry: AgentRegistry) {
    this.agentAddress = agentAddress;
    this.agentRegistry = agentRegistry;
  }

  // ===== 1. DISCOVER AVAILABLE SERVICES =====

  /**
   * Query AgentRegistry for available services matching criteria
   */
  async discoverServices(
    serviceType: string,
    maxBudget: number,
    maxTime: number
  ): Promise<Service[]> {
    try {
      console.log(`🔍 Discovering ${serviceType} services...`);

      // Query registry for services
      const allAgents = await this.agentRegistry.getAllAgents();
      const matchingServices: Service[] = [];

      for (const agent of allAgents) {
        const services = await this.agentRegistry.getAgentServices(agent.walletAddress);

        for (const service of services) {
          // Filter by service type and budget/time constraints
          if (
            service.name.toLowerCase().includes(serviceType.toLowerCase()) &&
            service.basePriceUSDC <= maxBudget &&
            service.estimatedTimeMinutes <= maxTime &&
            service.active
          ) {
            matchingServices.push(service);
          }
        }
      }

      console.log(`✅ Found ${matchingServices.length} matching services`);
      return matchingServices;
    } catch (error) {
      console.error('❌ Service discovery failed:', error);
      throw error;
    }
  }

  // ===== 2. REQUEST QUOTES =====

  /**
   * Send quote requests to multiple service providers
   * Returns array of quotes from different agents
   */
  async requestQuotes(
    serviceType: string,
    maxBudgetUSDC: number,
    maxTimeMinutes: number,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Quote[]> {
    const startTime = Date.now();

    try {
      console.log(`📋 Requesting quotes for ${serviceType}...`);

      // 1. Discover available services
      const services = await this.discoverServices(
        serviceType,
        maxBudgetUSDC,
        maxTimeMinutes
      );

      if (services.length === 0) {
        console.warn('⚠️ No matching services found');
        return [];
      }

      // 2. Create quote request
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const quoteRequest: QuoteRequest = {
        requestId,
        buyerAgent: this.agentAddress,
        serviceType,
        maxBudgetUSDC,
        maxTimeMinutes,
        urgency,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 min expiry
      };

      // 3. Request quotes from all matching agents
      const quotes: Quote[] = [];
      const quotePromises = services.map((service) =>
        this.requestQuoteFromAgent(service, quoteRequest)
      );

      const results = await Promise.allSettled(quotePromises);

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          quotes.push(result.value);
        }
      }

      console.log(`✅ Received ${quotes.length} quotes in ${Date.now() - startTime}ms`);
      return quotes;
    } catch (error) {
      console.error('❌ Quote request failed:', error);
      throw error;
    }
  }

  /**
   * Request quote from individual agent
   */
  private async requestQuoteFromAgent(
    service: Service,
    quoteRequest: QuoteRequest
  ): Promise<Quote | null> {
    try {
      // In production: Send signed message to agent via AgentProtocol
      // For now: Simulate quote response

      const quote: Quote = {
        quoteId: `quote_${Date.now()}_${service.agentAddress.substr(0, 6)}`,
        requestId: quoteRequest.requestId,
        sellerAgent: service.agentAddress,
        serviceId: service.serviceId,
        priceUSDC: service.basePriceUSDC,
        estimatedTimeMinutes: service.estimatedTimeMinutes,
        availability: true,
        expiresAt: Date.now() + 10 * 60 * 1000,
        signedAt: Date.now(),
        qualityScore: await this.getAgentReputation(service.agentAddress),
        milestones: [
          { description: 'Initial deposit', percentOfTotal: 0 },
          { description: 'Service completion', percentOfTotal: 100 },
        ],
      };

      return quote;
    } catch (error) {
      console.error(`❌ Failed to get quote from ${service.agentAddress}:`, error);
      return null;
    }
  }

  // ===== 3. EVALUATE OFFERS =====

  /**
   * Evaluate all quotes and score them based on:
   * - Reputation (40% weight)
   * - Price (35% weight)
   * - Time (25% weight)
   */
  async evaluateOffers(quotes: Quote[]): Promise<EvaluatedOffer[]> {
    console.log(`📊 Evaluating ${quotes.length} quotes...`);

    const evaluated: EvaluatedOffer[] = [];

    // Find min/max for normalization
    const prices = quotes.map((q) => q.priceUSDC);
    const times = quotes.map((q) => q.estimatedTimeMinutes);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    for (const quote of quotes) {
      // 1. Get seller reputation
      const reputationScore = await this.getAgentReputation(quote.sellerAgent);

      // 2. Normalize price (lower price = higher score)
      const priceScore =
        maxPrice === minPrice ? 100 : ((maxPrice - quote.priceUSDC) / (maxPrice - minPrice)) * 100;

      // 3. Normalize time (faster time = higher score)
      const timeScore =
        maxTime === minTime
          ? 100
          : ((maxTime - quote.estimatedTimeMinutes) / (maxTime - minTime)) * 100;

      // 4. Calculate weighted overall score
      const overallScore =
        reputationScore * 0.4 + priceScore * 0.35 + timeScore * 0.25;

      evaluated.push({
        quoteId: quote.quoteId,
        sellerAgent: quote.sellerAgent,
        overallScore: Math.round(overallScore),
        reputationScore: Math.round(reputationScore),
        priceScore: Math.round(priceScore),
        timeScore: Math.round(timeScore),
        breakdownScore: {
          reputation: Math.round(reputationScore * 0.4),
          price: Math.round(priceScore * 0.35),
          time: Math.round(timeScore * 0.25),
        },
      });
    }

    // Sort by overall score (descending)
    evaluated.sort((a, b) => b.overallScore - a.overallScore);

    console.log(`✅ Evaluation complete. Top offer score: ${evaluated[0]?.overallScore || 0}/100`);
    return evaluated;
  }

  // ===== 4. AUTO-SELECT BEST DEAL =====

  /**
   * Autonomously select the best quote based on evaluation
   * Default: Pick top-ranked offer, but allow customization
   */
  selectBestDeal(
    evaluatedOffers: EvaluatedOffer[],
    minAcceptableScore: number = 70
  ): EvaluatedOffer | null {
    if (evaluatedOffers.length === 0) {
      console.warn('⚠️ No offers to select from');
      return null;
    }

    const bestOffer = evaluatedOffers[0];

    if (bestOffer.overallScore < minAcceptableScore) {
      console.warn(
        `⚠️ Best offer score ${bestOffer.overallScore} below minimum ${minAcceptableScore}`
      );
      return null;
    }

    console.log(
      `✅ Selected offer from ${bestOffer.sellerAgent}: Score ${bestOffer.overallScore}/100`
    );
    return bestOffer;
  }

  // ===== 5. CREATE ESCROW AUTOMATICALLY =====

  /**
   * Automatically create escrow based on selected offer
   */
  async createEscrow(
    selectedOffer: EvaluatedOffer,
    originalQuote: Quote,
    milestoneDefs?: { description: string; percentOfTotal: number }[]
  ): Promise<NegotiationResult> {
    const startTime = Date.now();

    try {
      console.log(`⏳ Creating escrow for selected offer...`);

      // Default milestones if not provided
      const milestones = milestoneDefs || originalQuote.milestones || [
        { description: 'Service completion', percentOfTotal: 100 },
      ];

      // Calculate milestone payments
      const totalPrice = originalQuote.priceUSDC;
      const milestoneCriteria: string[] = [];
      const milestonePayments: number[] = [];

      for (const milestone of milestones) {
        milestoneCriteria.push(milestone.description);
        milestonePayments.push(
          Math.round((totalPrice * milestone.percentOfTotal) / 100)
        );
      }

      // In production: Call SmartEscrow.createEscrow() via Anchor client
      // For now: Simulate escrow creation
      const escrowId = Math.floor(Math.random() * 1000000);

      const result: NegotiationResult = {
        selectedQuoteId: selectedOffer.quoteId,
        selectedSeller: selectedOffer.sellerAgent,
        selectedPrice: originalQuote.priceUSDC,
        selectedTime: originalQuote.estimatedTimeMinutes,
        escrowId,
        selectedMilestones: milestones,
        negotiationTime: Date.now() - startTime,
      };

      console.log(`✅ Escrow created: ID ${escrowId}`);
      return result;
    } catch (error) {
      console.error('❌ Escrow creation failed:', error);
      throw error;
    }
  }

  // ===== HELPER FUNCTIONS =====

  /**
   * Get agent reputation from cache or query registry
   */
  private async getAgentReputation(agentAddress: string): Promise<number> {
    // Check cache first
    if (this.reputationCache.has(agentAddress)) {
      return this.reputationCache.get(agentAddress) || 50;
    }

    try {
      // Query registry
      const agent = await this.agentRegistry.getAgent(agentAddress);
      const reputation = agent?.reputation || 50;

      // Cache it
      this.reputationCache.set(agentAddress, reputation);
      return reputation;
    } catch (error) {
      console.warn(`⚠️ Could not fetch reputation for ${agentAddress}, defaulting to 50`);
      return 50;
    }
  }

  /**
   * Clear reputation cache (useful for testing)
   */
  clearCache(): void {
    this.reputationCache.clear();
  }
}

// ===== HIGH-LEVEL ORCHESTRATION =====

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
export async function autonomousNegotiate(
  engine: AutonomousNegotiationEngine,
  quotes: Quote[],
  minAcceptableScore: number = 70
): Promise<NegotiationResult | null> {
  try {
    console.log('\n🚀 AUTONOMOUS NEGOTIATION STARTING...\n');

    // Evaluate all quotes
    const evaluated = await engine.evaluateOffers(quotes);

    // Auto-select best deal
    const bestOffer = engine.selectBestDeal(evaluated, minAcceptableScore);
    if (!bestOffer) {
      console.error('❌ No acceptable offers found');
      return null;
    }

    // Find original quote details
    const originalQuote = quotes.find((q) => q.quoteId === bestOffer.quoteId);
    if (!originalQuote) {
      throw new Error('Quote details not found');
    }

    // Create escrow automatically
    const result = await engine.createEscrow(bestOffer, originalQuote);

    console.log('\n✅ NEGOTIATION COMPLETE\n');
    console.log(`Selected: ${bestOffer.sellerAgent}`);
    console.log(`Price: ${result.selectedPrice} USDC`);
    console.log(`Time: ${result.selectedTime} minutes`);
    console.log(`Escrow ID: ${result.escrowId}`);
    console.log(`Total negotiation time: ${result.negotiationTime}ms\n`);

    return result;
  } catch (error) {
    console.error('❌ NEGOTIATION FAILED:', error);
    return null;
  }
}

// ===== AGENT REGISTRY INTERFACE =====

export interface AgentRegistry {
  getAllAgents(): Promise<Agent[]>;
  getAgent(address: string): Promise<Agent | null>;
  getAgentServices(agentAddress: string): Promise<Service[]>;
}

export interface Agent {
  walletAddress: string;
  name: string;
  reputation: number; // 0-100
  totalTransactions: number;
  successRate: number;
  active: boolean;
}

// ===== EXAMPLE USAGE =====

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
