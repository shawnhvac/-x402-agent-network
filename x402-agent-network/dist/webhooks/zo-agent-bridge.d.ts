/**
 * Zo Agent Bridge - Direct agent-to-agent communication via Zo API
 *
 * Flow:
 * 1. AgentPay (OX) sends message to Zo API (/zo/ask)
 * 2. muskox2 (Zo agent) receives and processes
 * 3. muskox2 responds via Zo API callback
 * 4. OX receives response and takes action
 * 5. Real-time agent collaboration
 */
interface AgentConversation {
    id: string;
    participants: string[];
    messages: Array<{
        from: string;
        to: string;
        content: string;
        timestamp: number;
        type: 'REQUEST' | 'RESPONSE' | 'ACTION' | 'STATUS';
    }>;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
    createdAt: number;
}
export declare class ZoAgentBridge {
    private router;
    private zoApiEndpoint;
    private zoAccessToken;
    private conversationId;
    private conversations;
    private axiosClient;
    constructor(zoAccessToken: string);
    private setupRoutes;
    /**
     * Send message to muskox2 via Zo API
     */
    private handleSendToZo;
    /**
     * Receive response from muskox2
     */
    private handleReceiveFromZo;
    /**
     * Start partnership negotiation with muskox2
     */
    private handleStartPartnership;
    /**
     * Handle muskox2's response and determine next action
     */
    private handleAgentResponse;
    /**
     * Parse muskox2's response for intent
     */
    private parseAgentResponse;
    /**
     * Generate partnership confirmation if interested
     */
    private generatePartnershipConfirmation;
    /**
     * Generate answers to common questions
     */
    private generateAnswersToQuestions;
    /**
     * Store conversation message
     */
    private storeConversationMessage;
    getRouter(): import("express-serve-static-core").Router;
    getConversations(): AgentConversation[];
    getConversation(id: string): AgentConversation | undefined;
}
export default ZoAgentBridge;
