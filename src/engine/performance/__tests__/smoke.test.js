/**
 * Smoke test for Performance Engine — Phase 2
 * Run with: node src/engine/performance/__tests__/smoke.test.js
 */

import { evaluate } from '../index.js';

// ─── Mock input: 1 session 2 days ago ───────────────────────────────────────
const mockInput = {
  athlete: {
    id: 'test-1',
    experience: 'intermediate',
    objective: 'hypertrophy',
    sport: 'both', // TKD active
    weeklyAvailability: 4,
    maxSessionDuration: 90
  },
  currentMesocycle: {
    type: 'hipertrofia',
    currentWeek: 2,
    totalWeeks: 6
  },
  exerciseHistory: [
    {
      exerciseId: 'lib-str-1',
      exerciseName: 'Sentadilla Trasera',
      pattern: 'knee_dominant',
      systemicCost: 9,
      sportTransfer: 7,
      sessions: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          sets: [
            { load: 100, reps: 5, rir: 2, rpe: 8, perceivedVelocity: 'medium', technicalQuality: 4, done: true },
            { load: 100, reps: 5, rir: 1, rpe: 9, perceivedVelocity: 'slow',   technicalQuality: 3, done: true },
            { load: 100, reps: 4, rir: 0, rpe: 10, perceivedVelocity: 'slow',  technicalQuality: 3, done: true }
          ]
        }
      ]
    }
  ],
  wellbeing: {
    sleep: 4,
    stress: 4,
    energy: 4,
    muscleSoreness: 4,
    bodyWeight: 80
  },
  sessionPlan: null
};

console.log('\n=== PERFORMANCE ENGINE SMOKE TEST ===\n');

const output = evaluate(mockInput);

console.log('=== WAVE 1 INDICES ===');
console.log('Fatigue:', output.indices.fatigue?.value, output.indices.fatigue?.label);
console.log('Recovery:', output.indices.recovery?.value, output.indices.recovery?.label);
console.log('Stimulus:', output.indices.stimulus?.value, output.indices.stimulus?.label);

console.log('\n=== WAVE 2 INDICES ===');
console.log('Progression:', 
  output.indices.progression?.value,
  output.indices.progression?.label);
console.log('PatternBalance:', 
  output.indices.patternBalance?.value,
  output.indices.patternBalance?.label);
console.log('SportTransfer:', 
  output.indices.sportTransfer?.value,
  output.indices.sportTransfer?.label);
console.log('Recommendations:', 
  output.recommendations.length,
  output.recommendations.map(r => 
    `[${r.priority}] ${r.type}`
  ).join(', '));
console.log('Exercise Decisions:', 
  Object.keys(output.exerciseDecisions).length,
  'exercises evaluated');
console.log('Global Traffic Light:', 
  output.globalTrafficLight.color,
  output.globalTrafficLight.simpleMessage);

// Basic Assertions to prevent regression issues during builds
let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

assert('output has timestamp',            typeof output.timestamp === 'string');
assert('output has indices',              output.indices !== null);
assert('output has globalTrafficLight',   output.globalTrafficLight !== null);
assert('output has meta',                 output.meta !== null);
assert('output is frozen',                Object.isFrozen(output));
assert('engine is Phase 2',               output.meta.phase === 2);
assert('recommendations is an array',     Array.isArray(output.recommendations));
assert('exerciseDecisions is an object',  typeof output.exerciseDecisions === 'object');

if (failed > 0) {
  console.log(`\n❌ ${failed} assertions failed during build checks.`);
  process.exit(1);
} else {
  console.log(`\n✅ Build verification assertions passed.`);
}

// ─── NUEVOS CASOS: ejercicios no-LOAD ────────────────────────────────────────
console.log('\n=== PROGRESSION MODEL: non-LOAD exercises ===\n');

// ─── Caso QUALITY: CMJ (lib-pow-6), progressionModel = 'QUALITY'
const mockQualityExercise = {
  exerciseId: 'lib-pow-6',
  exerciseName: 'CMJ',
  pattern: 'knee_dominant',
  systemicCost: 7,
  sportTransfer: 9,
  progressionModel: 'QUALITY',
  exerciseType: 'POWER',
  sessions: [
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sets: [
        { load: 0, reps: 5, rir: 3, rpe: 7, perceivedVelocity: 'fast', technicalQuality: 4, done: true },
        { load: 0, reps: 5, rir: 3, rpe: 7, perceivedVelocity: 'fast', technicalQuality: 4, done: true },
        { load: 0, reps: 5, rir: 2, rpe: 7, perceivedVelocity: 'medium', technicalQuality: 4, done: true }
      ]
    }
  ]
};

const cmjInput = {
  athlete: mockInput.athlete,
  currentMesocycle: mockInput.currentMesocycle,
  exerciseHistory: [mockQualityExercise],
  wellbeing: mockInput.wellbeing,
  sessionPlan: null
};
const cmjOutput = evaluate(cmjInput);
const cmjDecision = cmjOutput.exerciseDecisions['lib-pow-6'];

console.log('CMJ (QUALITY) decision:');
console.log('  trafficLight.color:', cmjDecision?.trafficLight?.color);
console.log('  suggestedLoadDelta:', cmjDecision?.suggestedLoadDelta);   // esperado: null
console.log('  suggestedActionType:', cmjDecision?.suggestedActionType); // esperado: 'quality'
console.log('  progressionModel:', cmjDecision?.progressionModel);       // esperado: 'QUALITY'
console.log('  simpleMessage:', cmjDecision?.trafficLight?.simpleMessage);

assert('CMJ: suggestedLoadDelta es null (no kg)',   cmjDecision?.suggestedLoadDelta === null);
assert('CMJ: suggestedActionType = quality',        cmjDecision?.suggestedActionType === 'quality');
assert('CMJ: progressionModel = QUALITY',           cmjDecision?.progressionModel === 'QUALITY');
assert('CMJ: simpleMessage no contiene "kg"',       !cmjDecision?.trafficLight?.simpleMessage?.includes('kg'));

// ─── Caso VOLUME: Plancha (lib-core-1), progressionModel = 'VOLUME'
const mockVolumeExercise = {
  exerciseId: 'lib-core-1',
  exerciseName: 'Plancha',
  pattern: 'core',
  systemicCost: 3,
  sportTransfer: 5,
  progressionModel: 'VOLUME',
  exerciseType: 'HYPERTROPHY',
  sessions: [
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sets: [
        { load: 0, reps: 1, rir: 3, rpe: 6, perceivedVelocity: 'medium', technicalQuality: 5, done: true },
        { load: 0, reps: 1, rir: 3, rpe: 6, perceivedVelocity: 'medium', technicalQuality: 5, done: true },
        { load: 0, reps: 1, rir: 2, rpe: 7, perceivedVelocity: 'medium', technicalQuality: 4, done: true }
      ]
    }
  ]
};

const planchaInput = {
  athlete: mockInput.athlete,
  currentMesocycle: mockInput.currentMesocycle,
  exerciseHistory: [mockVolumeExercise],
  wellbeing: mockInput.wellbeing,
  sessionPlan: null
};
const planchaOutput = evaluate(planchaInput);
const planchaDecision = planchaOutput.exerciseDecisions['lib-core-1'];

console.log('\nPlancha (VOLUME) decision:');
console.log('  trafficLight.color:', planchaDecision?.trafficLight?.color);
console.log('  suggestedLoadDelta:', planchaDecision?.suggestedLoadDelta);   // esperado: null
console.log('  suggestedActionType:', planchaDecision?.suggestedActionType); // esperado: 'volume'
console.log('  progressionModel:', planchaDecision?.progressionModel);       // esperado: 'VOLUME'
console.log('  simpleMessage:', planchaDecision?.trafficLight?.simpleMessage);

assert('Plancha: suggestedLoadDelta es null (no kg)',  planchaDecision?.suggestedLoadDelta === null);
assert('Plancha: suggestedActionType = volume',        planchaDecision?.suggestedActionType === 'volume');
assert('Plancha: progressionModel = VOLUME',           planchaDecision?.progressionModel === 'VOLUME');
assert('Plancha: simpleMessage no contiene "kg"',      !planchaDecision?.trafficLight?.simpleMessage?.includes('kg'));

// ─── Caso sessionIntent POWER vs null ───────────────────────────────────────
// Con el mockInput estándar (sport: 'both'), el engine genera 4 recomendaciones
// de sportTransfer, de las cuales 2 son priority 'medium'. Con sessionIntent='POWER',
// esas 2 deben ascender a 'high'. Con null, el orden y prioridades son idénticos al baseline.

console.log('\n=== SESSION INTENT: POWER vs NULL ===\n');

// Evaluar con sessionIntent='POWER'
const mockInputPower = {
  ...mockInput,
  sessionPlan: { sessionIntent: 'POWER', type: 'gym_potencia' }
};
const outputPower = evaluate(mockInputPower);
const recsPower = outputPower.recommendations;

// Evaluar con sessionIntent=null (baseline)
const mockInputNull = { ...mockInput, sessionPlan: null };
const outputNull = evaluate(mockInputNull);
const recsNull = outputNull.recommendations;

console.log('  POWER recs:', recsPower.map(r => `[${r.priority}] ${r.type} weakPillars=${!!r.data?.weakPillars}`).join(', '));
console.log('  NULL  recs:', recsNull.map(r => `[${r.priority}] ${r.type} weakPillars=${!!r.data?.weakPillars}`).join(', '));

// Con POWER, NO debe haber ninguna rec de transferencia (type=pattern+weakPillars) con priority='medium'
const powerHasMediumTransfer = recsPower.some(
  r => r.type === 'pattern' && r.data?.weakPillars && r.priority === 'medium'
);
// Con POWER, SÍ debe haber recs de transferencia que ascendieron a 'high'
const powerHasHighTransfer = recsPower.some(
  r => r.type === 'pattern' && r.data?.weakPillars && r.priority === 'high'
);
// Con null, SÍ debe haber al menos 1 rec de transferencia con priority='medium' (estado original)
const nullHasMediumTransfer = recsNull.some(
  r => r.type === 'pattern' && r.data?.weakPillars && r.priority === 'medium'
);

assert('SessionIntent POWER: ninguna rec de transferencia queda en medium',    !powerHasMediumTransfer);
assert('SessionIntent POWER: al menos 1 rec de transferencia asciende a high', powerHasHighTransfer);
assert('SessionIntent null: recs de transferencia conservan priority medium',   nullHasMediumTransfer);
assert('SessionIntent null: mismo total de recs que baseline',                  recsNull.length === output.recommendations.length);

// ─── PATTERN UNSPECIFIED: no debe afectar patternBalanceIndex ────────────────
console.log('\n=== PATTERN UNSPECIFIED: exclusion from patternBalanceIndex ===\n');

// Baseline: solo ejercicios con pattern conocido (igual al mockInput principal)
const baselinePatternInput = {
  ...mockInput,
  exerciseHistory: mockInput.exerciseHistory,
};
const baselineResult = evaluate(baselinePatternInput);
const baselineIPB = baselineResult.indices.patternBalance;

// Con 2 ejercicios 'unspecified' mezclados — deben ser completamente ignorados en IPB
const unspecifiedRecentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
const withUnspecifiedInput = {
  ...mockInput,
  exerciseHistory: [
    ...mockInput.exerciseHistory,
    {
      exerciseId:    'custom-unknown-drill',
      exerciseName:  'Unknown Drill',
      pattern:       'unspecified',
      systemicCost:  5,
      sportTransfer: 5,
      progressionModel: 'QUALITY',
      exerciseType:  'TECHNICAL',
      sessions: [{ date: unspecifiedRecentDate, sets: [
        { load: 0, reps: 10, rir: null, rpe: null, done: true },
        { load: 0, reps: 10, rir: null, rpe: null, done: true },
        { load: 0, reps: 10, rir: null, rpe: null, done: true },
      ]}]
    },
    {
      exerciseId:    'custom-agility-cone',
      exerciseName:  'Agility Cones',
      pattern:       'unspecified',
      systemicCost:  4,
      sportTransfer: 8,
      progressionModel: 'AGILITY',
      exerciseType:  'AGILITY',
      sessions: [{ date: unspecifiedRecentDate, sets: [
        { load: 0, reps: 5, rir: null, rpe: null, done: true },
        { load: 0, reps: 5, rir: null, rpe: null, done: true },
      ]}]
    },
  ]
};
const withUnspecifiedResult = evaluate(withUnspecifiedInput);
const unspecifiedIPB = withUnspecifiedResult.indices.patternBalance;

console.log('  Baseline  patternBalance.value :', baselineIPB.value, baselineIPB.label);
console.log('  +2 unspec patternBalance.value :', unspecifiedIPB.value, unspecifiedIPB.label);
console.log('  Baseline  seriesByPattern:', JSON.stringify(baselineIPB.inputs?.seriesByPattern));
console.log('  +2 unspec seriesByPattern:', JSON.stringify(unspecifiedIPB.inputs?.seriesByPattern));

assert(
  'Unspecified: seriesByPattern is identical with or without unspecified exercises',
  JSON.stringify(unspecifiedIPB.inputs?.seriesByPattern) ===
  JSON.stringify(baselineIPB.inputs?.seriesByPattern)
);
assert(
  'Unspecified: seriesByPattern does NOT contain "unspecified" key',
  unspecifiedIPB.inputs?.seriesByPattern?.['unspecified'] === undefined
);
assert(
  'Unspecified: alerts count unchanged (unspecified exercises do not trigger new imbalance alerts)',
  unspecifiedIPB.alerts.length === baselineIPB.alerts.length
);

// ─── Resumen final
console.log(`\n${ (failed > 0) ? '❌' : '✅' } Total: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
