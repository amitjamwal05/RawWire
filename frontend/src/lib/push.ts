import { getApiUrl } from './api';

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker is not supported by your browser.');
  }

  if (!('PushManager' in window)) {
    throw new Error('Push Notifications are not supported by your browser.');
  }

  const registration = await navigator.serviceWorker.ready;

  // Check if already subscribed
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return true; // Already subscribed
  }

  // Convert VAPID key to Uint8Array
  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicVapidKey) {
    throw new Error('Missing VAPID public key');
  }

  const base64UrlToUint8Array = (base64Url: string) => {
    const padding = '='.repeat((4 - base64Url.length % 4) % 4);
    const base64 = (base64Url + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicVapidKey)
    });

    // Send subscription to our backend
    const res = await fetch(`${getApiUrl()}/push/subscribe`, {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Failed to save subscription to server');
    }

    return true;
  } catch (error) {
    console.error('Failed to subscribe:', error);
    throw error;
  }
}
