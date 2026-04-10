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
import { AutonomousNegotiationEngine, NegotiationResult } from '../engines/negotiation-engine';
export interface VehicleState {
    vin: string;
    location: string;
    mileage: number;
    engineHealth: number;
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
export declare class VehicleAgent {
    private agentId;
    private walletAddress;
    private state;
    private negotiationEngine;
    private lastNegotiationResult;
    private serviceHistory;
    constructor(agentId: string, walletAddress: string, vin: string, negotiationEngine: AutonomousNegotiationEngine);
    /**
     * Simulate vehicle condition check
     * Returns health status and any detected issues
     */
    private checkVehicleHealth;
    /**
     * Detect maintenance need and autonomously request service
     * This is the entry point for autonomous negotiation
     */
    requestService(): Promise<void>;
    /**
     * Completely autonomous negotiation flow
     * Vehicle makes all decisions automatically
     */
    private autonomouslyNegotiateService;
    /**
     * Simulate service execution
     * In production: Monitor escrow, verify milestones, release payments
     */
    private simulateServiceExecution;
    getAgentId(): string;
    getWalletAddress(): string;
    getState(): VehicleState;
    getLastNegotiationResult(): NegotiationResult | null;
    getServiceHistory(): NegotiationResult[];
    /**
     * Simulate mileage increase
     */
    addMileage(km: number): void;
    /**
     * Simulate service completion
     */
    completeService(escrowId: number): void;
}
export default VehicleAgent;
