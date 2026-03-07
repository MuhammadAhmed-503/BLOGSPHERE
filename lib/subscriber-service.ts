/**
 * Subscriber Service Layer
 * Business logic for email subscriptions
 */

import connectDB from '@/lib/db';
import Subscriber, { IPushSubscription } from '@/models/Subscriber';
import { generateToken } from '@/lib/security';
import { sendVerificationEmail, sendNewBlogNotification } from '@/lib/email';

// Plain JS object shape returned by `.lean()`
export interface LeanSubscriber {
  _id: unknown; // ObjectId from Mongoose
  email: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  pushSubscription?: IPushSubscription;
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriberService {
  /**
   * Create a new subscriber (unverified)
   */
  static async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    await connectDB();

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });

    if (existing && existing.isVerified) {
      return {
        success: false,
        message: 'This email is already subscribed',
      };
    }

    if (existing && !existing.isVerified) {
      // Resend verification email
      const verificationToken = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      existing.verificationToken = verificationToken;
      existing.verificationTokenExpires = expiresAt;
      await existing.save();

      await sendVerificationEmail(email, verificationToken);

      return {
        success: true,
        message: 'Verification email resent. Please check your inbox.',
      };
    }

    // Create new subscriber
    const verificationToken = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await Subscriber.create({
      email,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: expiresAt,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return {
      success: true,
      message: 'Please check your email to verify your subscription',
    };
  }

  /**
   * Verify subscriber email
   */
  static async verifySubscriber(token: string): Promise<{ success: boolean; message: string }> {
    await connectDB();

    const subscriber = await Subscriber.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpires');

    if (!subscriber) {
      return {
        success: false,
        message: 'Invalid or expired verification token',
      };
    }

    subscriber.isVerified = true;
    subscriber.verificationToken = undefined;
    subscriber.verificationTokenExpires = undefined;
    await subscriber.save();

    return {
      success: true,
      message: 'Email verified successfully! You are now subscribed.',
    };
  }

  /**
   * Unsubscribe a user
   */
  static async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    await connectDB();

    const result = await Subscriber.findOneAndDelete({ email });

    if (!result) {
      return {
        success: false,
        message: 'Email not found in our subscription list',
      };
    }

    return {
      success: true,
      message: 'You have been unsubscribed successfully',
    };
  }

  /**
   * Get all verified subscribers
   */
  static async getVerifiedSubscribers(): Promise<LeanSubscriber[]> {
    await connectDB();

    const subscribers = await Subscriber.find({ isVerified: true }).lean();
    return subscribers as unknown as LeanSubscriber[];
  }

  /**
   * Get subscriber count
   */
  static async getSubscriberCount(): Promise<number> {
    await connectDB();

    const count = await Subscriber.countDocuments({ isVerified: true });
    return count;
  }

  /**
   * Store push subscription for a subscriber
   */
  static async storePushSubscription(
    email: string,
    subscription: IPushSubscription
  ): Promise<{ success: boolean; message: string }> {
    await connectDB();

    const subscriber = await Subscriber.findOne({ email, isVerified: true });

    if (!subscriber) {
      return {
        success: false,
        message: 'Subscriber not found or not verified',
      };
    }

    subscriber.pushSubscription = subscription;
    await subscriber.save();

    return {
      success: true,
      message: 'Push notification subscription saved',
    };
  }

  /**
   * Notify all subscribers about new blog post
   */
  static async notifySubscribers(
    blogTitle: string,
    blogSlug: string,
    blogExcerpt: string
  ): Promise<{ sent: number; failed: number }> {
    await connectDB();

    const subscribers = await this.getVerifiedSubscribers();
    let sent = 0;
    let failed = 0;

    // Send emails in batches with delay to avoid rate limiting
    for (const subscriber of subscribers) {
      try {
        const success = await sendNewBlogNotification(
          subscriber.email,
          blogTitle,
          blogSlug,
          blogExcerpt
        );

        if (success) {
          sent++;
        } else {
          failed++;
        }

        // Delay between emails (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to notify ${subscriber.email}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }
}
