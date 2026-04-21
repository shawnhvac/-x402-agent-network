/**
 * Autonomous Agent Interaction Example
 * 
 * Demonstrates complete AI-to-AI autonomous negotiation and service execution:
 * 
 * 1. Vehicle detects maintenance need
 * 2. Autonomously requests quotes from mechanics
 * 3. Evaluates offers (reputation + price + time)
 * 4. Selects best mechanic
 * 5. Creates escrow automatically
 * 6. Mechanic begins work
 * 7. Completes milestones
 * 8. Payments released automatically
 * 
 * ZERO HUMAN INTERVENTION
 */

import { VehicleAgent } from '../agents/vehicle-agent';
import { MechanicAgent, MechanicCapabilities } from '../agents/mechanic-agent';
import { AutonomousNegotiationEngine } from '../engines/negotiation-engine';
import { AgentRegistry, Agent, Service } from '../engines/negotiation-engine';

// ===== MOCK AGENT REGISTRY =====

/**
 * Mock AgentRegistry for testing
 * In production: This queries the Solana AgentRegistry.sol smart contract
 */
class MockAgentRegistry implements AgentRegistry {
  private mechanics: MechanicAgent[] = [];

  addMechanic(mechanic: MechanicAgent): void {
    this.mechanics.push(mechanic);
  }

  async getAllAgents(): Promise<Agent[]> {
    return this.mechanics.map((m) => ({
      walletAddress: m.getWalletAddress(),
      name: m.getName(),
      reputation: m.getReputation(),
      totalTransactions: m.getCompletedJobs().length,
      successRate: 100, // All jobs completed
      active: true,
    }));
  }

  async getAgent(address: string): Promise<Agent | null> {
    const mechanic = this.mechanics.find((m) => m.getWalletAddress() === address);
    if (!mechanic) return null;

    return {
      walletAddress: mechanic.getWalletAddress(),
      name: mechanic.getName(),
      reputation: mechanic.getReputation(),
      totalTransactions: mechanic.getCompletedJobs().length,
      successRate: 100,
      active: true,
    };
  }

  async getAgentServices(agentAddress: string): Promise<Service[]> {
    const mechanic = this.mechanics.find((m) => m.getWalletAddress() === agentAddress);
    if (!mechanic) return [];

    return mechanic.getAvailableServices().map((cap) => ({
      serviceId: `service_${cap.serviceType}`,
      agentAddress,
      name: cap.serviceType,
      description: `Professional ${cap.serviceType} service`,
      basePriceUSDC: cap.basePrice,
      estimatedTimeMinutes: cap.estimatedTime,
      active: cap.availability,
    }));
  }
}

// ===== EXAMPLE SCENARIO =====

async function runAutonomousInteractionExample(): Promise<void> {
  console.log('\n');
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(10) + 'AUTONOMOUS AGENT INTERACTION DEMO' + ' '.repeat(25) + '║');
  console.log('║' + ' '.repeat(15) + 'Vehicle Agent ↔ Mechanic Agent' + ' '.repeat(23) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');
  console.log('\n');

  // ===== SETUP =====

  console.log('📋 SETUP PHASE');
  console.log('─'.repeat(70) + '\n');

  // Create mock registry
  const registry = new MockAgentRegistry();

  // Create mechanic agents
  const mechanic1 = new MechanicAgent(
    'mechanic-bob-001',
    '0xBob1111111111111111111111111111111111111',
    'Bob\'s Quick Service',
    [
      {
        serviceType: 'tune-up',
        basePrice: 100,
        estimatedTime: 120,
        quality: 85,
        availability: true,
      },
      {
        serviceType: 'oil-change',
        basePrice: 50,
        estimatedTime: 30,
        quality: 90,
        availability: true,
      },
    ]
  );

  const mechanic2 = new MechanicAgent(
    'mechanic-alice-001',
    '0xAlice1111111111111111111111111111111111',
    'Alice\'s Pro Garage',
    [
      {
        serviceType: 'tune-up',
        basePrice: 120,
        estimatedTime: 90,
        quality: 95,
        availability: true,
      },
      {
        serviceType: 'diagnostics',
        basePrice: 80,
        estimatedTime: 45,
        quality: 98,
        availability: true,
      },
    ]
  );

  const mechanic3 = new MechanicAgent(
    'mechanic-charlie-001',
    '0xCharlie111111111111111111111111111111111',
    'Charlie\'s Budget Service',
    [
      {
        serviceType: 'tune-up',
        basePrice: 80,
        estimatedTime: 150,
        quality: 70,
        availability: true,
      },
    ]
  );

  // Register mechanics
  registry.addMechanic(mechanic1);
  registry.addMechanic(mechanic2);
  registry.addMechanic(mechanic3);

  console.log('✅ Mechanics registered:');
  console.log(`   1. ${mechanic1.getName()} - Reputation: ${mechanic1.getReputation()}/100`);
  console.log(`   2. ${mechanic2.getName()} - Reputation: ${mechanic2.getReputation()}/100`);
  console.log(`   3. ${mechanic3.getName()} - Reputation: ${mechanic3.getReputation()}/100\n`);

  // Create vehicle agent
  const vehicle = new VehicleAgent(
    'tesla-model-3-001',
    '0xVehicle1111111111111111111111111111111',
    'Model 3 VIN: ABC123',
    new AutonomousNegotiationEngine(
      '0xVehicle1111111111111111111111111111111',
      registry
    )
  );

  console.log(`✅ Vehicle created:`);
  console.log(`   ID: ${vehicle.getAgentId()}`);
  console.log(`   Wallet: ${vehicle.getWalletAddress().substr(0, 20)}...`);
  console.log(`   Condition: ${vehicle.getState().condition}\n`);

  console.log('─'.repeat(70) + '\n');

  // ===== AUTONOMOUS NEGOTIATION =====

  console.log('🚗 VEHICLE AUTONOMOUSLY REQUESTS SERVICE');
  console.log('─'.repeat(70) + '\n');

  // Vehicle detects need and autonomously negotiates
  await vehicle.requestService();

  // ===== SERVICE EXECUTION =====

  const lastResult = vehicle.getLastNegotiationResult();
  if (lastResult) {
    console.log('🔧 SERVICE EXECUTION PHASE');
    console.log('─'.repeat(70) + '\n');

    // Find which mechanic won the negotiation
    let selectedMechanic: MechanicAgent | null = null;
    for (const mechanic of [mechanic1, mechanic2, mechanic3]) {
      if (mechanic.getWalletAddress() === lastResult.selectedSeller) {
        selectedMechanic = mechanic;
        break;
      }
    }

    if (selectedMechanic) {
      // Mechanic accepts escrow
      const job = selectedMechanic.acceptEscrow(
        lastResult.escrowId!,
        vehicle.getWalletAddress(),
        'tune-up',
        lastResult.selectedPrice,
        lastResult.selectedTime
      );

      // Simulate work completion
      console.log('⏳ Mechanic performing work...\n');
      await delay(1000);

      // Complete milestone
      const milestone = selectedMechanic.completeMilestone(
        lastResult.escrowId!,
        0,
        'Service completion'
      );

      if (milestone) {
        // Simulate payment
        console.log('─'.repeat(70) + '\n');
        selectedMechanic.receivePayment(
          lastResult.escrowId!,
          lastResult.selectedPrice,
          'tune-up service'
        );

        // Simulate vehicle receiving service
        console.log('─'.repeat(70) + '\n');
        console.log('✅ SERVICE DELIVERY CONFIRMED');
        console.log(`   Vehicle status: Service completed`);
        console.log(`   New condition: Excellent\n`);

        vehicle.completeService(lastResult.escrowId!);
      }
    }

    // ===== FINAL SUMMARY =====

    console.log('═'.repeat(70) + '\n');
    console.log('📊 AUTONOMOUS TRANSACTION SUMMARY');
    console.log('═'.repeat(70) + '\n');

    console.log(`Vehicle Agent:`);
    console.log(`  Status: Service completed`);
    console.log(`  Spent: ${lastResult.selectedPrice} USDC`);
    console.log(`  Condition: Excellent`);
    console.log();

    console.log(`Mechanic Agent (${selectedMechanic?.getName()}):`);
    console.log(`  Earned: ${lastResult.selectedPrice} USDC`);
    const stats = selectedMechanic?.getStats();
    console.log(`  Reputation: ${stats?.reputation}/100`);
    console.log(`  Completed jobs: ${stats?.completedJobs}`);
    console.log(`  Total earnings: ${stats?.totalEarnings} USDC`);
    console.log();

    console.log(`Transaction Details:`);
    console.log(`  Escrow ID: ${lastResult.escrowId}`);
    console.log(`  Total time: ${lastResult.negotiationTime}ms (negotiation)`);
    console.log(`  Service time: ${lastResult.selectedTime} minutes`);
    console.log(`  Status: ✅ COMPLETE`);
    console.log();

    console.log('═'.repeat(70));
    console.log('🎉 AUTONOMOUS AI-TO-AI TRANSACTION SUCCESSFUL');
    console.log('═'.repeat(70) + '\n');

    console.log('Key Achievement:');
    console.log('  • Vehicle detected maintenance need autonomously');
    console.log('  • Requested quotes from multiple service providers');
    console.log('  • Evaluated offers (reputation + price + time)');
    console.log('  • Selected best deal (score-based decision)');
    console.log('  • Created escrow automatically');
    console.log('  • Mechanic completed work and received payment');
    console.log('  • Entire process: ZERO HUMAN INTERVENTION\n');

    console.log('This is the real agent economy.');
    console.log('Autonomous, trustless, and scalable.\n');
  }
}

// ===== HELPER =====

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===== EXECUTION =====

if (require.main === module) {
  runAutonomousInteractionExample().catch(console.error);
}

export { runAutonomousInteractionExample };
