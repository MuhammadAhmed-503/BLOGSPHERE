/**
 * Web Push Client Utilities
 * Functions for registering push notifications in the browser
 */

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  return await Notification.requestPermission();
}

export async function subscribeToPush(
  vapidPublicKey: string,
  email: string
): Promise<boolean> {
  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      return false;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return false;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    // Send subscription to server
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        subscription: subscription.toJSON(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return false;
  }
}

export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}
