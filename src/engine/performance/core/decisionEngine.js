import { PERFORMANCE_CONFIG } from '../performanceConfig.js';

/**
 * Decision Engine
 * Genera recomendaciones explicables basadas
 * en todos los índices (Wave 1 + Wave 2)
 */
export function computeDecisions(
  input, indices, config = PERFORMANCE_CONFIG) {
  
  const recommendations = [];
  
  // 1. Recomendaciones de fatiga
  if (indices.fatigue.value > 
      config.fatigue.thresholds.critical) {
    recommendations.push({
      id: `rec-fatigue-${Date.now()}`,
      type: 'deload',
      priority: 'critical',
      exerciseId: null,
      action: 'Semana de descarga reactiva',
      reason: `Fatiga sistémica crítica ` +
        `(${indices.fatigue.value}/100). ` +
        `Reduce volumen un 40-50% esta semana.`,
      confidence: 0.9,
      data: { 
        fatigueValue: indices.fatigue.value 
      }
    });
  } else if (indices.fatigue.value > 
             config.fatigue.thresholds.high) {
    recommendations.push({
      id: `rec-fatigue-high-${Date.now()}`,
      type: 'volume',
      priority: 'high',
      exerciseId: null,
      action: 'Reducir volumen esta semana',
      reason: `Fatiga elevada ` +
        `(${indices.fatigue.value}/100). ` +
        `Elimina 1-2 series de cada ejercicio.`,
      confidence: 0.8,
      data: { 
        fatigueValue: indices.fatigue.value 
      }
    });
  }
  
  // 2. Recomendaciones de recuperación
  if (indices.recovery.normalized < 
      config.progression.trafficLight
        .red.maxRecoveryIndex) {
    recommendations.push({
      id: `rec-recovery-${Date.now()}`,
      type: 'recovery',
      priority: 'high',
      exerciseId: null,
      action: 'Priorizar recuperación hoy',
      reason: indices.recovery.detail,
      confidence: 0.85,
      data: { 
        recoveryValue: indices.recovery.value 
      }
    });
  }
  
  // 3. Recomendaciones de estímulo muscular
  if (indices.stimulus.value < 40) {
    const detail = indices.stimulus.detail;
    recommendations.push({
      id: `rec-stimulus-${Date.now()}`,
      type: 'volume',
      priority: 'medium',
      exerciseId: null,
      action: 'Aumentar volumen de entrenamiento',
      reason: `Estímulo muscular insuficiente ` +
        `(${indices.stimulus.value}/100). ` +
        `Algunos patrones sin series efectivas: ` +
        `${detail}`,
      confidence: 0.75,
      data: { 
        stimulusValue: indices.stimulus.value 
      }
    });
  }
  
  // 4. Recomendaciones de progresión por ejercicio
  if (indices.progression) {
    for (const [exId, decision] of 
         Object.entries(
           indices.progression.exerciseDecisions
         )) {
      
      if (decision.isStagnating) {
        recommendations.push({
          id: `rec-stagnation-${exId}-${Date.now()}`,
          type: 'pattern',
          priority: 'high',
          exerciseId: exId,
          action: config.progression.stagnation
            .actions[0],
          reason: `Estancamiento detectado en ` +
            `${exId}. Sin progresión en las ` +
            `últimas ${config.progression
              .stagnation.sessionsToDetect} sesiones.`,
          confidence: 0.8,
          data: { exerciseId: exId }
        });
      }
    }
  }
  
  // 5. Recomendaciones de equilibrio de patrones
  if (indices.patternBalance?.alerts?.length > 0) {
    for (const alert of 
         indices.patternBalance.alerts) {
      recommendations.push({
        id: `rec-pattern-${alert.ratio}-${Date.now()}`,
        type: 'pattern',
        priority: alert.priority,
        exerciseId: null,
        action: alert.action,
        reason: alert.reason,
        confidence: 0.85,
        data: { ratio: alert.ratio }
      });
    }
  }
  
  // 6. Recomendaciones de transferencia TKD
  if (indices.sportTransfer?.recommendations) {
    for (const rec of 
         indices.sportTransfer.recommendations) {
      recommendations.push({
        id: `rec-tkd-${Date.now()}-${Math.random()}`,
        type: rec.type,
        priority: rec.priority,
        exerciseId: null,
        action: rec.action,
        reason: rec.reason,
        confidence: 0.8,
        data: { 
          weakPillars: 
            indices.sportTransfer.weakPillars 
        }
      });
    }
  }
  
  // Ordenar por prioridad
  const priorityOrder = {
    critical: 0, high: 1, 
    medium: 2, low: 3
  };
  recommendations.sort((a,b) => 
    (priorityOrder[a.priority] ?? 3) - 
    (priorityOrder[b.priority] ?? 3)
  );
  
  // Semáforo global completo
  const globalTrafficLight = 
    computeGlobalTrafficLight(indices, config);
  
  // Decisiones por ejercicio (para SetLoggerSheet)
  const exerciseDecisions = buildExerciseDecisions(
    indices, input
  );
  
  return { 
    recommendations, 
    globalTrafficLight,
    exerciseDecisions
  };
}

function computeGlobalTrafficLight(
  indices, config) {
  
  const fatigueCritical = indices.fatigue.value > 
    config.fatigue.thresholds.critical;
  const fatigueHigh = indices.fatigue.value > 
    config.fatigue.thresholds.high;
  const recoveryLow = indices.recovery.normalized < 
    config.progression.trafficLight
      .red.maxRecoveryIndex;
  const recoveryModerate = 
    indices.recovery.normalized < 
    config.progression.trafficLight
      .green.minRecoveryIndex;
  
  // Semáforo global basado en Wave 1 + Wave 2
  if (fatigueCritical || recoveryLow) {
    return {
      color: 'red',
      label: 'Descanso recomendado',
      action: 'Sesión de recuperación activa ' +
        'o descanso completo',
      simpleMessage: 
        'Tu cuerpo necesita recuperarse hoy'
    };
  }
  
  if (fatigueHigh || recoveryModerate || 
      (indices.progression && 
       indices.progression.value < 40)) {
    return {
      color: 'yellow',
      label: 'Entrenar con moderación',
      action: 'Sesión técnica o ligera. ' +
        'Evita cargas máximas.',
      simpleMessage: 'Entrena suave hoy'
    };
  }
  
  return {
    color: 'green',
    label: 'Listo para entrenar',
    action: 'Puedes entrenar a plena intensidad',
    simpleMessage: 
      'Hoy puedes entrenar fuerte 💪'
  };
}

function buildExerciseDecisions(indices, input) {
  if (!indices.progression) return {};
  
  const decisions = {};
  
  for (const [exId, decision] of 
       Object.entries(
         indices.progression.exerciseDecisions
       )) {
    decisions[exId] = {
      trafficLight: decision.trafficLight,
      suggestedLoadDelta: 
        decision.suggestedLoadDelta,
      isStagnating: decision.isStagnating,
      reasoning: decision.reasoning
    };
  }
  
  return decisions;
}
