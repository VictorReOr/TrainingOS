import { useState, useCallback } from 'react';

/**
 * useSheets — Hook genérico para encapsular el estado de red de llamadas a Sheets.
 *
 * Uso:
 *   const { loading, error, data, execute, reset } = useSheets();
 *   await execute(saveSession, sessionData);
 */
export function useSheets() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * Ejecuta una función del servicio de Sheets con manejo de estado y 1 reintento.
   * @param {Function} fn    — función importada de services/sheets.js
   * @param {...any}   args  — argumentos que se le pasan a fn
   * @returns {Promise<any>} — resultado de fn si tiene éxito, undefined si falla
   */
  const execute = useCallback(async (fn, ...args) => {
    setLoading(true);
    setError(null);

    const attempt = async () => fn(...args);

    try {
      const result = await attempt();
      setData(result);
      return result;
    } catch (firstErr) {
      // ── Reintento automático ────────────────────────────────────────────────
      console.warn('[useSheets] Primer intento fallido, reintentando...', firstErr.message);
      try {
        const result = await attempt();
        setData(result);
        return result;
      } catch (secondErr) {
        console.error('[useSheets] Segundo intento fallido:', secondErr.message);
        setError(secondErr.message || 'Error desconocido en la petición');
        return undefined;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, execute, reset };
}
