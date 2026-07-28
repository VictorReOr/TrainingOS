import { PERFORMANCE_CONFIG } from '../performanceConfig.js';
import { validateAndNormalize } from '../utils/validators.js';
import { computeFatigueIndex } from '../indices/fatigueIndex.js';
import { computeRecoveryIndex } from '../indices/recoveryIndex.js';
import { computeStimulusIndex } from '../indices/stimulusIndex.js';
import { computeProgressionIndex } from '../indices/progressionIndex.js';
import { computePatternBalanceIndex } from '../indices/patternBalanceIndex.js';
import { computeSportTransferIndex } from '../indices/sportTransferIndex.js';
import { computeDecisions } from './decisionEngine.js';

export function evaluate(
  input, config = PERFORMANCE_CONFIG) {
  
  // 1. Validar y normalizar
  const validated = validateAndNormalize(input);
  
  // 2. Cold start
  const sessionCount = countUniqueSessions(
    validated.exerciseHistory
  );
  const isColdStart = sessionCount < 
    config.coldStart.minSessionsForFullEngine;
  const confidenceMultiplier = 
    getConfidenceMultiplier(
      sessionCount, config.coldStart
    );
  
  // 3. OLEADA 1 — independientes
  const fatigue  = computeFatigueIndex(
    validated, config
  );
  const recovery = computeRecoveryIndex(
    validated, config
  );
  const stimulus = computeStimulusIndex(
    validated, config
  );
  
  const wave1 = { fatigue, recovery, stimulus };
  
  // 4. OLEADA 2 — dependientes de wave1
  const progression = computeProgressionIndex(
    validated, config, wave1
  );
  const patternBalance = computePatternBalanceIndex(
    validated, config, wave1
  );
  const sportTransfer = 
    validated.athlete.sport === 'gym'
      ? null
      : computeSportTransferIndex(
          validated, config, wave1
        );
  
  const indices = {
    fatigue:        applyConfidence(fatigue, confidenceMultiplier),
    recovery:       applyConfidence(recovery, confidenceMultiplier),
    stimulus:       applyConfidence(stimulus, confidenceMultiplier),
    progression:    applyConfidence(progression, confidenceMultiplier),
    patternBalance: applyConfidence(patternBalance, confidenceMultiplier),
    sportTransfer:  sportTransfer 
      ? applyConfidence(sportTransfer, confidenceMultiplier)
      : null
  };
  
  // 5. Decision Engine
  const { 
    recommendations, 
    globalTrafficLight,
    exerciseDecisions 
  } = computeDecisions(validated, indices, config);
  
  // 6. Output inmutable
  return Object.freeze({
    timestamp: new Date().toISOString(),
    indices,
    recommendations,
    exerciseDecisions,
    sessionAdjustments: null, // Fase 3
    globalTrafficLight,
    meta: {
      engineVersion: config.version,
      dataCompleteness: validated._dataCompleteness,
      coldStart: isColdStart,
      coldStartProgress: Math.min(
        sessionCount,
        config.coldStart.minSessionsForFullEngine
      ),
      engineEnabled: true,
      phase: 2
    }
  });
}

function countUniqueSessions(history) {
  const dates = new Set();
  for (const exercise of history) {
    for (const session of exercise.sessions) {
      const dateOnly = new Date(session.date)
        .toISOString()
        .split('T')[0];
      dates.add(dateOnly);
    }
  }
  return dates.size;
}

function getConfidenceMultiplier(
  sessions, coldStartConfig) {
  const { 
    minSessionsForFullEngine,
    partialEngineThreshold,
    learningPhaseThreshold,
    confidenceByPhase 
  } = coldStartConfig;
  
  if (sessions >= minSessionsForFullEngine) 
    return confidenceByPhase.full;
  if (sessions >= partialEngineThreshold) 
    return confidenceByPhase.partial;
  if (sessions >= learningPhaseThreshold) 
    return confidenceByPhase.learning;
  return confidenceByPhase.baseline;
}

function applyConfidence(indexResult, multiplier) {
  if (!indexResult) return null;
  return {
    ...indexResult,
    confidence: multiplier,
    value: multiplier < 1
      ? Math.round(
          indexResult.value * multiplier + 
          50 * (1 - multiplier)
        )
      : indexResult.value
  };
}
