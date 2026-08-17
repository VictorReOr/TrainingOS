import { useEffect } from 'react';
import { getLogs, USE_SHEETS } from '../services/sheets';
import { mergeSessionLogs } from '../utils/mergeSessionLogs';

/**
 * Hook de sincronización en segundo plano (Remote Log Sync).
 *
 * Al montar la app o la vista correspondiente:
 * 1. Descarga silenciosamente los logs remotos del atleta desde Sheets (getLogs).
 * 2. Los combina de forma no bloqueante con los logs de localStorage usando mergeSessionLogs.
 * 3. Actualiza localStorage y emita el evento 'session_logs_updated' para reactivar los componentes.
 * 4. Si la red falla o está en modo offline, la app continúa con local-first sin interrumpir al usuario.
 */
export function useRemoteLogSync() {
  useEffect(() => {
    const syncLogs = async () => {
      const demoMode = localStorage.getItem('trainingos_demo_mode') === 'true';
      if (!USE_SHEETS || demoMode) return;

      try {
        const storedAuth = localStorage.getItem('trainingos_auth_user');
        const storedAthlete = localStorage.getItem('trainingos_athlete');
        const atletaId = (storedAuth ? JSON.parse(storedAuth).id : null) || (storedAthlete ? JSON.parse(storedAthlete).id : null);

        const res = await getLogs(atletaId);
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
      } catch (err) {
        console.warn('[RemoteLogSync] No se pudieron sincronizar logs remotos (modo offline activo):', err.message);
      }
    };

    syncLogs();
  }, []);
}
