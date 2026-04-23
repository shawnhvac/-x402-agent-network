interface StripePaymentConfig {
    secretKey: string;
    publishableKey: string;
    currency: string;
}
interface StripeCharge {
    chargeId: string;
    amount: number;
    currency: string;
    status: string;
    customerEmail: string;
    description: string;
    paymentMethod: string;
    timestamp: number;
    metadata: {
        service_id?: string;
        booking_id?: string;
        agent_address?: string;
    };
}
declare class StripePaymentProcessor {
    private stripe;
    private config;
    private paymentLog;
    constructor(config?: Partial<StripePaymentConfig>);
    /**
     * Create a payment intent for checkout
     */
    createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    /**
     * Verify a payment intent
     */
    verifyPayment(paymentIntentId: string): Promise<StripeCharge | null>;
    /**
     * Create a charge directly (legacy)
     */
    createCharge(amount: number, token: string, description: string, metadata?: Record<string, string>): Promise<StripeCharge | null>;
    /**
     * Get charge details
     */
    getChargeDetails(chargeId: string): Promise<StripeCharge | null>;
    /**
     * Refund a charge
     */
    refundCharge(chargeId: string, amount?: number): Promise<boolean>;
    /**
     * Get recent charges
     */
    getRecentCharges(limit?: number): Promise<StripeCharge[]>;
    /**
     * Get payment statistics
     */
    getPaymentStats(): Promise<{
        totalCharges: number;
        successfulCharges: number;
        failedCharges: number;
        totalRevenue: number;
    } | null>;
    /**
     * Log payment for audit trail
     */
    private logPayment;
    /**
     * Health check
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        connected: boolean;
        accountId: string;
    }>;
}
export default StripePaymentProcessor;
export { StripeCharge, StripePaymentConfig };
