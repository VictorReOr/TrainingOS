import { useState, useEffect, useCallback, useRef } from 'react';
import { getLogs, USE_SHEETS, getAtletaId } from '../services/sheets.js';
import { mergeSessionLogs } from '../utils/mergeSessionLogs.js';

export const SYNC_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos
export const LS_LAST_LOG_SYNC = 'trainingos_last_log_sync';
export const LS_SESSION_LOGS = 'trainingos_session_logs';

/**
 * Hook de sincronización en segundo plano con control estricto de carga a la BD.
 *
 * Salvaguardas aplicadas:
 * 1. Cooldown de 10 min: no realiza peticiones si ya se sincronizó recientemente.
 * 2. Ventana deslizante (45 días): evita descargar historial masivo si ya existen datos locales.
 * 3. Verificación de atleta: aborta inmediatamente sin tocar la red si no hay atleta logueado.
 * 4. Local-First: nunca bloquea la interfaz de usuario.
 */
export function useRemoteLogSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => {
    const raw = localStorage.getItem(LS_LAST_LOG_SYNC);
    return raw ? parseInt(raw, 10) : null;
  });

  const isSyncingRef = useRef(false);

  const syncLogs = useCallback(async (force = false) => {
    const isDemo = localStorage.getItem('trainingos_demo_mode') !== null
      ? localStorage.getItem('trainingos_demo_mode') === 'true'
      : import.meta.env.VITE_USE_MOCK === 'true';

    if (!USE_SHEETS || isDemo) return { success: false, reason: 'offline_or_demo' };
    if (isSyncingRef.current) return { success: false, reason: 'already_syncing' };

    // 1. Verificación de Cooldown (a menos que se fuerce explícitamente)
    const rawLast = localStorage.getItem(LS_LAST_LOG_SYNC);
    const lastTime = rawLast ? parseInt(rawLast, 10) : 0;
    const now = Date.now();

    if (!force && lastTime && (now - lastTime < SYNC_COOLDOWN_MS)) {
      const remainingMin = Math.ceil((SYNC_COOLDOWN_MS - (now - lastTime)) / 60000);
      console.log(`[RemoteLogSync] Cooldown activo (${remainingMin}m restantes). Omitiendo petición a la BD.`);
      return { success: true, reason: 'cooldown_active' };
    }

    // 2. Obtención segura del ID del atleta
    let atletaId = getAtletaId();
    if (!atletaId) {
      try {
        const storedAuth = localStorage.getItem('trainingos_auth_user');
        const storedAthlete = localStorage.getItem('trainingos_athlete');
        atletaId = (storedAuth ? JSON.parse(storedAuth).id : null) || (storedAthlete ? JSON.parse(storedAthlete).id : null);
      } catch (_) {}
    }

    if (!atletaId) {
      console.log('[RemoteLogSync] No hay atleta identificado. Omitiendo sincronización remota.');
      return { success: false, reason: 'no_athlete' };
    }

    // 3. Ventana temporal optimizada (si ya hay datos locales, no pedir histórico de años)
    const rawLocal = localStorage.getItem(LS_SESSION_LOGS);
    const localLogs = rawLocal ? JSON.parse(rawLocal) : [];
    const dateRange = {};

    if (localLogs.length > 0 && !force) {
      // Pedir sólo los últimos 45 días para mantener la sincronización ligera
      const cutoff = new Date(now - 45 * 24 * 60 * 60 * 1000);
      dateRange.fechaDesde = cutoff.toISOString().split('T')[0];
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      console.log(`[RemoteLogSync] Sincronizando logs para atleta "${atletaId}" (force: ${force})...`);
      const res = await getLogs(atletaId, dateRange);

      if (res && res.rows && Array.isArray(res.rows)) {
        if (res.rows.length > 0) {
          const merged = mergeSessionLogs(localLogs, res.rows);
          if (merged.length > 0) {
            localStorage.setItem(LS_SESSION_LOGS, JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('session_logs_updated', { detail: { count: merged.length } }));
            console.log(`[RemoteLogSync] Sincronización completada con éxito: ${merged.length} sesiones consolidadas.`);
          }
        }
      }

      // Actualizar timestamp de última sincronización
      localStorage.setItem(LS_LAST_LOG_SYNC, String(now));
      setLastSyncedAt(now);
      return { success: true, count: res?.rows?.length || 0 };
    } catch (err) {
      console.warn('[RemoteLogSync] Error no bloqueante al sincronizar logs remotos:', err.message);
      return { success: false, error: err.message };
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  // Sincronización al montar
  useEffect(() => {
    syncLogs(false);

    // Escuchar eventos globales que soliciten sincronización
    const handleTrigger = (e) => {
      const force = !!e?.detail?.force;
      syncLogs(force);
    };

    window.addEventListener('trigger_remote_log_sync', handleTrigger);
    return () => window.removeEventListener('trigger_remote_log_sync', handleTrigger);
  }, [syncLogs]);

  return {
    syncNow: () => syncLogs(true),
    isSyncing,
    lastSyncedAt,
  };
}
