declare const router: import("express-serve-static-core").Router;
export declare function registerBooking(booking: {
    id: string;
    phone?: string;
    email?: string;
    businessName: string;
    serviceType: string;
    customerName?: string;
    customerEmail?: string;
    date: string;
    time: string;
    price: number;
    fee?: number;
    net?: number;
}): void;
export default router;
