/**
 * AgentPay Chatbot - Simple Q&A System
 */

const chatbotKB = {
    "what is agentpay": "AgentPay is the global infrastructure layer for agent-to-agent commerce. Any AI agent or API can accept instant USDC payments via HTTP 402 with zero friction, keeping 98% of every transaction.",
    
    "how do i start": "1. Create wallet on Solana, Stellar, Hedera, or Cardano\n2. Get testnet USDC\n3. Send payment TX with agent request\n4. Receive instant result\n\nAPI docs at github.com/shawnhvac/agentpay",
    
    "how do i use agentpay": "1. Create wallet on Solana, Stellar, Hedera, or Cardano\n2. Get testnet USDC\n3. Send payment TX with agent request\n4. Receive instant result\n\nAPI docs at github.com/shawnhvac/agentpay",
    
    "how does agentpay work": "1. Agent sends HTTP POST request with wallet address and payment TX hash\n2. AgentPay verifies payment on-chain\n3. If valid, agent executes and returns result\n4. You keep 98% of the payment\n\nSupported chains: Solana, Stellar, Hedera, Cardano",
    
    "what is x402": "x402 is the payment protocol (HTTP 402 Payment Required per RFC 7231). AgentPay is the complete system built on top of it — the infrastructure, monitoring, multi-chain support, and dashboard.",
    
    "how much does it cost": "AgentPay takes 2% platform fee. You keep 98% of every payment. Self-hosted version is free but requires your own deployment.",
    
    "what chains do you support": "Solana (SOL/USDC), Stellar (XLM/USDC), Hedera (HBAR/USDC), Cardano (ADA/USDC)",
    
    "can i self host": "Yes! Clone from GitHub (https://github.com/shawnhvac/agentpay), npm install, npm start. You keep 100% of payments but handle your own infrastructure.",
    
    "what agents are available": "Demo agents: Grid Trader (0.10 USDC), Sniper Bot (0.25-1.00 USDC), LLM Inference (0.05 USDC/1K tokens), Data Feed (0.01 USDC per price point)",
    
    "how do i get started": "1. Create wallet on Solana, Stellar, Hedera, or Cardano\n2. Get testnet USDC\n3. Send payment TX with agent request\n4. Receive instant result\n\nAPI docs at github.com/shawnhvac/agentpay",
    
    "is agentpay secure": "Yes. Multi-chain payment verification, no private keys stored, blockchain proofs required, 3-layer monitoring, security audit completed.",
    
    "what is the ca address": "Collection Address: 6HUpzeDuDm6vAdY4Hn4wPcBMuSE3UdoJiRTXPn5v7YEt (Solana $MUSKOX token)",
    
    "how do agents make money": "Agents charge per execution. Example: Data Feed charges 0.01 USDC per price point. You set pricing, users pay, you keep 98%.",
    
    "can i create my own agent": "Yes! AgentPay supports any agent type: trading bots, data feeds, AI inference, compute tasks. Deploy on AgentPay network and start earning.",
    
    "what about privacy": "We collect minimal data. No user accounts required. Pay-per-execution via on-chain payments. See /privacy.html for full policy.",
    
    "do you have terms": "Yes, full Terms & Conditions at /terms.html covering payments, liability, blockchain risks.",
    
    "hello": "Hello! 👋 I'm the AgentPay chatbot. Ask me about payments, chains, agents, pricing, or how to get started!",
    
    "hi": "Hi there! 👋 What would you like to know about AgentPay?",
    
    "help": "I can answer questions about:\n- What is AgentPay\n- How it works\n- Supported chains\n- Pricing & fees\n- Demo agents\n- Getting started\n- Security\n- Self-hosting\n- Creating agents\n\nJust ask!",
};

class AgentPayChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatWidget();
        this.attachEventListeners();
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'agentpay-chatbot';
        widget.innerHTML = `
            <div id="chatbot-container" class="chatbot-hidden">
                <div class="chatbot-header">
                    <span>AgentPay Support</span>
                    <button id="chatbot-close" class="chatbot-close">×</button>
                </div>
                <div id="chatbot-messages" class="chatbot-messages"></div>
                <div class="chatbot-input-area">
                    <input type="text" id="chatbot-input" placeholder="Ask me anything...">
                    <button id="chatbot-send">Send</button>
                </div>
            </div>
            <button id="chatbot-toggle" class="chatbot-toggle">💬</button>
        `;
        
        const style = document.createElement('style');
        style.innerHTML = `
            #agentpay-chatbot {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            #chatbot-container {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
                display: flex;
                flex-direction: column;
                z-index: 9999;
                transition: all 0.3s ease;
            }
            
            .chatbot-hidden {
                display: none !important;
            }
            
            .chatbot-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
            }
            
            .chatbot-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            
            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .chatbot-message {
                padding: 10px 12px;
                border-radius: 8px;
                max-width: 85%;
                word-wrap: break-word;
                font-size: 0.9em;
                line-height: 1.4;
            }
            
            .chatbot-message.user {
                background: #667eea;
                color: white;
                margin-left: auto;
                text-align: right;
            }
            
            .chatbot-message.bot {
                background: #f0f0f0;
                color: #333;
                margin-right: auto;
            }
            
            .chatbot-input-area {
                display: flex;
                gap: 8px;
                padding: 12px;
                border-top: 1px solid #eee;
                background: white;
                border-radius: 0 0 12px 12px;
            }
            
            #chatbot-input {
                flex: 1;
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 0.9em;
            }
            
            #chatbot-input:focus {
                outline: none;
                border-color: #667eea;
            }
            
            #chatbot-send {
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                cursor: pointer;
                font-weight: bold;
            }
            
            #chatbot-send:hover {
                background: #764ba2;
            }
            
            .chatbot-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
                z-index: 9998;
            }
            
            .chatbot-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(widget);
    }

    attachEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const send = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        const container = document.getElementById('chatbot-container');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Welcome message
        setTimeout(() => this.addBotMessage("👋 Hi! I'm the AgentPay chatbot. Ask me anything about our platform, pricing, or how to get started!"), 500);
    }

    toggleChat() {
        const container = document.getElementById('chatbot-container');
        if (this.isOpen) {
            this.closeChat();
        } else {
            container.classList.remove('chatbot-hidden');
            this.isOpen = true;
            document.getElementById('chatbot-input').focus();
        }
    }

    closeChat() {
        document.getElementById('chatbot-container').classList.add('chatbot-hidden');
        this.isOpen = false;
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addUserMessage(message);
        input.value = '';

        // Process message
        setTimeout(() => this.processQuery(message), 300);
    }

    addUserMessage(text) {
        const messagesDiv = document.getElementById('chatbot-messages');
        const msg = document.createElement('div');
        msg.className = 'chatbot-message user';
        msg.textContent = text;
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    addBotMessage(text) {
        const messagesDiv = document.getElementById('chatbot-messages');
        const msg = document.createElement('div');
        msg.className = 'chatbot-message bot';
        msg.textContent = text;
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    processQuery(query) {
        const normalized = query.toLowerCase().trim();
        
        // Search knowledge base
        let response = null;
        for (const [key, value] of Object.entries(chatbotKB)) {
            if (normalized.includes(key) || key.includes(normalized)) {
                response = value;
                break;
            }
        }

        if (!response) {
            response = "I'm not sure about that. Try asking about AgentPay, chains, pricing, agents, or how to get started. Or type 'help' for suggestions!";
        }

        this.addBotMessage(response);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AgentPayChatbot();
});
