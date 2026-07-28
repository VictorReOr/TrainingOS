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
    stress: 2,
    energy: 4,
    muscleSoreness: 3,
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
