// ══════════════════════════════════════════════════════════════════════════════
// TrainingOS · Notificaciones y Service Worker Manager
// ══════════════════════════════════════════════════════════════════════════════

let swRegistration = null;

/**
 * Registra el Service Worker de TrainingOS.
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;
    console.log('[SW] Service Worker registrado con éxito:', reg.scope);
    return reg;
  } catch (err) {
    console.warn('[SW] Error registrando Service Worker:', err);
    return null;
  }
}

/**
 * Solicita permiso de notificaciones al usuario si aún no está decidido.
 * @returns {Promise<boolean>} true si el permiso está concedido
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn('[Notifications] Error solicitando permisos:', err);
      return false;
    }
  }

  return false;
}

/**
 * Programa una alerta en el Service Worker para que suene/vibre incluso
 * con la pantalla apagada o la app en segundo plano.
 *
 * @param {number} targetTimestamp - Timestamp absoluto (ms) en que finaliza el temporizador
 * @param {string} [title] - Título de la notificación
 * @param {string} [body] - Cuerpo del mensaje
 */
export function scheduleTimerAlert(targetTimestamp, title, body) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const controller = navigator.serviceWorker.controller;
  if (!controller) {
    navigator.serviceWorker.ready.then(reg => {
      reg.active?.postMessage({
        type: 'SCHEDULE_TIMER',
        targetTimestamp,
        title: title || 'TrainingOS — ¡Descanso completado!',
        body: body || 'El tiempo de descanso ha finalizado. ¡A por la siguiente serie!',
      });
    }).catch(() => {});
    return;
  }

  controller.postMessage({
    type: 'SCHEDULE_TIMER',
    targetTimestamp,
    title: title || 'TrainingOS — ¡Descanso completado!',
    body: body || 'El tiempo de descanso ha finalizado. ¡A por la siguiente serie!',
  });
}

/**
 * Cancela cualquier alerta programada en el Service Worker.
 */
export function cancelTimerAlert() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const controller = navigator.serviceWorker.controller;
  if (controller) {
    controller.postMessage({ type: 'CANCEL_TIMER' });
  } else {
    navigator.serviceWorker.ready.then(reg => {
      reg.active?.postMessage({ type: 'CANCEL_TIMER' });
    }).catch(() => {});
  }
}
