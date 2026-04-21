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

import { PublicKey } from '@solana/web3.js';

export interface MechanicCapabilities {
  serviceType: string;
  basePrice: number; // USDC
  estimatedTime: number; // minutes
  quality: number; // 0-100 quality score
  availability: boolean;
}

export interface MilestoneCompletion {
  milestoneIndex: number;
  description: string;
  completedAt: number;
  resultHash: string; // IPFS hash or data hash
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
export class MechanicAgent {
  private agentId: string;
  private walletAddress: string;
  private name: string;
  private reputation: number = 85; // Starting reputation
  private capabilities: MechanicCapabilities[];
  private activeJobs: Map<number, ServiceJob> = new Map();
  private completedJobs: ServiceJob[] = [];
  private totalEarnings: number = 0;

  constructor(
    agentId: string,
    walletAddress: string,
    name: string,
    capabilities: MechanicCapabilities[]
  ) {
    this.agentId = agentId;
    this.walletAddress = walletAddress;
    this.name = name;
    this.capabilities = capabilities;
  }

  // ===== SERVICE ADVERTISEMENT =====

  /**
   * Get list of services this mechanic offers
   */
  getAvailableServices(): MechanicCapabilities[] {
    return this.capabilities.filter((cap) => cap.availability);
  }

  /**
   * Check if mechanic can provide specific service
   */
  canProvideService(serviceType: string): boolean {
    return this.capabilities.some(
      (cap) =>
        cap.serviceType.toLowerCase().includes(serviceType.toLowerCase()) &&
        cap.availability
    );
  }

  // ===== QUOTE GENERATION =====

  /**
   * Generate quote for service request
   * Quote is based on mechanic's capabilities and current load
   */
  generateQuote(
    serviceType: string,
    requestId: string
  ): {
    quoteId: string;
    priceUSDC: number;
    estimatedTimeMinutes: number;
    availability: boolean;
  } | null {
    const capability = this.capabilities.find(
      (cap) =>
        cap.serviceType.toLowerCase().includes(serviceType.toLowerCase()) &&
        cap.availability
    );

    if (!capability) {
      console.log(`⛔ ${this.name}: Cannot provide ${serviceType}`);
      return null;
    }

    // Adjust price based on reputation (higher reputation = more premium)
    const priceMultiplier = 1 + (this.reputation - 50) / 200; // +0.175 for 85 reputation
    const adjustedPrice = Math.round(capability.basePrice * priceMultiplier);

    const quote = {
      quoteId: `quote_${Date.now()}_${this.agentId.substr(0, 6)}`,
      priceUSDC: adjustedPrice,
      estimatedTimeMinutes: capability.estimatedTime,
      availability: true,
    };

    console.log(`💼 ${this.name} quotes:`);
    console.log(`   Service: ${capability.serviceType}`);
    console.log(`   Price: ${quote.priceUSDC} USDC (reputation multiplier: ${priceMultiplier.toFixed(2)}x)`);
    console.log(`   Est. Time: ${quote.estimatedTimeMinutes} min`);
    console.log(`   Quality: ${capability.quality}/100`);
    console.log();

    return quote;
  }

  // ===== ESCROW ACCEPTANCE =====

  /**
   * Accept escrow and begin service
   */
  acceptEscrow(
    escrowId: number,
    vehicleAgent: string,
    serviceType: string,
    price: number,
    estimatedTime: number
  ): ServiceJob {
    const job: ServiceJob = {
      escrowId,
      vehicleAgent,
      serviceType,
      price,
      startedAt: Date.now(),
      estimatedCompletion: Date.now() + estimatedTime * 60 * 1000,
      status: 'in_progress',
      milestonesCompleted: [],
    };

    this.activeJobs.set(escrowId, job);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔧 MECHANIC AGENT: ${this.name}`);
    console.log(`   Wallet: ${this.walletAddress.substr(0, 6)}...`);
    console.log(`   Reputation: ${this.reputation}/100`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`✅ ESCROW ACCEPTED`);
    console.log(`   Escrow ID: ${escrowId}`);
    console.log(`   Vehicle: ${vehicleAgent.substr(0, 12)}...`);
    console.log(`   Service: ${serviceType}`);
    console.log(`   Price: ${price} USDC`);
    console.log(`   Est. Completion: ${estimatedTime} min\n`);

    console.log(`${'='.repeat(70)}`);
    console.log(`🛠️ BEGINNING WORK`);
    console.log(`${'='.repeat(70)}\n`);

    return job;
  }

  // ===== WORK COMPLETION =====

  /**
   * Complete a milestone and emit proof
   */
  completeMilestone(
    escrowId: number,
    milestoneIndex: number,
    description: string
  ): MilestoneCompletion | null {
    const job = this.activeJobs.get(escrowId);
    if (!job) {
      console.error(`❌ Job not found: ${escrowId}`);
      return null;
    }

    // Simulate work completion with IPFS-like hash
    const resultHash = `QmWork${Math.random().toString(36).substr(2, 9)}`;

    const completion: MilestoneCompletion = {
      milestoneIndex,
      description,
      completedAt: Date.now(),
      resultHash,
    };

    job.milestonesCompleted.push(completion);

    console.log(`✅ MILESTONE COMPLETED`);
    console.log(`   Index: ${milestoneIndex}`);
    console.log(`   Description: ${description}`);
    console.log(`   Result Hash: ${resultHash}`);
    console.log(`   Time: ${new Date(completion.completedAt).toISOString()}\n`);

    // Check if all milestones completed
    if (job.milestonesCompleted.length === 1) {
      // Assume 1 milestone for tune-up
      this.completeJob(escrowId);
    }

    return completion;
  }

  /**
   * Mark job as completed and move to history
   */
  private completeJob(escrowId: number): void {
    const job = this.activeJobs.get(escrowId);
    if (!job) return;

    job.status = 'completed';
    this.activeJobs.delete(escrowId);
    this.completedJobs.push(job);

    // Update earnings
    this.totalEarnings += job.price;

    // Increase reputation on successful completion
    this.reputation = Math.min(100, this.reputation + 2);

    console.log(`${'='.repeat(70)}`);
    console.log(`🎉 JOB COMPLETED`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`Service Summary:`);
    console.log(`  Vehicle: ${job.vehicleAgent.substr(0, 12)}...`);
    console.log(`  Service: ${job.serviceType}`);
    console.log(`  Payment: ${job.price} USDC (auto-released from escrow)`);
    console.log(`  Duration: ${Math.round((Date.now() - job.startedAt) / 60000)} min`);
    console.log();

    console.log(`Agent Stats:`);
    console.log(`  Reputation: ${this.reputation}/100 (↑ +2)`);
    console.log(`  Completed Jobs: ${this.completedJobs.length}`);
    console.log(`  Total Earnings: ${this.totalEarnings} USDC\n`);
  }

  // ===== AUTOMATIC PAYMENT RECEIPT =====

  /**
   * Receive payment automatically when milestone completed
   * This is called by SmartEscrow.completeMilestone()
   */
  receivePayment(escrowId: number, amount: number, milestone: string): void {
    console.log(`💰 PAYMENT RECEIVED`);
    console.log(`   Escrow ID: ${escrowId}`);
    console.log(`   Amount: ${amount} USDC`);
    console.log(`   For: ${milestone}`);
    console.log(`   To: ${this.walletAddress.substr(0, 6)}...\n`);
  }

  // ===== GETTERS =====

  getAgentId(): string {
    return this.agentId;
  }

  getWalletAddress(): string {
    return this.walletAddress;
  }

  getName(): string {
    return this.name;
  }

  getReputation(): number {
    return this.reputation;
  }

  getActiveJobs(): ServiceJob[] {
    return Array.from(this.activeJobs.values());
  }

  getCompletedJobs(): ServiceJob[] {
    return this.completedJobs;
  }

  getTotalEarnings(): number {
    return this.totalEarnings;
  }

  getStats(): {
    reputation: number;
    activeJobs: number;
    completedJobs: number;
    totalEarnings: number;
    avgQuality: number;
  } {
    const avgQuality =
      this.capabilities.length > 0
        ? Math.round(
            this.capabilities.reduce((sum, cap) => sum + cap.quality, 0) /
              this.capabilities.length
          )
        : 0;

    return {
      reputation: this.reputation,
      activeJobs: this.activeJobs.size,
      completedJobs: this.completedJobs.length,
      totalEarnings: this.totalEarnings,
      avgQuality,
    };
  }
}

export default MechanicAgent;
