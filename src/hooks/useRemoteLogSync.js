import { useEffect } from 'react';
import { auth } from '../config/firebase';
import { getLogs, USE_SHEETS } from '../services/sheets';
import { mergeSessionLogs } from '../utils/mergeSessionLogs';

const SYNC_THROTTLE_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Hook de sincronización en segundo plano (Remote Log Sync).
 *
 * Al montar la app o la vista correspondiente:
 * 1. Verifica autenticación y respeta throttle de 5 minutos mediante sessionStorage.
 * 2. Descarga silenciosamente los logs remotos del atleta desde Sheets (getLogs).
 * 3. Los combina de forma no bloqueante con los logs de localStorage usando mergeSessionLogs.
 * 4. Actualiza localStorage y emite el evento 'session_logs_updated' para reactivar los componentes.
 * 5. Si la red falla o está en modo offline, la app continúa con local-first sin interrumpir al usuario.
 */
export function useRemoteLogSync() {
  useEffect(() => {
    const syncLogs = async () => {
      const demoMode = localStorage.getItem('trainingos_demo_mode') === 'true';
      if (!USE_SHEETS || demoMode) return;

      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Comprobar throttle de 5 minutos
      const lastSync = sessionStorage.getItem('trainingos_last_log_sync');
      const now = Date.now();
      if (lastSync && now - parseInt(lastSync, 10) < SYNC_THROTTLE_MS) {
        return;
      }

      try {
        const res = await getLogs(uid);
        if (res && res.rows && Array.isArray(res.rows) && res.rows.length > 0) {
          const rawLocal = localStorage.getItem('trainingos_session_logs');
          const localLogs = rawLocal ? JSON.parse(rawLocal) : [];

          const merged = mergeSessionLogs(localLogs, res.rows);
          if (merged.length > 0) {
            localStorage.setItem('trainingos_session_logs', JSON.stringify(merged));
            window.dispatchEvent(new Event('session_logs_updated'));
            console.log(`[RemoteLogSync] Sincronización completa: ${merged.length} sesiones en localStorage.`);
          }
        }
        sessionStorage.setItem('trainingos_last_log_sync', now.toString());
      } catch (err) {
        console.warn('[RemoteLogSync] No se pudieron sincronizar logs remotos (modo offline activo):', err.message);
      }
    };

    syncLogs();
  }, []);
}

