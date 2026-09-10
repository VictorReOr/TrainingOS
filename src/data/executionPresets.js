// ══════════════════════════════════════════════════════════════════════════════
// EXECUTION PRESETS — Datos de configuración por defecto por tipo de bloque
// TrainingOS · src/data/executionPresets.js
//
// Importa BLOCK_ROLE_CONFIG desde src/models/trainingBlock.js para no duplicar
// la lista de roles válidos por tipo de ejecución.
// ══════════════════════════════════════════════════════════════════════════════

import { BLOCK_ROLE_CONFIG } from '../models/trainingBlock.js';

/**
 * Configuración por defecto para cada tipo de ejecución de bloque.
 * Cada entrada define:
 *   - defaultRestPresetId : presetId a usar en RestProfileRef al crear el execution object
 *   - label               : nombre legible para mostrar en UI
 *   - preview             : descripción breve del comportamiento de ejecución
 *
 * @type {Record<string, { defaultRestPresetId: string, label: string, preview: string }>}
 */
export const EXECUTION_PRESET_DEFAULTS = {
  STRAIGHT_SET: {
    defaultRestPresetId: 'STRAIGHT_SET_DEFAULT',
    label: 'Serie Recta',
    preview: 'Ejercicio único, series independientes',
  },
  SUPERSET: {
    defaultRestPresetId: 'SUPERSET_STRENGTH',
    label: 'Superserie',
    preview: 'A → transición corta → B → descanso → repetir',
  },
  CONTRAST: {
    defaultRestPresetId: 'CONTRAST_STANDARD',
    label: 'Contraste',
    preview: 'Principal → 20s → Potenciador → 150s → repetir',
  },
  COMPLEX: {
    defaultRestPresetId: 'CONTRAST_STANDARD',
    label: 'Complejo',
    preview: 'Secuencia de potencia encadenada → descanso → repetir',
  },
  INTERVAL: {
    defaultRestPresetId: 'PLYOMETRIC',
    label: 'Intervalo',
    preview: 'Trabajo/descanso por tiempo × N rondas',
  },
};

// Re-exporta BLOCK_ROLE_CONFIG para conveniencia de quienes importen desde aquí
export { BLOCK_ROLE_CONFIG };
