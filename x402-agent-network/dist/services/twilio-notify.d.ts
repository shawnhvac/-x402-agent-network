export declare function calculateFee(servicePrice: number): number;
export declare function feePercent(servicePrice: number): string;
export declare function sendSMS(to: string, body: string): Promise<boolean>;
export declare function makeRobocall(to: string, message: string, bookingId: string): Promise<boolean>;
export declare function sendEmailNotification(email: string, subject: string, body: string, bookingId?: string, type?: string): Promise<boolean>;
export interface BookingNotification {
    bookingId: string;
    businessName: string;
    businessPhone?: string;
    businessEmail?: string;
    serviceType: string;
    customerName?: string;
    date: string;
    time: string;
    price: number;
    attempt?: number;
}
export interface NotificationResult {
    sent: boolean;
    method: 'sms' | 'voice' | 'email' | 'none';
    attempt: number;
    message?: string;
}
export declare function notifyBusiness(booking: BookingNotification): Promise<NotificationResult>;
