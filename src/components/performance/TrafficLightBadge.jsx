import React from 'react';

// ─── Colores por estado ─────────────────────────────────
const COLOR_MAP = {
  green:  { active: '#10B981', label: 'LISTO PARA ENTRENAR' },
  yellow: { active: '#F59E0B', label: 'ENTRENA SUAVE'       },
  red:    { active: '#EF4444', label: 'DESCANSO RECOMENDADO' },
};

const OFF = '#E5E5E5';       // Bloque apagado — gris sólido, opacidad 100%
const SEGMENTS_ON = { green: 3, yellow: 2, red: 1 };
const TOTAL_SEGMENTS = 3;

// ─── Dimensiones por tamaño ─────────────────────────────
const SIZE_CONFIG = {
  sm: { w: 16, h: 6,  gap: 2, radius: 1, direction: 'row'    },
  md: { w: 28, h: 8,  gap: 2, radius: 2, direction: 'row'    },
  lg: { w: 40, h: 10, gap: 3, radius: 2, direction: 'row'    },
};

/**
 * Indicador de 3 segmentos rectangulares tipo marcador electrónico deportivo.
 *
 * @param {'green'|'yellow'|'red'} color   Estado del semáforo
 * @param {string}                 label   Label personalizado (override)
 * @param {string}                 simpleMessage  Mensaje descriptivo debajo
 * @param {'sm'|'md'|'lg'}         size    Tamaño del indicador
 * @param {boolean}                showMessage  Mostrar simpleMessage
 */
export default function TrafficLightBadge({
  color = 'yellow',
  label = '',
  simpleMessage = '',
  size = 'md',
  showMessage = true,
}) {
  const cfg      = COLOR_MAP[color] ?? COLOR_MAP.yellow;
  const onCount  = SEGMENTS_ON[color] ?? 2;
  const sz       = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;
  const eyebrowLabel = label || cfg.label;

  const segments = Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
    <div
      key={i}
      style={{
        width: sz.w,
        height: sz.h,
        borderRadius: sz.radius,
        backgroundColor: i < onCount ? cfg.active : OFF,
        transition: 'background-color 150ms ease-out',
      }}
    />
  ));

  // ── SM: inline horizontal, label a la derecha ──
  if (size === 'sm') {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex items-center" style={{ gap: sz.gap }}>
          {segments}
        </span>
        <span className="text-eyebrow" style={{ color: cfg.active, fontSize: 10 }}>
          {eyebrowLabel}
        </span>
      </span>
    );
  }

  // ── LG: centrado vertical, label grande debajo ──
  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex items-center" style={{ gap: sz.gap }}>
          {segments}
        </div>
        <div className="text-center">
          <p className="text-eyebrow" style={{ color: cfg.active, fontSize: 13 }}>
            {eyebrowLabel}
          </p>
          {showMessage && simpleMessage && (
            <p className="text-meta mt-1.5">{simpleMessage}</p>
          )}
        </div>
      </div>
    );
  }

  // ── MD (default): horizontal, label a la derecha ──
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center mt-1" style={{ gap: sz.gap }}>
        {segments}
      </div>
      <div>
        <p className="text-eyebrow" style={{ color: cfg.active }}>
          {eyebrowLabel}
        </p>
        {showMessage && simpleMessage && (
          <p className="text-meta mt-0.5">{simpleMessage}</p>
        )}
      </div>
    </div>
  );
}
