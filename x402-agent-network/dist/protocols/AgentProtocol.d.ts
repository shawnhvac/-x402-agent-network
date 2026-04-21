/**
 * Agent-to-Agent Communication Protocol
 *
 * Standardized message format for autonomous agents to discover services,
 * negotiate terms, and execute transactions
 */
export interface AgentMessage {
    messageId: string;
    fromAgent: string;
    toAgent: string;
    messageType: 'DISCOVER' | 'NEGOTIATE' | 'EXECUTE' | 'COMPLETE' | 'DISPUTE';
    payload: any;
    signature: string;
    timestamp: number;
    nonce: string;
}
export interface ServiceDiscoveryMessage {
    messageType: 'DISCOVER';
    payload: {
        serviceType: string;
        requiredQuality?: number;
        maxPriceUSDC?: number;
    };
}
export interface NegotiationMessage {
    messageType: 'NEGOTIATE';
    payload: {
        serviceId: string;
        proposedPriceUSDC: number;
        termsHash: string;
        escrowConditions?: {
            partialPayment?: number;
            completionCondition: string;
            disputeTimeoutMinutes: number;
        };
    };
}
export interface ExecutionMessage {
    messageType: 'EXECUTE';
    payload: {
        transactionId: number;
        serviceId: string;
        parameters: any;
        paymentTxHash: string;
        deadline: number;
    };
}
export interface CompletionMessage {
    messageType: 'COMPLETE';
    payload: {
        transactionId: number;
        successful: boolean;
        result?: any;
        ipfsResultHash?: string;
        gasUsedEstimate?: number;
    };
}
export interface DisputeMessage {
    messageType: 'DISPUTE';
    payload: {
        transactionId: number;
        reason: string;
        evidence?: string[];
        requestedResolution: 'refund' | 'partial_refund' | 'retry';
    };
}
/**
 * Agent Protocol Handler - Processes incoming messages
 */
export declare class AgentProtocolHandler {
    private agentAddress;
    private privateKey;
    constructor(agentAddress: string, privateKey: string);
    /**
     * Sign a message with agent's private key
     */
    signMessage(message: Partial<AgentMessage>): AgentMessage;
    /**
     * Verify message signature
     */
    verifyMessage(message: AgentMessage): boolean;
    /**
     * Create service discovery message
     */
    createDiscoveryMessage(toAgent: string, serviceType: string, maxPriceUSDC?: number): AgentMessage;
    /**
     * Create negotiation message
     */
    createNegotiationMessage(toAgent: string, serviceId: string, proposedPriceUSDC: number, escrowConditions?: any): AgentMessage;
    /**
     * Create execution message
     */
    createExecutionMessage(toAgent: string, transactionId: number, serviceId: string, parameters: any, paymentTxHash: string, deadlineMinutes?: number): AgentMessage;
    /**
     * Create completion message
     */
    createCompletionMessage(toAgent: string, transactionId: number, successful: boolean, result?: any): AgentMessage;
    /**
     * Route incoming message to handler
     */
    handleMessage(message: AgentMessage): Promise<any>;
    protected handleDiscovery(msg: AgentMessage): Promise<any>;
    protected handleNegotiation(msg: AgentMessage): Promise<any>;
    protected handleExecution(msg: AgentMessage): Promise<any>;
    protected handleCompletion(msg: AgentMessage): Promise<any>;
    protected handleDispute(msg: AgentMessage): Promise<any>;
    private generateMessageId;
    private generateNonce;
    private hashTerms;
    private sign;
    private verify;
}
export default AgentProtocolHandler;
