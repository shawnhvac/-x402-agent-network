/**
 * app.ts - Main Express application
 * WEEK 1: Basic x402 flow + agent registry
 */
import { type PaymentRequiredOptions } from "./middleware/x402.js";
declare global {
    namespace Express {
        interface Response {
            paymentRequired: (options: PaymentRequiredOptions) => Response;
        }
    }
}
declare const app: import("express-serve-static-core").Express;
export default app;
