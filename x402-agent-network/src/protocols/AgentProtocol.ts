/**
 * Agent-to-Agent Communication Protocol
 * 
 * Standardized message format for autonomous agents to discover services,
 * negotiate terms, and execute transactions
 */

export interface AgentMessage {
  messageId: string; // UUID
  fromAgent: string; // Wallet address
  toAgent: string; // Wallet address
  messageType: 'DISCOVER' | 'NEGOTIATE' | 'EXECUTE' | 'COMPLETE' | 'DISPUTE';
  payload: any;
  signature: string; // Ed25519 signature from sender
  timestamp: number;
  nonce: string; // Prevent replay attacks
}

export interface ServiceDiscoveryMessage {
  messageType: 'DISCOVER';
  payload: {
    serviceType: string; // 'tune-up', 'data-feed', 'compute', etc.
    requiredQuality?: number; // Min reputation score (0-100)
    maxPriceUSDC?: number;
  };
}

export interface NegotiationMessage {
  messageType: 'NEGOTIATE';
  payload: {
    serviceId: string;
    proposedPriceUSDC: number;
    termsHash: string; // Hash of terms JSON
    escrowConditions?: {
      partialPayment?: number; // % paid upfront
      completionCondition: string; // What triggers final payment
      disputeTimeoutMinutes: number;
    };
  };
}

export interface ExecutionMessage {
  messageType: 'EXECUTE';
  payload: {
    transactionId: number; // From AgentRegistry
    serviceId: string;
    parameters: any; // Service-specific parameters
    paymentTxHash: string; // USDC payment TX on-chain
    deadline: number; // Unix timestamp for completion
  };
}

export interface CompletionMessage {
  messageType: 'COMPLETE';
  payload: {
    transactionId: number;
    successful: boolean;
    result?: any; // Service result data
    ipfsResultHash?: string; // For large results
    gasUsedEstimate?: number;
  };
}

export interface DisputeMessage {
  messageType: 'DISPUTE';
  payload: {
    transactionId: number;
    reason: string;
    evidence?: string[]; // IPFS hashes or URLs
    requestedResolution: 'refund' | 'partial_refund' | 'retry';
  };
}

/**
 * Agent Protocol Handler - Processes incoming messages
 */
export class AgentProtocolHandler {
  private agentAddress: string;
  private privateKey: string;

  constructor(agentAddress: string, privateKey: string) {
    this.agentAddress = agentAddress;
    this.privateKey = privateKey;
  }

  /**
   * Sign a message with agent's private key
   */
  signMessage(message: Partial<AgentMessage>): AgentMessage {
    const msg: AgentMessage = {
      messageId: this.generateMessageId(),
      fromAgent: this.agentAddress,
      timestamp: Date.now(),
      nonce: this.generateNonce(),
      signature: '', // Placeholder
      ...message,
    } as AgentMessage;

    // In production: use Ed25519 signing
    msg.signature = this.sign(JSON.stringify({
      messageId: msg.messageId,
      fromAgent: msg.fromAgent,
      toAgent: msg.toAgent,
      messageType: msg.messageType,
      payload: msg.payload,
      timestamp: msg.timestamp,
      nonce: msg.nonce,
    }));

    return msg;
  }

  /**
   * Verify message signature
   */
  verifyMessage(message: AgentMessage): boolean {
    const messageData = {
      messageId: message.messageId,
      fromAgent: message.fromAgent,
      toAgent: message.toAgent,
      messageType: message.messageType,
      payload: message.payload,
      timestamp: message.timestamp,
      nonce: message.nonce,
    };

    // In production: use Ed25519 verification
    return this.verify(
      JSON.stringify(messageData),
      message.signature,
      message.fromAgent
    );
  }

  /**
   * Create service discovery message
   */
  createDiscoveryMessage(
    toAgent: string,
    serviceType: string,
    maxPriceUSDC?: number
  ): AgentMessage {
    return this.signMessage({
      toAgent,
      messageType: 'DISCOVER',
      payload: {
        serviceType,
        maxPriceUSDC,
      },
    });
  }

  /**
   * Create negotiation message
   */
  createNegotiationMessage(
    toAgent: string,
    serviceId: string,
    proposedPriceUSDC: number,
    escrowConditions?: any
  ): AgentMessage {
    return this.signMessage({
      toAgent,
      messageType: 'NEGOTIATE',
      payload: {
        serviceId,
        proposedPriceUSDC,
        termsHash: this.hashTerms({ serviceId, proposedPriceUSDC }),
        escrowConditions,
      },
    });
  }

  /**
   * Create execution message
   */
  createExecutionMessage(
    toAgent: string,
    transactionId: number,
    serviceId: string,
    parameters: any,
    paymentTxHash: string,
    deadlineMinutes: number = 60
  ): AgentMessage {
    return this.signMessage({
      toAgent,
      messageType: 'EXECUTE',
      payload: {
        transactionId,
        serviceId,
        parameters,
        paymentTxHash,
        deadline: Date.now() + deadlineMinutes * 60 * 1000,
      },
    });
  }

  /**
   * Create completion message
   */
  createCompletionMessage(
    toAgent: string,
    transactionId: number,
    successful: boolean,
    result?: any
  ): AgentMessage {
    return this.signMessage({
      toAgent,
      messageType: 'COMPLETE',
      payload: {
        transactionId,
        successful,
        result,
      },
    });
  }

  /**
   * Route incoming message to handler
   */
  async handleMessage(message: AgentMessage): Promise<any> {
    if (!this.verifyMessage(message)) {
      throw new Error('Invalid message signature');
    }

    switch (message.messageType) {
      case 'DISCOVER':
        return this.handleDiscovery(message);
      case 'NEGOTIATE':
        return this.handleNegotiation(message);
      case 'EXECUTE':
        return this.handleExecution(message);
      case 'COMPLETE':
        return this.handleCompletion(message);
      case 'DISPUTE':
        return this.handleDispute(message);
      default:
        throw new Error('Unknown message type');
    }
  }

  // Handler stubs - implement in agent subclass
  protected async handleDiscovery(msg: AgentMessage): Promise<any> {
    throw new Error('Not implemented');
  }

  protected async handleNegotiation(msg: AgentMessage): Promise<any> {
    throw new Error('Not implemented');
  }

  protected async handleExecution(msg: AgentMessage): Promise<any> {
    throw new Error('Not implemented');
  }

  protected async handleCompletion(msg: AgentMessage): Promise<any> {
    throw new Error('Not implemented');
  }

  protected async handleDispute(msg: AgentMessage): Promise<any> {
    throw new Error('Not implemented');
  }

  // Utility functions
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNonce(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  private hashTerms(terms: any): string {
    // Placeholder - use proper hashing in production
    return Buffer.from(JSON.stringify(terms)).toString('base64');
  }

  private sign(data: string): string {
    // Placeholder - implement Ed25519 signing
    return Buffer.from(`${data}:${this.privateKey}`).toString('base64');
  }

  private verify(data: string, signature: string, agentAddress: string): boolean {
    // Placeholder - implement Ed25519 verification
    return true; // Trust for now
  }
}

export default AgentProtocolHandler;
