import webpush from 'web-push';
import { env } from '../config/env';

let configured = false;

function configurePush() {
  if (configured) {
    return;
  }

  if (env.vapid.publicKey && env.vapid.privateKey && env.vapid.subject) {
    webpush.setVapidDetails(env.vapid.subject, env.vapid.publicKey, env.vapid.privateKey);
  }

  configured = true;
}

export async function sendPushNotification(subscription: webpush.Subscription, payload: Record<string, unknown>) {
  configurePush();

  if (!env.vapid.publicKey || !env.vapid.privateKey || !env.vapid.subject) {
    return { skipped: true };
  }

  await webpush.sendNotification(subscription, JSON.stringify(payload));
  return { skipped: false };
}