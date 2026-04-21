/**
 * Telegram Collaboration Bot - 3-Way Agent Communication
 * Shawn + OX + muskox2 real-time coordination
 *
 * Bot Token: 8656762351:AAE9rsraBy2CurSR5rlku36q8vCaQ1vH9gA
 */
interface CollaborationMessage {
    from: string;
    to: string[];
    text: string;
    timestamp: number;
    type: 'DECISION' | 'QUESTION' | 'UPDATE' | 'TRANSACTION' | 'ALERT';
    action?: string;
}
export declare class TelegramCollabBot {
    private router;
    private botToken;
    private telegramApiUrl;
    private axiosClient;
    private messages;
    private groupChatId;
    constructor();
    private setupRoutes;
    private handleTelegramWebhook;
    private parseMessageType;
    private extractAction;
    private handleDecision;
    private handleQuestion;
    private handleTransactionUpdate;
    private handleAlert;
    private handleUpdate;
    private sendTelegramMessage;
    private handleSendToGroup;
    getRouter(): import("express-serve-static-core").Router;
    getMessages(): CollaborationMessage[];
}
export default TelegramCollabBot;
