import nodemailer from 'nodemailer';
import { Booking, Provider, User, Payout } from '@prisma/client';

// Configure email transporter (using Gmail or SendGrid in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class EmailService {
  /**
   * Send payment confirmation to user
   */
  static async sendPaymentConfirmation(
    user: User,
    booking: Booking,
    provider: Provider,
    amount: number
  ) {
    try {
      const html = `
        <h1>Booking Confirmed! ✅</h1>
        <p>Hi ${user.name},</p>
        <p>Your booking with <strong>${provider.name}</strong> has been confirmed.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Provider:</strong> ${provider.name}</li>
          <li><strong>Address:</strong> ${provider.address}</li>
          <li><strong>Date/Time:</strong> ${booking.scheduledTime}</li>
          <li><strong>Amount:</strong> $${amount.toFixed(2)}</li>
        </ul>
        
        <p>Provider contact: ${provider.phone}</p>
        
        <p>Questions? Reply to this email or contact us at support@agentpay.com</p>
        <p>- AgentPay Team</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@agentpay.com',
        to: user.email,
        subject: `Booking Confirmed with ${provider.name}`,
        html,
      });

      console.log(`📧 Payment confirmation sent to ${user.email}`);
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  /**
   * Send booking notification to provider
   */
  static async sendBookingNotification(
    provider: Provider,
    booking: Booking,
    user: User,
    amount: number
  ) {
    try {
      const html = `
        <h1>New Booking! 🎉</h1>
        <p>Hi ${provider.name},</p>
        <p>You have a new booking request.</p>
        
        <h3>Customer Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${user.name}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Date/Time:</strong> ${booking.scheduledTime}</li>
          <li><strong>Amount:</strong> $${amount.toFixed(2)}</li>
        </ul>
        
        <p>Log in to your AgentPay dashboard to manage this booking.</p>
        <p>Dashboard: https://x402-agent-pay.com/dashboard</p>
        
        <p>- AgentPay Team</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@agentpay.com',
        to: provider.email,
        subject: 'New Booking on AgentPay',
        html,
      });

      console.log(`📧 Booking notification sent to ${provider.email}`);
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  /**
   * Send payout notification to provider
   */
  static async sendPayoutNotification(
    provider: Provider,
    payout: Payout,
    netAmount: number
  ) {
    try {
      const html = `
        <h1>Payout Processed! 💰</h1>
        <p>Hi ${provider.name},</p>
        <p>Your payout has been processed and sent to your bank account.</p>
        
        <h3>Payout Details:</h3>
        <ul>
          <li><strong>Gross Amount:</strong> $${payout.amount.toFixed(2)}</li>
          <li><strong>AgentPay Fee:</strong> $${payout.fee.toFixed(2)}</li>
          <li><strong>Net Amount:</strong> $${netAmount.toFixed(2)}</li>
          <li><strong>Status:</strong> ${payout.status}</li>
          <li><strong>Date:</strong> ${new Date().toISOString()}</li>
        </ul>
        
        <p>Check your bank account in 1-2 business days.</p>
        <p>View all transactions: https://x402-agent-pay.com/dashboard/payouts</p>
        
        <p>- AgentPay Team</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@agentpay.com',
        to: provider.email,
        subject: 'Payout Processed',
        html,
      });

      console.log(`📧 Payout notification sent to ${provider.email}`);
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  /**
   * Send payment failure notification
   */
  static async sendPaymentFailedNotification(
    user: User,
    provider: Provider,
    reason: string
  ) {
    try {
      const html = `
        <h1>Payment Failed ❌</h1>
        <p>Hi ${user.name},</p>
        <p>Unfortunately, your payment for <strong>${provider.name}</strong> could not be processed.</p>
        
        <h3>Reason:</h3>
        <p>${reason}</p>
        
        <h3>What to do:</h3>
        <ol>
          <li>Try again with a different card</li>
          <li>Contact your bank to check for issues</li>
          <li>Email support@agentpay.com for help</li>
        </ol>
        
        <p>- AgentPay Team</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@agentpay.com',
        to: user.email,
        subject: `Payment Failed for ${provider.name}`,
        html,
      });

      console.log(`📧 Payment failure notification sent to ${user.email}`);
    } catch (error) {
      console.error('Email error:', error);
    }
  }
}

export default EmailService;
