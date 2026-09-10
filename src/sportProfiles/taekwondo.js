/**
 * Sport Profile: Taekwondo
 *
 * Centraliza la configuración específica de TKD para el Sport Transfer Index:
 *  - pillarWeights: pesos de cada pilar en la fórmula ITD (= cfg.sportTransfer.weights actuales)
 *  - pillarTargets: targets de series efectivas por pilar (= cfg.sportTransfer.pillarTargets actuales)
 *  - patternWeights: multiplicadores por patrón de movimiento (dato estructural para Phase 5.3)
 *  - generateRecommendations: lógica de recomendaciones TKD (extraída de sportTransferIndex.js)
 *
 * El engine NO importa este archivo directamente — recibe el objeto perfil ya resuelto.
 */
export const TAEKWONDO_PROFILE = {
  id: 'taekwondo',
  name: 'Taekwondo',

  // Multiplicadores de relevancia por patrón de movimiento para TKD
  // (para uso futuro en Phase 5.3 — no activo en el cálculo actual del índice)
  patternWeights: {
    unilateral:      1.4,
    rotation:        1.3,
    hip_dominant:    1.2,
    knee_dominant:   1.0,
    push_horizontal: 0.8,
  },

  // Cualidades atléticas prioritarias para TKD
  priorityQualities: [
    'reactive_strength',
    'rfd',
    'unilateral_power',
    'rotational_core',
  ],

  // Pesos de cada pilar en la fórmula ITD ponderada
  // (anteriormente en PERFORMANCE_CONFIG.sportTransfer.weights)
  pillarWeights: {
    explosiveness: 0.35,
    unilateral:    0.25,
    mobility:      0.20,
    coreRotation:  0.20,
  },

  // Targets de series efectivas semanales por pilar
  // (anteriormente en PERFORMANCE_CONFIG.sportTransfer.pillarTargets)
  pillarTargets: {
    explosiveness: 12,
    unilateral:    8,
    mobility:      6,
    coreRotation:  6,
  },

  /**
   * Genera recomendaciones cualitativas por pilares débiles.
   * Lógica extraída de generateTKDRecommendations() en sportTransferIndex.js.
   *
   * @param {string[]} weakPillars  - Pilares con cobertura < 50%
   * @param {Object}   coverage     - { [pilar]: ratio (0–1.5) }
   * @returns {Array}               - Array de objetos { type, priority, action, reason }
   */
  generateRecommendations(weakPillars, coverage) {
    const recs = [];

    if (weakPillars.includes('unilateral')) {
      recs.push({
        type: 'pattern',
        priority: 'high',
        action: 'Añadir Split Jumps, Step-ups o Skater Jumps (trabajo unilateral)',
        reason: `El TKD requiere potencia y estabilidad sobre una pierna. ` +
          `Cobertura actual: ${Math.round(coverage.unilateral * 100)}%`,
      });
    }

    if (weakPillars.includes('coreRotation')) {
      recs.push({
        type: 'pattern',
        priority: 'high',
        action: 'Añadir Landmine Rotación o Pallof Press (core rotacional)',
        reason: `La transferencia de fuerza en patadas rotacionales requiere core ` +
          `rotacional fuerte. Cobertura: ${Math.round(coverage.coreRotation * 100)}%`,
      });
    }

    if (weakPillars.includes('explosiveness')) {
      recs.push({
        type: 'pattern',
        priority: 'medium',
        action: 'Añadir Pogos, Salidas Explosivas o Split Jumps (explosividad)',
        reason: `Cobertura explosividad: ${Math.round(coverage.explosiveness * 100)}%`,
      });
    }

    if (weakPillars.includes('mobility')) {
      recs.push({
        type: 'pattern',
        priority: 'medium',
        action: 'Añadir Leg Swings, Círculos de Cadera o Sentadilla Profunda (movilidad)',
        reason: `Cobertura movilidad: ${Math.round(coverage.mobility * 100)}%`,
      });
    }

    return recs;
  },
};
