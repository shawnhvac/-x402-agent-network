/**
 * Vehicle Agent - Autonomous Transportation AI
 * 
 * Behavior:
 * - Monitors own condition (simulated)
 * - Detects need for maintenance
 * - Autonomously discovers mechanics
 * - Requests quotes
 * - Evaluates offers
 * - Selects best deal
 * - Creates escrow automatically
 * - Coordinates service execution
 * - Verifies completion
 * 
 * NO HUMAN INTERVENTION REQUIRED
 */

import { PublicKey } from '@solana/web3.js';
import { AutonomousNegotiationEngine, autonomousNegotiate, Quote, NegotiationResult } from '../engines/negotiation-engine';

export interface VehicleState {
  vin: string;
  location: string;
  mileage: number;
  engineHealth: number; // 0-100
  lastServiceDate: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ServiceRequest {
  serviceType: string;
  urgency: 'low' | 'medium' | 'high';
  maxBudget: number;
  maxTime: number;
  location: string;
}

/**
 * Vehicle Agent Class
 * 
 * Represents an autonomous vehicle that can:
 * 1. Monitor its own health
 * 2. Detect service needs
 * 3. Autonomously hire mechanics
 * 4. Pay for services via escrow
 */
export class VehicleAgent {
  private agentId: string;
  private walletAddress: string;
  private state: VehicleState;
  private negotiationEngine: AutonomousNegotiationEngine;
  private lastNegotiationResult: NegotiationResult | null = null;
  private serviceHistory: NegotiationResult[] = [];

  constructor(
    agentId: string,
    walletAddress: string,
    vin: string,
    negotiationEngine: AutonomousNegotiationEngine
  ) {
    this.agentId = agentId;
    this.walletAddress = walletAddress;
    this.negotiationEngine = negotiationEngine;

    // Initialize vehicle state
    this.state = {
      vin,
      location: 'Home Garage',
      mileage: 50000,
      engineHealth: 85,
      lastServiceDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      condition: 'good',
    };
  }

  // ===== HEALTH MONITORING =====

  /**
   * Simulate vehicle condition check
   * Returns health status and any detected issues
   */
  private checkVehicleHealth(): {
    healthScore: number;
    issues: string[];
    needsService: boolean;
  } {
    // Simulate health degradation over time
    const daysSinceService = (Date.now() - this.state.lastServiceDate) / (24 * 60 * 60 * 1000);
    const degradationPerDay = 0.5; // 0.5% per day
    const currentHealth = Math.max(0, this.state.engineHealth - daysSinceService * degradationPerDay);

    const issues: string[] = [];
    let needsService = false;

    if (currentHealth < 70) {
      issues.push('Engine performance degraded');
      needsService = true;
    }
    if (this.state.mileage > 48000) {
      issues.push('Maintenance interval approaching');
      needsService = true;
    }
    if (daysSinceService > 45) {
      issues.push('Regular maintenance due');
      needsService = true;
    }

    // Update state
    this.state.engineHealth = currentHealth;
    this.state.condition =
      currentHealth > 80 ? 'excellent' : currentHealth > 70 ? 'good' : currentHealth > 50 ? 'fair' : 'poor';

    return {
      healthScore: Math.round(currentHealth),
      issues,
      needsService,
    };
  }

  // ===== SERVICE REQUEST =====

  /**
   * Detect maintenance need and autonomously request service
   * This is the entry point for autonomous negotiation
   */
  async requestService(): Promise<void> {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚗 VEHICLE AGENT: ${this.agentId}`);
    console.log(`   Wallet: ${this.walletAddress.substr(0, 6)}...`);
    console.log(`   Mileage: ${this.state.mileage} km`);
    console.log(`${'='.repeat(70)}\n`);

    // Check health
    const health = this.checkVehicleHealth();
    console.log(`📊 Health Check: ${health.healthScore}/100`);
    console.log(`   Condition: ${this.state.condition}`);
    if (health.issues.length > 0) {
      console.log(`   Issues detected:`);
      health.issues.forEach((issue) => console.log(`     • ${issue}`));
    }
    console.log();

    if (!health.needsService) {
      console.log('✅ Vehicle healthy - no service needed\n');
      return;
    }

    // Service needed - proceed autonomously
    console.log('⚠️ Service needed - initiating autonomous negotiation...\n');

    // Determine service request parameters based on condition
    const serviceRequest: ServiceRequest = {
      serviceType: 'tune-up',
      urgency: health.healthScore < 50 ? 'high' : 'medium',
      maxBudget: 150, // USDC
      maxTime: 180, // minutes
      location: this.state.location,
    };

    // AUTONOMOUS NEGOTIATION - NO HUMAN INVOLVED
    await this.autonomouslyNegotiateService(serviceRequest);
  }

  /**
   * Completely autonomous negotiation flow
   * Vehicle makes all decisions automatically
   */
  private async autonomouslyNegotiateService(request: ServiceRequest): Promise<void> {
    try {
      console.log(`🔍 SERVICE REQUEST INITIATED`);
      console.log(`   Type: ${request.serviceType}`);
      console.log(`   Budget: ${request.maxBudget} USDC`);
      console.log(`   Time: ${request.maxTime} min`);
      console.log(`   Urgency: ${request.urgency}\n`);

      // Request quotes
      const quotes = await this.negotiationEngine.requestQuotes(
        request.serviceType,
        request.maxBudget,
        request.maxTime,
        request.urgency as 'low' | 'medium' | 'high'
      );

      if (quotes.length === 0) {
        console.error('❌ No quotes available - service cannot be scheduled');
        return;
      }

      console.log();

      // AUTONOMOUS NEGOTIATION: Evaluate, select, create escrow
      const result = await autonomousNegotiate(
        this.negotiationEngine,
        request.serviceType,
        request.maxBudget,
        request.maxTime,
        70 // Min acceptable score
      );

      if (!result) {
        console.error('❌ Negotiation failed - no acceptable offers');
        return;
      }

      // Record negotiation result
      this.lastNegotiationResult = result;
      this.serviceHistory.push(result);

      // Proceed to service execution
      console.log(`\n✅ AUTONOMOUS AGREEMENT: Escrow ${result.escrowId} created`);
      console.log(`   Ready for service execution\n`);

      // In production: Coordinate with service agent
      // For now: Log completion
      this.simulateServiceExecution(result);
    } catch (error) {
      console.error('❌ Service negotiation error:', error);
    }
  }

  /**
   * Simulate service execution
   * In production: Monitor escrow, verify milestones, release payments
   */
  private simulateServiceExecution(negotiation: NegotiationResult): void {
    console.log(`${'='.repeat(70)}`);
    console.log(`📍 SERVICE EXECUTION`);
    console.log(`${'='.repeat(70)}\n`);

    console.log(`Vehicle Status:`);
    console.log(`  Location: Mechanic - ${negotiation.selectedSeller.substr(0, 12)}...`);
    console.log(`  Status: Awaiting service`);
    console.log(`  Escrow: ${negotiation.escrowId}`);
    console.log(`  Milestones: ${negotiation.selectedMilestones?.length || 1}`);
    console.log();

    console.log(`Milestone Progress:`);
    negotiation.selectedMilestones?.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.description} (${m.percentOfTotal}%)`);
      console.log(`     → Payment: ${Math.round((negotiation.selectedPrice * m.percentOfTotal) / 100)} USDC`);
    });
    console.log();

    console.log(`⏳ Waiting for mechanic to complete milestones...`);
    console.log(`   Payments will be released automatically on completion\n`);
  }

  // ===== GETTERS =====

  getAgentId(): string {
    return this.agentId;
  }

  getWalletAddress(): string {
    return this.walletAddress;
  }

  getState(): VehicleState {
    return this.state;
  }

  getLastNegotiationResult(): NegotiationResult | null {
    return this.lastNegotiationResult;
  }

  getServiceHistory(): NegotiationResult[] {
    return this.serviceHistory;
  }

  // ===== SIMULATION HELPERS =====

  /**
   * Simulate mileage increase
   */
  addMileage(km: number): void {
    this.state.mileage += km;
    console.log(`🚗 Mileage updated: ${this.state.mileage} km`);
  }

  /**
   * Simulate service completion
   */
  completeService(escrowId: number): void {
    this.state.lastServiceDate = Date.now();
    this.state.engineHealth = 95;
    this.state.condition = 'excellent';
    console.log(`✅ Service completed for escrow ${escrowId}`);
    console.log(`   Engine health restored: 95/100`);
  }
}

export default VehicleAgent;
