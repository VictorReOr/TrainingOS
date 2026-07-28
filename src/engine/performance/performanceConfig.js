export const PERFORMANCE_CONFIG = {
  version: '1.0.0',

  // ═══════════════════════════════════
  // ÍNDICE DE FATIGA (IFS)
  // ═══════════════════════════════════
  fatigue: {
    window: 7,
    weights: {
      systemicCost: 0.35,
      volume: 0.30,
      intensity: 0.20,
      frequency: 0.15
    },
    decayHalfLifeHours: 48,
    thresholds: {
      low: 30,
      moderate: 60,
      high: 80,
      critical: 90
    },
    exerciseCosts: {
      squat: 10, deadlift: 10, front_squat: 9,
      bench_press: 8, overhead_press: 7, row: 7,
      pull_up: 6, lunge: 6, hip_thrust: 7,
      curl: 3, tricep: 3, lateral_raise: 2,
      plank: 2, crunch: 2
    },
    defaultExerciseCost: 5
  },

  // ═══════════════════════════════════
  // ÍNDICE DE RECUPERACIÓN (IR)
  // ═══════════════════════════════════
  recovery: {
    weights: {
      sleep: 0.30,
      stress: 0.20,
      energy: 0.25,
      muscleSoreness: 0.15,
      daysSinceLastSession: 0.10
    },
    idealRestDays: 1,
    maxRestDaysPenalty: 4,
    bodyWeightDelta: {
      alertThresholdKg: 1.5,
      direction: 'loss'
    },
    thresholds: {
      poor: 0.4,
      moderate: 0.6,
      good: 0.75,
      excellent: 0.9
    }
  },

  // ═══════════════════════════════════
  // ÍNDICE DE ESTÍMULO MUSCULAR (IEM)
  // ═══════════════════════════════════
  stimulus: {
    effectiveSetRIR: 2,
    effectiveSetRPE: 7,
    minTechnicalQuality: 3,
    weeklyTargets: {
      push_horizontal: { min: 10, max: 20 },
      push_vertical:   { min: 8,  max: 16 },
      pull_horizontal: { min: 10, max: 20 },
      pull_vertical:   { min: 8,  max: 16 },
      knee_dominant:   { min: 10, max: 20 },
      hip_dominant:    { min: 10, max: 20 },
      core:            { min: 6,  max: 12 },
      rotation:        { min: 4,  max: 8  },
      anti_rotation:   { min: 4,  max: 8  },
      unilateral:      { min: 4,  max: 8  }
    }
  },

  // ═══════════════════════════════════
  // ÍNDICE DE PROGRESIÓN (IP)
  // ═══════════════════════════════════
  progression: {
    lookbackSessions: 3,
    loadIncrementKg: 2.5,
    acceleratedIncrementKg: 5.0,
    plateRounding: 1.25,
    trafficLight: {
      green: {
        minRIR: 2,
        minVelocity: 'medium',
        minTechnicalQuality: 4,
        minRecoveryIndex: 0.7,
        action: '+2.5kg próxima sesión'
      },
      yellow: {
        action: 'Mismo peso, mismas series'
      },
      red: {
        maxRIR: 0,
        maxSlowSets: 2,
        maxTechnicalQuality: 2,
        maxRecoveryIndex: 0.4,
        maxFatigueIndex: 80,
        action: '-2.5kg o reducir volumen'
      }
    },
    stagnation: {
      sessionsToDetect: 4,
      actions: [
        'Cambiar variante del ejercicio',
        'Modificar esquema de repeticiones',
        'Ajustar volumen semanal',
        'Considerar descarga programada'
      ]
    }
  },

  // ═══════════════════════════════════
  // EQUILIBRIO DE PATRONES (IPB)
  // ═══════════════════════════════════
  patternBalance: {
    patterns: [
      'push_horizontal', 'push_vertical',
      'pull_horizontal', 'pull_vertical',
      'knee_dominant', 'hip_dominant',
      'rotation', 'anti_rotation',
      'unilateral', 'core'
    ],
    ratios: {
      push_to_pull: {
        ideal: 1.0, alertThreshold: 1.2
      },
      knee_to_hip: {
        ideal: 1.0, alertThreshold: 1.3
      },
      bilateral_to_unilateral: {
        ideal: 3.0, alertThreshold: 5.0
      }
    },
    windowWeeks: 4
  },

  // ═══════════════════════════════════
  // TRANSFERENCIA DEPORTIVA (ITD)
  // ═══════════════════════════════════
  sportTransfer: {
    enabled: true,
    weights: {
      explosiveness: 0.35,
      unilateral: 0.25,
      mobility: 0.20,
      coreRotation: 0.20
    },
    pillarTargets: {
      explosiveness: 12,
      unilateral: 8,
      mobility: 6,
      coreRotation: 6
    },
    minTransferScore: 5,
    windowWeeks: 4,
    thresholds: {
      low: 35,
      moderate: 55,
      high: 75,
      optimal: 90
    }
  },

  // ═══════════════════════════════════
  // COLD START
  // ═══════════════════════════════════
  coldStart: {
    minSessionsForFullEngine: 5,
    partialEngineThreshold: 3,
    learningPhaseThreshold: 2,
    conservativeStartPct: 0.60,
    confidenceByPhase: {
      baseline: 0.2,
      learning: 0.4,
      partial: 0.6,
      full: 1.0
    },
    oneRMFormula: 'epley'
  },

  // ═══════════════════════════════════
  // INTENSIDAD: RIR prioritario sobre RPE
  // ═══════════════════════════════════
  rpeToRir: {
    10: 0, 9: 1, 8: 2, 7: 3, 6: 4
  },
  intensityPriority: 'rir',

  // ═══════════════════════════════════
  // TARGETS RPE POR MESOCICLO
  // ═══════════════════════════════════
  mesocycleTargets: {
    fuerza: {
      rpeByWeek: [
        { min: 7, max: 8, label: 'Acumulación' },
        { min: 7, max: 8, label: 'Acumulación' },
        { min: 8, max: 9, label: 'Intensificación' },
        { min: 5, max: 6, label: 'Descarga' }
      ]
    },
    hipertrofia: {
      rpeByWeek: [
        { min: 7,   max: 7.5, label: 'Base' },
        { min: 7,   max: 7.5, label: 'Progresión' },
        { min: 7,   max: 8,   label: 'Acumulación' },
        { min: 7.5, max: 8,   label: 'Acumulación+' },
        { min: 8,   max: 9,   label: 'Intensificación' },
        { min: 5,   max: 6,   label: 'Descarga' }
      ]
    },
    potencia: {
      rpeByWeek: [
        { min: 7, max: 8, label: 'Potencia base' },
        { min: 7, max: 8, label: 'Potencia máxima' },
        { min: 7, max: 8, label: 'Peaking' }
      ]
    },
    peaking: {
      rpeByWeek: [
        { min: 8, max: 9, label: 'Estimulación' },
        { min: 6, max: 7, label: 'Reducción' }
      ]
    },
    competicion: {
      rpeByWeek: [
        { min: 7, max: 8, label: 'Base física' },
        { min: 7, max: 8, label: 'Potencia' },
        { min: 8, max: 9, label: 'Simulación' },
        { min: 6, max: 7, label: 'Peaking' }
      ]
    },
    recuperacion: {
      rpeByWeek: [
        { min: 4, max: 5, label: 'Recuperación activa' }
      ]
    }
  },

  // ═══════════════════════════════════
  // COACH WORKFLOW
  // ═══════════════════════════════════
  coach: {
    approvalRequired: false,
    rejectionReasons: [
      'bad_day', 'not_progressing',
      'strategy_change', 'other'
    ]
  }
};
