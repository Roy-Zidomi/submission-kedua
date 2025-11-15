const BASE_URL = 'https://story-api.dicoding.dev/v1';
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NotificationHelper = {
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.error('[NotificationHelper] Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (err) {
      console.error('Failed to register service worker:', err);
      return null;
    }
  },

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('[NotificationHelper] Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    console.log('[NotificationHelper] Permission result:', permission);
    return permission === 'granted';
  },

  async subscribeUser(registration, token) {
    if (!registration || !('pushManager' in registration)) {
      console.error('[NotificationHelper] Invalid registration');
      return null;
    }

    if (!token || token.length < 10) {
      console.error('[NotificationHelper] Missing or invalid token');
      alert('Token login tidak valid. Silakan login ulang.');
      return null;
    }

    try {
      // Cek subscription aktif
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log('[NotificationHelper] New subscription created');
      } else {
        console.log('[NotificationHelper] Using existing subscription');
      }

      // Hanya kirim data yang dibutuhkan server Dicoding
      const payload = {
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
      };

      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          console.error('[NotificationHelper] Unauthorized — invalid token');
          alert('Token login tidak valid. Silakan login ulang.');
          localStorage.removeItem('token');
        } else {
          console.error('[NotificationHelper] Server error:', data.message || response.statusText);
        }
        throw new Error(data.message || 'Failed to subscribe on server');
      }

      localStorage.setItem('push-subscribed', 'true');
      console.log('[NotificationHelper] Subscribed and sent to server');
      return subscription;
    } catch (err) {
      console.error('[NotificationHelper] subscribeUser error:', err);
      localStorage.setItem('push-subscribed', 'false');
      return null;
    }
  },

  async unsubscribeUser(registration, token) {
    if (!registration || !('pushManager' in registration)) {
      console.error('[NotificationHelper] Invalid registration');
      return null;
    }

    if (!token || token.length < 10) {
      console.error('[NotificationHelper] Missing or invalid token');
      alert('Token login tidak valid. Silakan login ulang.');
      return null;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.log('[NotificationHelper] No active subscription');
        localStorage.setItem('push-subscribed', 'false');
        return true;
      }

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok && response.status !== 404) {
        console.warn('[NotificationHelper] Server deletion failed:', data.message);
      }

      localStorage.setItem('push-subscribed', 'false');
      console.log('[NotificationHelper] Unsubscribed successfully');
      return true;
    } catch (err) {
      console.error('[NotificationHelper] unsubscribeUser error:', err);
      return null;
    }
  },

  async isSubscribed(registration) {
    if (!registration || !('pushManager' in registration)) return false;
    try {
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (err) {
      console.error('[NotificationHelper] Error checking subscription:', err);
      return false;
    }
  },
};

export default NotificationHelper;
