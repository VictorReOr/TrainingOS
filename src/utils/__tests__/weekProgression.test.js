/**
 * Smoke test for weekProgression.js
 * Run with: node src/utils/__tests__/weekProgression.test.js
 *
 * Same style as the Performance Engine smoke.test.js — pure Node.js,
 * no test framework required.
 */

import {
  buildProgressionProposal,
  applyApprovedProgression,
  buildChainedMesocycleProposal,
} from '../weekProgression.js';

// ─── Test helpers ────────────────────────────────────────────────────────────

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

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeSession = (id, exercises) => ({
  id,
  name: `Session ${id}`,
  blocks: [{
    id: 'block-1',
    name: 'Block A',
    type: 'fuerza',
    exercises,
  }],
});

const sessionA = makeSession('sess-1', [
  { id: 'ex-bench', name: 'Press Banca', prescribedLoad: 80, series: 4, reps: '6' },
  { id: 'ex-squat', name: 'Sentadilla', prescribedLoad: 100, series: 4, reps: '5' },
  { id: 'ex-curl',  name: 'Curl Bíceps', prescribedLoad: 20, series: 3, reps: '12' },
]);

const sessionB = makeSession('sess-2', [
  { id: 'ex-press', name: 'Press Militar', prescribedLoad: 50, series: 4, reps: '6' },
  { id: 'ex-noload', name: 'Plancha', series: 3, reps: '45s' },  // no prescribedLoad
]);

const sourceWeek = [sessionA, sessionB];

// ─── Decisions fixtures ──────────────────────────────────────────────────────

const greenDecision = {
  trafficLight: { color: 'green', label: 'Subir carga', action: '+2.5kg', simpleMessage: '+2.5kg' },
  suggestedLoadDelta: 2.5,
  isStagnating: false,
  reasoning: 'Todas las series dentro del rango óptimo',
};

const redDecision = {
  trafficLight: { color: 'red', label: 'Reducir carga', action: '-2.5kg', simpleMessage: '-2.5kg' },
  suggestedLoadDelta: -5,
  isStagnating: false,
  reasoning: '3 series al fallo',
};

const stagnatingDecision = {
  trafficLight: { color: 'yellow', label: 'Mantener', action: 'Mismo peso', simpleMessage: 'Mantener' },
  suggestedLoadDelta: 0,
  isStagnating: true,
  reasoning: 'Estancamiento detectado',
};

console.log('\n=== WEEK PROGRESSION SMOKE TEST ===\n');

// ═════════════════════════════════════════════════════════════════════════════
// CASE 1: Green traffic light → delta +2.5kg applied correctly
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- CASE 1: Green semáforo → +2.5kg ---');
{
  const decisions = { 'ex-bench': greenDecision };
  const proposal = buildProgressionProposal(sourceWeek, decisions);

  const benchItem = proposal.find(p => p.exerciseId === 'ex-bench');
  assert('bench oldLoad is 80', benchItem.oldLoad === 80);
  assert('bench suggestedDelta is 2.5', benchItem.suggestedDelta === 2.5);
  assert('bench newLoad is 82.5', benchItem.newLoad === 82.5);
  assert('bench approvedLoad defaults to newLoad', benchItem.approvedLoad === 82.5);
  assert('bench trafficLight is green', benchItem.trafficLight === 'green');
  assert('bench isStagnating is false', benchItem.isStagnating === false);
}

// ═════════════════════════════════════════════════════════════════════════════
// CASE 2: Red traffic light → negative delta, newLoad never below 0
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- CASE 2: Red semáforo → delta negativo, floor at 0 ---');
{
  // Make a session with a very low load to test the floor
  const lowLoadSession = makeSession('sess-low', [
    { id: 'ex-low', name: 'Ejercicio Ligero', prescribedLoad: 3, series: 3, reps: '10' },
  ]);
  const decisions = {
    'ex-low': redDecision,           // suggestedLoadDelta = -5
    'ex-squat': redDecision,         // on squat too (100 - 5 = 95)
  };
  const proposal = buildProgressionProposal([lowLoadSession, sessionA], decisions);

  const lowItem = proposal.find(p => p.exerciseId === 'ex-low');
  assert('low exercise newLoad floored at 0', lowItem.newLoad === 0);
  assert('low exercise suggestedDelta is -5', lowItem.suggestedDelta === -5);

  const squatItem = proposal.find(p => p.exerciseId === 'ex-squat');
  assert('squat newLoad is 95 (100 - 5)', squatItem.newLoad === 95);
  assert('squat trafficLight is red', squatItem.trafficLight === 'red');
}

// ═════════════════════════════════════════════════════════════════════════════
// CASE 3: Exercise without exerciseDecisions → fallback yellow / delta 0
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- CASE 3: Sin decisions → fallback seguro ---');
{
  const proposal = buildProgressionProposal(sourceWeek, {}); // empty decisions

  const benchItem = proposal.find(p => p.exerciseId === 'ex-bench');
  assert('bench with no decision: trafficLight is yellow', benchItem.trafficLight === 'yellow');
  assert('bench with no decision: suggestedDelta is 0', benchItem.suggestedDelta === 0);
  assert('bench with no decision: newLoad equals oldLoad', benchItem.newLoad === 80);
  assert('bench with no decision: reasoning fallback', benchItem.reasoning === 'Sin historial suficiente');

  const noloadItem = proposal.find(p => p.exerciseId === 'ex-noload');
  assert('exercise without prescribedLoad: oldLoad is null', noloadItem.oldLoad === null);
  assert('exercise without prescribedLoad: newLoad is null', noloadItem.newLoad === null);
}

// ═════════════════════════════════════════════════════════════════════════════
// CASE 4: isStagnating: true → flag propagated for UI warning
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- CASE 4: isStagnating propagado ---');
{
  const decisions = { 'ex-curl': stagnatingDecision };
  const proposal = buildProgressionProposal(sourceWeek, decisions);

  const curlItem = proposal.find(p => p.exerciseId === 'ex-curl');
  assert('stagnating flag is true', curlItem.isStagnating === true);
  assert('stagnating trafficLight is yellow', curlItem.trafficLight === 'yellow');
  assert('stagnating reasoning propagated', curlItem.reasoning === 'Estancamiento detectado');
}

// ═════════════════════════════════════════════════════════════════════════════
// CASE 5: applyApprovedProgression creates new templates with updated loads
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- CASE 5: applyApprovedProgression ---');
{
  const approvedItems = [
    { exerciseId: 'ex-bench', approvedLoad: 85 },
    { exerciseId: 'ex-squat', approvedLoad: 105 },
  ];
  const newTemplates = applyApprovedProgression(sourceWeek, approvedItems);

  assert('produces same number of sessions', newTemplates.length === sourceWeek.length);
  assert('new session has no id (will be regenerated)', newTemplates[0].id === undefined);

  const benchEx = newTemplates[0].blocks[0].exercises[0];
  assert('bench prescribedLoad updated to 85', benchEx.prescribedLoad === 85);

  const curlEx = newTemplates[0].blocks[0].exercises[2];
  assert('curl prescribedLoad unchanged (not in approved)', curlEx.prescribedLoad === 20);
}

// ═════════════════════════════════════════════════════════════════════════════
// CASE 6: Chained mesocycle proposal accumulates progression & preserves metadata
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- CASE 6: buildChainedMesocycleProposal ---');
{
  const singleSession = {
    ...makeSession('sess-chain', [
      { id: 'ex-chain', name: 'Ejercicio Cadena', prescribedLoad: 60, series: 4, reps: '6' },
    ]),
    _dayIndex: 2,
    _dayKey: 'miercoles',
  };
  const decisions = { 'ex-chain': greenDecision }; // +2.5 each week

  const weekProposals = buildChainedMesocycleProposal([singleSession], decisions, 3);

  assert('3 weeks of proposals generated', weekProposals.length === 3);

  const week1 = weekProposals[0].find(p => p.exerciseId === 'ex-chain');
  const week2 = weekProposals[1].find(p => p.exerciseId === 'ex-chain');
  const week3 = weekProposals[2].find(p => p.exerciseId === 'ex-chain');

  assert('week 1 oldLoad is 60', week1.oldLoad === 60);
  assert('week 1 newLoad is 62.5', week1.newLoad === 62.5);
  assert('week 2 oldLoad is 62.5 (chained from week 1)', week2.oldLoad === 62.5);
  assert('week 2 newLoad is 65', week2.newLoad === 65);
  assert('week 3 oldLoad is 65 (chained from week 2)', week3.oldLoad === 65);
  assert('week 3 newLoad is 67.5', week3.newLoad === 67.5);

  // Verify _dayIndex preservation across progressive applications
  const step1Templates = applyApprovedProgression([singleSession], weekProposals[0]);
  const step2Templates = applyApprovedProgression(step1Templates, weekProposals[1]);
  assert('step1 preserves _dayIndex', step1Templates[0]._dayIndex === 2);
  assert('step2 preserves _dayIndex', step2Templates[0]._dayIndex === 2);
}

// ═════════════════════════════════════════════════════════════════════════════
// CASE 7: Edge — null/undefined inputs don't crash
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- CASE 7: Edge cases ---');
{
  assert('null sourceWeek returns []', buildProgressionProposal(null, {}).length === 0);
  assert('undefined decisions returns valid proposal', buildProgressionProposal(sourceWeek, undefined).length > 0);
  assert('applyApprovedProgression with null returns []', applyApprovedProgression(null, []).length === 0);
  assert('chained with 0 weeks returns []', buildChainedMesocycleProposal(sourceWeek, {}, 0).length === 0);
}

// ═════════════════════════════════════════════════════════════════════════════
// RESULTS
// ═════════════════════════════════════════════════════════════════════════════
console.log(`\n${'═'.repeat(50)}`);
if (failed > 0) {
  console.log(`❌ ${failed} assertions failed, ${passed} passed.`);
  process.exit(1);
} else {
  console.log(`✅ All ${passed} assertions passed.`);
}
