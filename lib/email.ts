/**
 * Email Service
 * Send emails using Nodemailer with HTML templates
 */

import nodemailer, { Transporter } from 'nodemailer';
import { env } from './env';

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  // Only create transporter if SMTP is configured
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    throw new Error('SMTP configuration is missing');
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587', 10),
    secure: env.SMTP_SECURE === 'true',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();

    await transport.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`✅ Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Send verification email to subscriber
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<boolean> {
  const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/api/subscribers/verify?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0284c7; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">${env.NEXT_PUBLIC_APP_NAME}</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #0284c7; margin-top: 0;">Verify Your Email Address</h2>
        <p>Thank you for subscribing to ${env.NEXT_PUBLIC_APP_NAME}!</p>
        <p>Please click the button below to verify your email address and complete your subscription:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #0284c7; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #0284c7; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours. If you didn't subscribe to our newsletter, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Verify your email - ${env.NEXT_PUBLIC_APP_NAME}`,
    html,
  });
}

/**
 * Send new blog notification to subscribers
 */
export async function sendNewBlogNotification(
  email: string,
  blogTitle: string,
  blogSlug: string,
  blogExcerpt: string
): Promise<boolean> {
  const blogUrl = `${env.NEXT_PUBLIC_APP_URL}/blog/${blogSlug}`;
  const unsubscribeUrl = `${env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Blog Post</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0284c7; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">${env.NEXT_PUBLIC_APP_NAME}</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #0284c7; margin-top: 0;">📝 New Blog Post Published!</h2>
        <h3 style="color: #333; margin-bottom: 15px;">${blogTitle}</h3>
        <p style="color: #666; line-height: 1.8;">${blogExcerpt}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${blogUrl}" style="background: #0284c7; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Read Article</a>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          If you no longer wish to receive these emails, you can 
          <a href="${unsubscribeUrl}" style="color: #0284c7; text-decoration: none;">unsubscribe here</a>.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `New Post: ${blogTitle}`,
    html,
  });
}

/**
 * Send batch emails with delay to avoid rate limiting
 */
export async function sendBatchEmails(
  emails: string[],
  emailGenerator: (email: string) => Promise<SendEmailOptions>,
  delayBetweenEmails: number = 1000
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      const emailOptions = await emailGenerator(email);
      const success = await sendEmail(emailOptions);
      
      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Delay between emails to avoid rate limiting
      if (delayBetweenEmails > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
      }
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      failed++;
    }
  }

  return { sent, failed };
}
