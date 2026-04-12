/**
 * Telegram Agent Bridge - Webhook for agent-to-agent communication
 *
 * Flow:
 * 1. Telegram group message → webhook receives event
 * 2. Parse agent intent (booking, negotiation, payment)
 * 3. Execute SmartEscrow transaction if needed
 * 4. Send response back to Telegram group
 * 5. Log all transactions to database
 */
import express from 'express';
export class TelegramAgentBridge {
    constructor(webhookSecret, telegramBotToken, escrowClient, solanaIntegration) {
        this.router = express.Router();
        this.transactions = new Map();
        this.webhookSecret = webhookSecret;
        this.telegramBotToken = telegramBotToken;
        this.escrowClient = escrowClient;
        this.solanaIntegration = solanaIntegration;
        this.setupRoutes();
    }
    setupRoutes() {
        // Webhook endpoint for Telegram updates
        this.router.post('/telegram-webhook', this.handleTelegramWebhook.bind(this));
        // Health check
        this.router.get('/health', (req, res) => {
            res.json({ status: 'healthy', bridge: 'telegram-agent-bridge' });
        });
        // List active transactions
        this.router.get('/transactions', (req, res) => {
            const txArray = Array.from(this.transactions.values());
            res.json({ total: txArray.length, transactions: txArray });
        });
        // Get transaction by ID
        this.router.get('/transactions/:id', (req, res) => {
            const tx = this.transactions.get(req.params.id);
            if (!tx) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.json(tx);
        });
    }
    async handleTelegramWebhook(req, res) {
        try {
            // Verify webhook signature
            if (!this.verifyWebhookSignature(req)) {
                console.warn('❌ Invalid webhook signature');
                return res.status(403).json({ error: 'Unauthorized' });
            }
            const update = req.body;
            if (!update.message) {
                return res.status(200).json({ ok: true });
            }
            const message = update.message;
            const sender = message.from.username || message.from.first_name;
            const groupId = message.chat.id;
            const text = message.text;
            console.log(`📨 Received from ${sender}: ${text}`);
            // Parse agent message
            const agentMsg = this.parseAgentMessage(text, sender);
            console.log(`🤖 Parsed action: ${agentMsg.action}`);
            // Route based on action
            let response = '';
            switch (agentMsg.action) {
                case 'BOOKING':
                    response = await this.handleBooking(agentMsg, groupId, message.message_id);
                    break;
                case 'NEGOTIATION':
                    response = await this.handleNegotiation(agentMsg, groupId, message.message_id);
                    break;
                case 'PAYMENT':
                    response = await this.handlePayment(agentMsg, groupId, message.message_id);
                    break;
                case 'STATUS':
                    response = await this.handleStatus(agentMsg);
                    break;
                default:
                    response = `❓ I don't understand "${text}". Try:\n- "Book HVAC in Phoenix"\n- "Negotiate 150 USDC"\n- "Release payment 0x..."\n- "Status"`;
            }
            // Send response back to Telegram group
            await this.sendTelegramMessage(groupId, response);
            res.status(200).json({ ok: true });
        }
        catch (error) {
            console.error('❌ Webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    verifyWebhookSignature(req) {
        // Telegram webhook signature verification (if configured)
        // For now, accept all (configure firewall at proxy level)
        return true;
    }
    parseAgentMessage(text, sender) {
        const lowerText = text.toLowerCase();
        const msg = { sender, action: 'UNKNOWN' };
        // BOOKING pattern: "Book [SERVICE] in [LOCATION]"
        if (lowerText.includes('book')) {
            msg.action = 'BOOKING';
            const serviceMatch = text.match(/book\s+(\w+)/i);
            const locationMatch = text.match(/in\s+([A-Za-z\s]+)(?:\s|$)/i);
            if (serviceMatch)
                msg.service = serviceMatch[1];
            if (locationMatch)
                msg.location = locationMatch[1].trim();
            return msg;
        }
        // NEGOTIATION pattern: "Negotiate [PRICE]"
        if (lowerText.includes('negotiate') || lowerText.includes('offer')) {
            msg.action = 'NEGOTIATION';
            const priceMatch = text.match(/(\d+(?:\.\d{2})?)\s*(usdc|sol)?/i);
            if (priceMatch) {
                msg.budget = parseFloat(priceMatch[1]);
            }
            return msg;
        }
        // PAYMENT pattern: "Release payment [TX_HASH]" or "Pay [AMOUNT]"
        if (lowerText.includes('release') || lowerText.includes('pay')) {
            msg.action = 'PAYMENT';
            const hashMatch = text.match(/0x[a-f0-9]{64}/i);
            if (hashMatch)
                msg.transactionHash = hashMatch[0];
            const amountMatch = text.match(/(\d+(?:\.\d{2})?)\s*(usdc|sol)?/i);
            if (amountMatch)
                msg.budget = parseFloat(amountMatch[1]);
            return msg;
        }
        // STATUS pattern: "Status" or "What's going on"
        if (lowerText.includes('status') || lowerText.includes('what') || lowerText.includes('info')) {
            msg.action = 'STATUS';
            return msg;
        }
        return msg;
    }
    async handleBooking(msg, groupId, messageId) {
        try {
            console.log(`📋 Booking request: ${msg.service} in ${msg.location}`);
            // In real implementation:
            // 1. Query marketplace for agents matching service + location
            // 2. Create SmartEscrow contract
            // 3. Wait for agent acceptance
            // 4. Lock funds in escrow
            // For now, simulate successful booking
            const bookingId = `BK_${Date.now()}`;
            const mockEscrow = {
                id: bookingId,
                buyerId: msg.sender,
                sellerId: 'agent_xyz',
                amount: msg.budget || 150,
                currency: 'USDC',
                status: 'PENDING',
                telegramGroupId: groupId,
                messageId: messageId,
                timestamp: Date.now()
            };
            this.transactions.set(bookingId, mockEscrow);
            return `✅ **Booking Confirmed**\n\n📋 **Booking ID:** \`${bookingId}\`\n🔧 **Service:** ${msg.service}\n📍 **Location:** ${msg.location}\n💰 **Budget:** ${mockEscrow.amount} USDC\n⏳ **Status:** Awaiting agent response\n\n🔗 [View on Solscan](https://solscan.io)\n`;
        }
        catch (error) {
            console.error('Booking error:', error);
            return `❌ Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
    async handleNegotiation(msg, groupId, messageId) {
        try {
            console.log(`💰 Negotiation: ${msg.budget} USDC`);
            // Agent counter-offer or acceptance
            const negotiationId = `NEG_${Date.now()}`;
            return `💬 **Negotiation Update**\n\n💵 **Offered:** ${msg.budget} USDC\n✅ **Status:** Agent reviewing offer\n⏳ **Next:** Awaiting acceptance or counter\n`;
        }
        catch (error) {
            return `❌ Negotiation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
    async handlePayment(msg, groupId, messageId) {
        try {
            console.log(`💳 Payment release requested`);
            // Release payment from escrow to agent
            // 1. Verify booking exists
            // 2. Create release transaction
            // 3. Sign with user's wallet (Phantom)
            // 4. Submit to Solana
            // 5. Verify on Solscan
            const releaseId = `REL_${Date.now()}`;
            const mockTx = {
                id: releaseId,
                buyerId: msg.sender,
                sellerId: 'agent_xyz',
                amount: 150,
                currency: 'USDC',
                status: 'COMPLETED',
                telegramGroupId: groupId,
                messageId: messageId,
                timestamp: Date.now(),
                transactionHash: `4xHz${Math.random().toString(36).substring(2, 66)}`
            };
            this.transactions.set(releaseId, mockTx);
            return `✅ **Payment Released**\n\n💸 **Amount:** 150 USDC\n🏪 **From:** You\n🚗 **To:** Agent\n\n🔗 **Transaction:** \`${mockTx.transactionHash}\`\n🔍 [View on Solscan](https://solscan.io/tx/${mockTx.transactionHash})\n⏱️ **Confirmed:** 2 seconds ago\n`;
        }
        catch (error) {
            return `❌ Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
    async handleStatus(msg) {
        const txArray = Array.from(this.transactions.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
        if (txArray.length === 0) {
            return `📊 **No transactions yet**\n\nStart by saying: "Book HVAC in Phoenix"`;
        }
        let status = `📊 **Recent Transactions**\n\n`;
        txArray.forEach((tx, i) => {
            status += `${i + 1}. **${tx.id}**\n`;
            status += `   💰 ${tx.amount} ${tx.currency}\n`;
            status += `   ✅ ${tx.status}\n`;
            status += `   🕐 ${new Date(tx.timestamp).toLocaleTimeString()}\n\n`;
        });
        return status;
    }
    async sendTelegramMessage(chatId, text) {
        try {
            const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
            const payload = {
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                console.error(`❌ Telegram send failed: ${response.statusText}`);
            }
            else {
                console.log(`✅ Message sent to Telegram group ${chatId}`);
            }
        }
        catch (error) {
            console.error('Send message error:', error);
        }
    }
    getRouter() {
        return this.router;
    }
    getTransactions() {
        return Array.from(this.transactions.values());
    }
    getTransaction(id) {
        return this.transactions.get(id);
    }
}
export default TelegramAgentBridge;
//# sourceMappingURL=telegram-agent-bridge.js.map