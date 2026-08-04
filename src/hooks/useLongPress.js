import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * useLongPress — Detecta pulsación larga con Pointer Events.
 *
 * @param {object} options
 * @param {() => void}  options.onLongPress          Callback al completarse el timer
 * @param {number}      [options.threshold=2500]      Ms hasta activar long-press
 * @param {number}      [options.moveCancelThreshold=10] Px de movimiento máximo antes de cancelar
 *
 * @returns {{ handlers: object, progress: number, isActive: boolean }}
 *   - handlers   — spread sobre el elemento objetivo
 *   - progress   — valor 0→1 para animar la barra de progreso
 *   - isActive   — true mientras el timer está corriendo
 */
export function useLongPress({
  onLongPress,
  threshold = 2500,
  moveCancelThreshold = 10,
}) {
  const [progress, setProgress]   = useState(0);
  const [isActive, setIsActive]   = useState(false);

  // Refs para no recrear los handlers en cada render
  const timerRef     = useRef(null);
  const intervalRef  = useRef(null);
  const startPosRef  = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(null);

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    timerRef.current    = null;
    intervalRef.current = null;
    startTimeRef.current = null;
    setProgress(0);
    setIsActive(false);
  }, []);

  // Limpieza al desmontar
  useEffect(() => () => cancel(), [cancel]);

  const onPointerDown = useCallback((e) => {
    // Solo botón primario (izq. en ratón, toque en touch)
    if (e.button !== undefined && e.button !== 0) return;

    startPosRef.current  = { x: e.clientX, y: e.clientY };
    startTimeRef.current = Date.now();
    setIsActive(true);
    setProgress(0);

    // Capturar el puntero para no perder eventos si el dedo sale del elemento (Punto #6)
    if (e.pointerId !== undefined && e.currentTarget?.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        // Ignorar si el navegador no lo soporta en este estado
      }
    }

    // Intervalo de 50 ms para actualizar el progreso
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      setProgress(Math.min(elapsed / threshold, 1));
    }, 50);

    // Timer principal
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setProgress(1);
      setIsActive(false);
      onLongPress?.();
    }, threshold);
  }, [onLongPress, threshold]);

  const onPointerMove = useCallback((e) => {
    if (!timerRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > moveCancelThreshold) {
      cancel();
    }
  }, [cancel, moveCancelThreshold]);

  const onPointerUp = useCallback((e) => {
    if (e?.pointerId !== undefined && e.currentTarget?.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    cancel();
  }, [cancel]);

  const onPointerCancel = useCallback((e) => {
    if (e?.pointerId !== undefined && e.currentTarget?.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    cancel();
  }, [cancel]);

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    progress,
    isActive,
  };
}
