/**
 * app.ts - Main Express application
 * WEEK 1: Basic x402 flow + agent registry
 */
declare global {
    namespace Express {
        interface Response {
            paymentRequired: (options: PaymentRequiredOptions) => Response;
        }
    }
}
declare const app: import("express-serve-static-core").Express;
export default app;
