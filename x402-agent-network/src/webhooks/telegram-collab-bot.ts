/**
 * Telegram Collaboration Bot - 3-Way Agent Communication
 * Shawn + OX + muskox2 real-time coordination
 * 
 * Bot Token: 8656762351:AAE9rsraBy2CurSR5rlku36q8vCaQ1vH9gA
 */

import express, { Request, Response } from 'express';
import axios, { AxiosInstance } from 'axios';

interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
    title?: string;
  };
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  text: string;
  date: number;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface CollaborationMessage {
  from: string;
  to: string[];
  text: string;
  timestamp: number;
  type: 'DECISION' | 'QUESTION' | 'UPDATE' | 'TRANSACTION' | 'ALERT';
  action?: string;
}

export class TelegramCollabBot {
  private router = express.Router();
  private botToken = '8656762351:AAE9rsraBy2CurSR5rlku36q8vCaQ1vH9gA';
  private telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
  private axiosClient: AxiosInstance;
  private messages: CollaborationMessage[] = [];
  private groupChatId: number | null = null;

  constructor() {
    this.axiosClient = axios.create();
    this.setupRoutes();
  }

  private setupRoutes() {
    // Webhook for Telegram updates
    this.router.post('/telegram-collab-webhook', this.handleTelegramWebhook.bind(this));

    // Health check
    this.router.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        bot: 'telegram-collab-bot',
        groupChatId: this.groupChatId
      });
    });

    // Get message history
    this.router.get('/messages', (req, res) => {
      res.json({ 
        total: this.messages.length, 
        messages: this.messages.slice(-50) // Last 50 messages
      });
    });

    // Send message to group
    this.router.post('/send-to-group', this.handleSendToGroup.bind(this));

    // Register group chat
    this.router.post('/set-group-id', (req, res) => {
      const { chatId } = req.body;
      if (chatId) {
        this.groupChatId = chatId;
        res.json({ success: true, message: `Group registered: ${chatId}` });
      } else {
        res.status(400).json({ error: 'chatId required' });
      }
    });
  }

  private async handleTelegramWebhook(req: Request, res: Response) {
    try {
      const update: TelegramUpdate = req.body;

      if (!update.message) {
        return res.status(200).json({ ok: true });
      }

      const msg = update.message;
      const sender = msg.from.username || msg.from.first_name;
      const text = msg.text;

      // Register group chat ID
      if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') {
        this.groupChatId = msg.chat.id;
        console.log(`📍 Group registered: ${msg.chat.title} (${msg.chat.id})`);
      }

      console.log(`📨 [${sender}] in ${msg.chat.title || 'DM'}: ${text}`);

      // Parse message type
      const messageType = this.parseMessageType(text);
      const action = this.extractAction(text);

      // Store message
      this.messages.push({
        from: sender,
        to: ['OX', 'muskox2', 'Shawn'],
        text: text,
        timestamp: Date.now(),
        type: messageType,
        action: action
      });

      // Route based on message type
      let response = '';
      switch (messageType) {
        case 'DECISION':
          response = await this.handleDecision(text, sender);
          break;
        case 'QUESTION':
          response = await this.handleQuestion(text, sender);
          break;
        case 'TRANSACTION':
          response = await this.handleTransactionUpdate(text, sender);
          break;
        case 'ALERT':
          response = await this.handleAlert(text, sender);
          break;
        default:
          response = await this.handleUpdate(text, sender);
      }

      // Send response back to group/chat
      if (response) {
        await this.sendTelegramMessage(msg.chat.id, response);
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal error' });
    }
  }

  private parseMessageType(text: string): CollaborationMessage['type'] {
    const lower = text.toLowerCase();

    if (lower.includes('approve') || lower.includes('confirm') || lower.includes('go ahead')) {
      return 'DECISION';
    }
    if (lower.includes('?') || lower.includes('how') || lower.includes('what')) {
      return 'QUESTION';
    }
    if (lower.includes('transaction') || lower.includes('usdc') || lower.includes('solscan')) {
      return 'TRANSACTION';
    }
    if (lower.includes('error') || lower.includes('failed') || lower.includes('warning')) {
      return 'ALERT';
    }
    return 'UPDATE';
  }

  private extractAction(text: string): string | undefined {
    const lower = text.toLowerCase();

    if (lower.includes('start phase')) return 'START_PHASE';
    if (lower.includes('create wallet')) return 'CREATE_WALLET';
    if (lower.includes('fund wallet')) return 'FUND_WALLET';
    if (lower.includes('first transaction')) return 'FIRST_TRANSACTION';
    if (lower.includes('second transaction')) return 'SECOND_TRANSACTION';
    if (lower.includes('verify')) return 'VERIFY';

    return undefined;
  }

  private async handleDecision(text: string, sender: string): Promise<string> {
    console.log(`✅ DECISION from ${sender}: ${text}`);

    return `✅ **Decision Recorded**\n\n**From:** ${sender}\n**Text:** ${text}\n\n📌 All agents notified. Proceeding with approval.\n\n🤖 OX + muskox2: Standby for next instructions.`;
  }

  private async handleQuestion(text: string, sender: string): Promise<string> {
    console.log(`❓ QUESTION from ${sender}: ${text}`);

    // Determine who should answer
    const answerer = sender === 'Shawn' ? '🤖 OX' : '📋 Shawn';

    return `❓ **Question from ${sender}**\n\n${text}\n\n${answerer}: Please provide answer/clarification.`;
  }

  private async handleTransactionUpdate(text: string, sender: string): Promise<string> {
    console.log(`💰 TRANSACTION UPDATE from ${sender}: ${text}`);

    return `💰 **Transaction Update**\n\nFrom: ${sender}\nDetails: ${text}\n\n✅ Logged for Series A proof.`;
  }

  private async handleAlert(text: string, sender: string): Promise<string> {
    console.log(`⚠️ ALERT from ${sender}: ${text}`);

    return `⚠️ **ALERT**\n\nFrom: ${sender}\nDetails: ${text}\n\n🔴 Escalated. Shawn + OX: Immediate attention required.`;
  }

  private async handleUpdate(text: string, sender: string): Promise<string> {
    console.log(`📝 UPDATE from ${sender}: ${text}`);

    return `📝 **Update Received**\n\nFrom: ${sender}\n\n✅ Logged to collaboration history.`;
  }

  private async sendTelegramMessage(chatId: number, text: string): Promise<void> {
    try {
      const url = `${this.telegramApiUrl}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      };

      await this.axiosClient.post(url, payload);
      console.log(`✅ Message sent to chat ${chatId}`);
    } catch (error) {
      console.error('Send message error:', error);
    }
  }

  private async handleSendToGroup(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'text required' });
      }

      if (!this.groupChatId) {
        return res.status(400).json({ error: 'Group chat not registered yet' });
      }

      await this.sendTelegramMessage(this.groupChatId, text);
      res.json({ success: true, message: 'Message sent to group' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  public getRouter() {
    return this.router;
  }

  public getMessages() {
    return this.messages;
  }
}

export default TelegramCollabBot;
