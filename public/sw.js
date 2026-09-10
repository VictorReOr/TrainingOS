// ══════════════════════════════════════════════════════════════════════════════
// TrainingOS · Service Worker
// Maneja notificaciones del temporizador en segundo plano y pantalla bloqueada
// ══════════════════════════════════════════════════════════════════════════════

const SW_VERSION = 'v2.0.0';
const CACHE_NAME = `trainingos-${SW_VERSION}`;
let activeTimerTimeout = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SCHEDULE_TIMER') {
    if (activeTimerTimeout) {
      clearTimeout(activeTimerTimeout);
      activeTimerTimeout = null;
    }

    const { targetTimestamp, title, body } = data;
    const now = Date.now();
    const delay = Math.max(0, targetTimestamp - now);

    activeTimerTimeout = setTimeout(async () => {
      activeTimerTimeout = null;
      try {
        await self.registration.showNotification(title || 'TrainingOS — ¡Descanso completado!', {
          body: body || 'El tiempo de descanso ha finalizado. ¡A por la siguiente serie!',
          icon: '/icon-192.png',
          badge: '/icon-48.png',
          vibrate: [300, 150, 300, 150, 300],
          tag: 'trainingos-timer-alert',
          renotify: true,
          requireInteraction: true,
          data: { url: '/session' },
        });
      } catch (err) {
        console.warn('[SW] Error showing notification:', err);
      }
    }, delay);
  }

  if (data.type === 'CANCEL_TIMER') {
    if (activeTimerTimeout) {
      clearTimeout(activeTimerTimeout);
      activeTimerTimeout = null;
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
