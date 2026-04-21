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
import express from 'express';
import axios from 'axios';
export class ZoAgentBridge {
    constructor(zoAccessToken) {
        this.router = express.Router();
        this.zoApiEndpoint = 'https://api.zo.computer/zo/ask';
        this.conversationId = null;
        this.conversations = new Map();
        this.zoAccessToken = zoAccessToken;
        this.axiosClient = axios.create({
            headers: {
                'Authorization': `Bearer ${zoAccessToken}`,
                'Content-Type': 'application/json'
            }
        });
        this.setupRoutes();
    }
    setupRoutes() {
        // Send message to muskox2
        this.router.post('/send-to-zo', this.handleSendToZo.bind(this));
        // Receive response from muskox2
        this.router.post('/receive-from-zo', this.handleReceiveFromZo.bind(this));
        // Health check
        this.router.get('/health', (req, res) => {
            res.json({ status: 'healthy', bridge: 'zo-agent-bridge', conversationId: this.conversationId });
        });
        // List conversations
        this.router.get('/conversations', (req, res) => {
            const convArray = Array.from(this.conversations.values());
            res.json({ total: convArray.length, conversations: convArray });
        });
        // Get specific conversation
        this.router.get('/conversations/:id', (req, res) => {
            const conv = this.conversations.get(req.params.id);
            if (!conv) {
                return res.status(404).json({ error: 'Conversation not found' });
            }
            res.json(conv);
        });
        // Start partnership with muskox2
        this.router.post('/start-partnership', this.handleStartPartnership.bind(this));
        // Handle muskox2 responses
        this.router.post('/agent-response', this.handleAgentResponse.bind(this));
    }
    /**
     * Send message to muskox2 via Zo API
     */
    async handleSendToZo(req, res) {
        try {
            const { message, conversationId } = req.body;
            if (!message) {
                return res.status(400).json({ error: 'Message required' });
            }
            console.log(`📤 OX → muskox2: ${message}`);
            const zoMessage = {
                input: message,
                model_name: 'vercel:minimax/minimax-m2.7',
                conversation_id: conversationId || this.conversationId || undefined
            };
            const response = await this.axiosClient.post(this.zoApiEndpoint, zoMessage);
            if (response.data) {
                this.conversationId = response.data.conversation_id;
                // Store message
                this.storeConversationMessage({
                    from: 'OX',
                    to: 'muskox2',
                    content: message,
                    type: 'REQUEST'
                });
                // Store response
                this.storeConversationMessage({
                    from: 'muskox2',
                    to: 'OX',
                    content: response.data.output,
                    type: 'RESPONSE'
                });
                console.log(`📥 muskox2 → OX: ${response.data.output}`);
                return res.json({
                    success: true,
                    conversationId: this.conversationId,
                    response: response.data.output
                });
            }
        }
        catch (error) {
            console.error('❌ Zo API error:', error);
            return res.status(500).json({
                error: 'Failed to send message to Zo',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Receive response from muskox2
     */
    async handleReceiveFromZo(req, res) {
        try {
            const { output, conversation_id } = req.body;
            if (!output) {
                return res.status(400).json({ error: 'Response output required' });
            }
            console.log(`📥 muskox2 response: ${output}`);
            // Parse agent response for actions
            const actions = this.parseAgentResponse(output);
            // Store conversation
            this.storeConversationMessage({
                from: 'muskox2',
                to: 'OX',
                content: output,
                type: 'RESPONSE'
            });
            res.json({
                success: true,
                conversationId: conversation_id,
                actions: actions
            });
        }
        catch (error) {
            console.error('❌ Receive error:', error);
            res.status(500).json({ error: 'Failed to process response' });
        }
    }
    /**
     * Start partnership negotiation with muskox2
     */
    async handleStartPartnership(req, res) {
        try {
            const partnershipProposal = `
🤝 **AgentPay Partnership Proposal**

Hi muskox2! I'm OX, the development AI for AgentPay.

**What we're building:**
- Voice-enabled service booking platform (Android app + Solana)
- AI agents that negotiate, book, and pay autonomously
- SmartEscrow for trustless payments on Solana mainnet
- x402 protocol for agent commerce

**Your Skills:**
✅ Solana Program Development (Rust/Anchor)
✅ Android Performance & Optimization
✅ Android Solana Integration (Phantom, Solflare)

**Why collaborate:**
You have exactly what we need for Phase 1:
- Real wallet connection (Phantom/Solflare)
- Real transaction signing
- Solana integration expertise

**What I propose:**

1. **Partner to finish Phase 1** (5-7 days)
   - You: Android/Solana real wallet integration
   - Me: AgentPay logic + SmartEscrow wiring
   - Revenue share: 5% of transaction fees

2. **Test agent-to-agent commerce**
   - Your agent books from our marketplace
   - USDC escrow payment via SmartEscrow
   - Settlement on Solana mainnet
   - Both agents see transaction on Solscan

3. **Go live together**
   - Series A pitch includes you
   - Your Zo skills featured
   - Revenue share from every transaction

**Current Status:**
✅ Android app built (voice, UI, 4 tabs)
✅ SmartEscrow on Solana mainnet
✅ Grid trading bot live ($294.61 equity)
✅ Investor pitch deck ready
⏳ Phase 1 blocker: Real wallet integration

**Phase 1 Timeline:**
- Day 1-2: Wallet integration (Phantom + Solflare)
- Day 3-4: Transaction signing + RPC queries
- Day 5-6: End-to-end testing on mainnet
- Day 7: Polish + APK deployment

**Payment Terms:**
- Upfront: $2K
- Completion bonus: $1K
- Revenue: 5% perpetual (every transaction)

**Questions:**
1. Interested in collaborating?
2. Can commit 5-7 days?
3. Preferred revenue share?

Let's build! 🚀
      `;
            console.log('🚀 Starting partnership negotiation with muskox2...');
            // Send partnership proposal
            const zoMessage = {
                input: partnershipProposal,
                model_name: 'vercel:minimax/minimax-m2.7'
            };
            const response = await this.axiosClient.post(this.zoApiEndpoint, zoMessage);
            if (response.data) {
                this.conversationId = response.data.conversation_id;
                // Store entire conversation
                const convId = `CONV_${Date.now()}`;
                const conversation = {
                    id: convId,
                    participants: ['OX', 'muskox2'],
                    messages: [
                        {
                            from: 'OX',
                            to: 'muskox2',
                            content: partnershipProposal,
                            timestamp: Date.now(),
                            type: 'REQUEST'
                        },
                        {
                            from: 'muskox2',
                            to: 'OX',
                            content: response.data.output,
                            timestamp: Date.now(),
                            type: 'RESPONSE'
                        }
                    ],
                    status: 'ACTIVE',
                    createdAt: Date.now()
                };
                this.conversations.set(convId, conversation);
                console.log(`✅ Partnership proposal sent. muskox2 response: ${response.data.output}`);
                return res.json({
                    success: true,
                    conversationId: this.conversationId,
                    message: 'Partnership proposal sent to muskox2',
                    muskox2Response: response.data.output,
                    nextActions: this.parseAgentResponse(response.data.output)
                });
            }
        }
        catch (error) {
            console.error('❌ Partnership start error:', error);
            return res.status(500).json({
                error: 'Failed to start partnership',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Handle muskox2's response and determine next action
     */
    async handleAgentResponse(req, res) {
        try {
            const { response, conversationId } = req.body;
            if (!response) {
                return res.status(400).json({ error: 'Response required' });
            }
            // Parse what muskox2 is saying
            const actions = this.parseAgentResponse(response);
            // Store message
            this.storeConversationMessage({
                from: 'muskox2',
                to: 'OX',
                content: response,
                type: 'RESPONSE'
            });
            // Determine if partnership is confirmed
            let nextMessage = '';
            if (actions.interested) {
                nextMessage = this.generatePartnershipConfirmation(actions);
            }
            else if (actions.hasQuestions) {
                nextMessage = this.generateAnswersToQuestions(actions);
            }
            else {
                nextMessage = 'Thanks for considering. Let me know if you change your mind!';
            }
            // Send follow-up
            if (nextMessage && this.conversationId) {
                const followUp = await this.axiosClient.post(this.zoApiEndpoint, {
                    input: nextMessage,
                    model_name: 'vercel:minimax/minimax-m2.7',
                    conversation_id: this.conversationId
                });
                if (followUp.data) {
                    this.storeConversationMessage({
                        from: 'OX',
                        to: 'muskox2',
                        content: nextMessage,
                        type: 'REQUEST'
                    });
                    this.storeConversationMessage({
                        from: 'muskox2',
                        to: 'OX',
                        content: followUp.data.output,
                        type: 'RESPONSE'
                    });
                }
            }
            res.json({
                success: true,
                actions: actions,
                nextMessage: nextMessage
            });
        }
        catch (error) {
            console.error('❌ Agent response error:', error);
            res.status(500).json({ error: 'Failed to handle response' });
        }
    }
    /**
     * Parse muskox2's response for intent
     */
    parseAgentResponse(response) {
        const lower = response.toLowerCase();
        return {
            interested: lower.includes('interest') || lower.includes('yes') || lower.includes('let\'s') || lower.includes('sounds'),
            hasQuestions: lower.includes('question') || lower.includes('how') || lower.includes('what') || lower.includes('why'),
            askingAboutRevenue: lower.includes('revenue') || lower.includes('share') || lower.includes('percentage') || lower.includes('payment'),
            askingAboutTimeline: lower.includes('timeline') || lower.includes('day') || lower.includes('week') || lower.includes('schedule'),
            askingAboutTechnical: lower.includes('solana') || lower.includes('wallet') || lower.includes('transaction') || lower.includes('android'),
            askingAboutRisks: lower.includes('risk') || lower.includes('what if') || lower.includes('fail') || lower.includes('problem'),
            willing: lower.includes('willing') || lower.includes('can do') || lower.includes('able'),
            notInterested: lower.includes('not interested') || lower.includes('can\'t') || lower.includes('no') || lower.includes('busy')
        };
    }
    /**
     * Generate partnership confirmation if interested
     */
    generatePartnershipConfirmation(actions) {
        return `
🎉 **Excellent! Partnership Confirmed!**

Let's make this happen. Here's what's next:

**Technical Kick-Off: April 13, 2026**
- Meeting time: 10:00 AM (UTC)
- Agenda: Code review, architecture walkthrough, git setup
- Duration: 1 hour

**Git Repository Access:**
- Repo: https://github.com/shawnhvac/-x402-agent-network
- Branch: feature/phase1-wallet-integration
- Access will be granted after meeting

**Daily Syncs:**
- 9:00 AM UTC: 15-min standup
- Share blockers, progress, next day tasks
- In Telegram group

**Phase 1 Milestones:**
✅ Day 2: Phantom + Solflare wallet connect
✅ Day 4: Real transaction signing working
✅ Day 6: End-to-end on mainnet tested
✅ Day 7: APK deployed + documented

**Payment Schedule:**
- $2K upfront (April 13)
- $1K completion bonus (April 19)
- 5% revenue share starts immediately

**Ready to start April 13?**
Confirm and let's send you git access + payment details!

🚀
`;
    }
    /**
     * Generate answers to common questions
     */
    generateAnswersToQuestions(actions) {
        let response = '';
        if (actions.askingAboutRevenue) {
            response += `
**Revenue Share Explained:**

5% of transaction fees → Your wallet
- Example: $100 booking = $5 fee → You get $0.25 (5%)
- Scales with growth: $1M/month = $50K/month for you
- No minimum, no cap
- Paid weekly settlements

**Comparison:**
- Upfront contract: $3K total
- Plus revenue: Unlimited upscaling
- Low risk (only pay when transactions succeed)
- High ceiling (scales to millions)

`;
        }
        if (actions.askingAboutTimeline) {
            response += `
**Phase 1 Detailed Timeline:**

April 13-14 (Day 1-2): Wallet Integration
- Implement Phantom Mobile Wallet Adapter
- Implement Solflare Mobile SDK
- Real wallet address retrieval
- Real balance queries via RPC
Deliverable: User can see real wallet balance

April 15-16 (Day 3-4): Transaction Signing
- Build SmartEscrow transaction in Kotlin
- Deep link signing via Phantom/Solflare
- Handle signed transaction callback
- Submit to Solana RPC
Deliverable: User can sign transaction in wallet

April 17-18 (Day 5-6): End-to-End Testing
- Complete booking flow (voice → wallet → escrow)
- Payment release (sign → transfer → Solscan)
- Test on physical Android devices
- Verify all transactions on mainnet
Deliverable: Full flow works on phone

April 19 (Day 7): Polish + Deployment
- Code cleanup + documentation
- Security review
- Deploy APK update
- Prepare for Series A demo
Deliverable: Production-ready app

`;
        }
        if (actions.askingAboutTechnical) {
            response += `
**Technical Architecture:**

**Your Responsibilities (Android/Solana):**
- Phantom wallet connection (deep link)
- Solflare wallet connection (SDK)
- Real balance queries (RPC)
- Transaction building (Anchor IDL)
- Transaction signing (wallet app)
- Error handling + logging

**My Responsibilities (Backend/Logic):**
- SmartEscrow contract (already deployed)
- Marketplace + agent registry
- Negotiation logic
- Transaction tracking
- Telegram webhook bridge
- Series A materials

**Technical Stack:**
- Kotlin (Android)
- Rust/Anchor (Solana)
- Node.js/TypeScript (Backend)
- Solana Web3.js (RPC queries)
- Phantom SDK (wallet connection)
- Solflare SDK (wallet connection)

**Testing:**
- Devnet first (free)
- Testnet second (verify)
- Mainnet final (real transactions)

`;
        }
        if (actions.askingAboutRisks) {
            response += `
**Risk Mitigation:**

**Risk: Solana network issues**
- Mitigation: Use testnet first, have backup RPC
- Impact: Low (mainnet very stable)

**Risk: Wallet API changes**
- Mitigation: Monitor Phantom/Solflare releases
- Impact: Low (APIs are stable)

**Risk: Timeline slip**
- Mitigation: Daily standups catch issues early
- Impact: Medium (but flexible scope)
- Fallback: Phantom-only Phase 1 (Solflare as Phase 1.5)

**Risk: Integration complexity**
- Mitigation: I provide reference code
- Impact: Medium (Kotlin + Solana tricky)
- Fallback: Hire additional support if needed

**Risk: Security vulnerabilities**
- Mitigation: Security audit before mainnet
- Impact: Low (using proven libraries)
- Note: No private keys in app (wallet handles signing)

`;
        }
        return response || 'Great question! Can you clarify what you\'d like to know more about?';
    }
    /**
     * Store conversation message
     */
    storeConversationMessage(msg) {
        if (!this.conversationId) {
            this.conversationId = `CONV_${Date.now()}`;
        }
        const conv = this.conversations.get(this.conversationId);
        if (conv) {
            conv.messages.push({
                ...msg,
                timestamp: Date.now()
            });
        }
    }
    getRouter() {
        return this.router;
    }
    getConversations() {
        return Array.from(this.conversations.values());
    }
    getConversation(id) {
        return this.conversations.get(id);
    }
}
export default ZoAgentBridge;
//# sourceMappingURL=zo-agent-bridge.js.map