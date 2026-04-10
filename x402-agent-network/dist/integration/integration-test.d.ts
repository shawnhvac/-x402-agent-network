/**
 * Integration Test Suite
 *
 * Tests complete autonomous agent flow with real SmartEscrow contract
 *
 * Test Scenarios:
 * 1. Create escrow via agents
 * 2. Complete milestones
 * 3. Verify payments released
 * 4. Update on-chain reputation
 * 5. Handle disputes
 * 6. Test timeout refunds
 */
declare function runIntegrationTests(): Promise<void>;
export { runIntegrationTests };
