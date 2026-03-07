/**
 * Push Notification Service
 * Send web push notifications using Web Push API
 */

import webpush from 'web-push';
import { env } from './env';
import Subscriber, { IPushSubscription } from '@/models/Subscriber';
import connectDB from './db';

// Configure web-push with VAPID keys
if (env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

export class PushNotificationService {
  /**
   * Send push notification to a single subscription
   */
  static async sendNotification(
    subscription: IPushSubscription,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
        console.warn('VAPID keys not configured, skipping push notification');
        return false;
      }

      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          badge: payload.badge || '/icon-72x72.png',
          url: payload.url || '/',
          tag: payload.tag || 'default',
          timestamp: Date.now(),
        })
      );

      return true;
    } catch (error: unknown) {
      // Handle expired or invalid subscriptions
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        
        if (statusCode === 404 || statusCode === 410) {
          console.log('Subscription expired or invalid, should remove from DB');
          // Subscription is no longer valid
          return false;
        }
      }

      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send push notification to all subscribed users
   */
  static async sendToAll(payload: PushNotificationPayload): Promise<{
    sent: number;
    failed: number;
  }> {
    await connectDB();

    const subscribers = await Subscriber.find({
      isVerified: true,
      pushSubscription: { $exists: true, $ne: null },
    });

    let sent = 0;
    let failed = 0;
    const expiredSubscriptions: string[] = [];

    for (const subscriber of subscribers) {
      if (subscriber.pushSubscription) {
        const success = await this.sendNotification(
          subscriber.pushSubscription,
          payload
        );

        if (success) {
          sent++;
        } else {
          failed++;
          // Mark for removal if subscription is invalid
          expiredSubscriptions.push(subscriber._id.toString());
        }
      }
    }

    // Remove expired subscriptions
    if (expiredSubscriptions.length > 0) {
      await Subscriber.updateMany(
        { _id: { $in: expiredSubscriptions } },
        { $unset: { pushSubscription: 1 } }
      );
      console.log(`Removed ${expiredSubscriptions.length} expired push subscriptions`);
    }

    return { sent, failed };
  }

  /**
   * Notify about new blog post
   */
  static async notifyNewBlog(
    blogTitle: string,
    blogSlug: string
  ): Promise<{ sent: number; failed: number }> {
    return this.sendToAll({
      title: '📝 New Blog Post Published!',
      body: blogTitle,
      url: `/blog/${blogSlug}`,
      tag: 'new-blog',
    });
  }
}
