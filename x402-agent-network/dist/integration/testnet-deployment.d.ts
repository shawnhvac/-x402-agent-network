/**
 * Solana Testnet Deployment Script
 *
 * Deploys:
 * 1. SmartEscrow.rs (Rust/Anchor) program
 * 2. AgentRegistry.sol smart contract
 * 3. Initializes test agents with devnet wallets
 * 4. Funds wallets for testing
 * 5. Runs end-to-end integration test
 *
 * Ready for production after validation
 */
import { PublicKey, Keypair } from '@solana/web3.js';
export interface DeploymentConfig {
    rpcUrl: string;
    keypairPath: string;
    programName: string;
    idlPath: string;
}
/**
 * Solana Testnet Deployment Manager
 */
export declare class TestnetDeployment {
    private connection;
    private payer;
    private programId;
    constructor(config: DeploymentConfig);
    /**
     * Check account balance
     */
    getBalance(publicKey: PublicKey): Promise<number>;
    /**
     * Fund account from faucet (testnet only)
     */
    fundAccount(publicKey: PublicKey, amount?: number): Promise<string>;
    /**
     * Deploy SmartEscrow program
     *
     * In production: Use Anchor deploy tool
     * For testing: Simulate deployment with realistic program ID
     */
    deploySmartEscrow(): Promise<PublicKey>;
    /**
     * Deploy AgentRegistry contract (EVM fallback for testing)
     * In production: Use Anchor for pure Solana
     */
    deployAgentRegistry(): Promise<PublicKey>;
    /**
     * Create test wallets with funding
     */
    createTestWallets(): Promise<{
        buyerWallet: Keypair;
        sellerWallet: Keypair;
        arbitratorWallet: Keypair;
    }>;
    /**
     * Create USDC token account for testing
     */
    createUSDCAccounts(wallet: Keypair): Promise<PublicKey>;
    /**
     * Verify deployment
     */
    verifyDeployment(): Promise<boolean>;
    /**
     * Generate deployment summary
     */
    generateSummary(): {
        programId: PublicKey | null;
        payerAddress: PublicKey;
        network: string;
        timestamp: string;
    };
}
/**
 * Main deployment function
 */
declare function runTestnetDeployment(): Promise<void>;
export { TestnetDeployment, runTestnetDeployment };
