// Email service utilities
// In production, integrate with a real email service like SendGrid, Postmark, etc.

import { randomBytes } from 'crypto';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Stub for email sending - in production, replace with actual email service
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In development, log the email instead of sending
  if (process.env.NODE_ENV === 'development') {
    console.log('=============== EMAIL ===============');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('HTML:', options.html);
    console.log('=====================================');
    return true;
  }

  // In production, integrate with your email provider
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: options.to,
  //   from: process.env.EMAIL_FROM,
  //   subject: options.subject,
  //   html: options.html,
  //   text: options.text,
  // });

  console.log('Email would be sent in production:', options.to);
  return true;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<boolean> {
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify your Playforge email',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Verify your email</h1>
        <p>Thanks for signing up for Playforge! Please verify your email address by clicking the button below.</p>
        <p style="margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #3b82f6;">${verifyUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 24 hours.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">
          If you didn't create an account on Playforge, you can ignore this email.
        </p>
      </div>
    `,
    text: `Verify your email by visiting: ${verifyUrl}`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Reset your Playforge password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Reset your password</h1>
        <p>We received a request to reset your Playforge password. Click the button below to create a new password.</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #3b82f6;">${resetUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">
          If you didn't request a password reset, you can ignore this email.
        </p>
      </div>
    `,
    text: `Reset your password by visiting: ${resetUrl}`,
  });
}
