import { evaluate } from '../src/engine/performance/index.js';

// Base mock values
const baseAthlete = {
  id: 'test-1',
  experience: 'intermediate',
  objective: 'hypertrophy',
  sport: 'both',
  weeklyAvailability: 4,
  maxSessionDuration: 90
};

const baseMesocycle = {
  type: 'hipertrofia',
  currentWeek: 2,
  totalWeeks: 6
};

// ==========================================
// CASO 1 — Sin bienestar (wellbeing: null)
// ==========================================
console.log('\n==========================================');
console.log('CASO 1 — Sin bienestar (wellbeing: null)');
console.log('==========================================');

const input1 = {
  athlete: { ...baseAthlete },
  currentMesocycle: { ...baseMesocycle },
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
            { load: 100, reps: 5, rir: 2, rpe: 8, perceivedVelocity: 'medium', technicalQuality: 4, done: true }
          ]
        }
      ]
    }
  ],
  wellbeing: null,
  sessionPlan: null
};

try {
  const output1 = evaluate(input1);
  console.log('Fatigue Value:', output1.indices.fatigue.value, `(${output1.indices.fatigue.label})`);
  console.log('Recovery Value (Raw & Clamped):', output1.indices.recovery.value, `(${output1.indices.recovery.label})`);
  console.log('Recovery raw normalized:', output1.indices.recovery.normalized);
  console.log('Stimulus Value:', output1.indices.stimulus.value, `(${output1.indices.stimulus.label})`);
  console.log('Traffic Light Color:', output1.globalTrafficLight.color);
  console.log('Cold Start:', output1.meta.coldStart);
  console.log('Data Completeness:', output1.meta.dataCompleteness);
} catch (err) {
  console.error('Error in CASO 1:', err);
}

// ==========================================
// CASO 2 — Sin historial (atleta nuevo)
// ==========================================
console.log('\n==========================================');
console.log('CASO 2 — Sin historial (atleta nuevo)');
console.log('==========================================');

const input2 = {
  athlete: { ...baseAthlete },
  currentMesocycle: { ...baseMesocycle },
  exerciseHistory: [],
  wellbeing: {
    sleep: 4,
    stress: 2,
    energy: 4,
    muscleSoreness: 2,
    bodyWeight: 80
  },
  sessionPlan: null
};

try {
  const output2 = evaluate(input2);
  console.log('Fatigue Value:', output2.indices.fatigue.value, `(${output2.indices.fatigue.label})`);
  console.log('Recovery Value (adjusted due to cold start):', output2.indices.recovery.value, `(${output2.indices.recovery.label})`);
  console.log('Recovery confidence:', output2.indices.recovery.confidence);
  console.log('Stimulus Value:', output2.indices.stimulus.value, `(${output2.indices.stimulus.label})`);
  console.log('Traffic Light Color:', output2.globalTrafficLight.color, `(${output2.globalTrafficLight.simpleMessage})`);
  console.log('Cold Start:', output2.meta.coldStart);
  console.log('Cold Start Progress:', output2.meta.coldStartProgress);
} catch (err) {
  console.error('Error in CASO 2:', err);
}

// ==========================================
// CASO 3 — Atleta muy fatigado
// ==========================================
console.log('\n==========================================');
console.log('CASO 3 — Atleta muy fatigado');
console.log('==========================================');

// Helper to construct past dates
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const input3 = {
  athlete: { ...baseAthlete },
  currentMesocycle: { ...baseMesocycle },
  exerciseHistory: [
    {
      exerciseId: 'lib-str-1',
      exerciseName: 'Sentadilla Trasera',
      pattern: 'knee_dominant',
      systemicCost: 10,
      sportTransfer: 7,
      sessions: [
        {
          date: daysAgo(0), // Today
          sets: [
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        },
        {
          date: daysAgo(1), // 1 day ago
          sets: [
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        },
        {
          date: daysAgo(2), // 2 days ago
          sets: [
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        },
        {
          date: daysAgo(3), // 3 days ago
          sets: [
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        },
        {
          date: daysAgo(4), // 4 days ago
          sets: [
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 100, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        }
      ]
    },
    {
      exerciseId: 'lib-str-2',
      exerciseName: 'Peso Muerto',
      pattern: 'hip_dominant',
      systemicCost: 10,
      sportTransfer: 6,
      sessions: [
        {
          date: daysAgo(0),
          sets: [
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        },
        {
          date: daysAgo(1),
          sets: [
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        },
        {
          date: daysAgo(2),
          sets: [
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        },
        {
          date: daysAgo(3),
          sets: [
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true }
          ]
        },
        {
          date: daysAgo(4),
          sets: [
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true },
            { load: 120, reps: 5, rir: 0, rpe: 10, done: true }
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

try {
  const output3 = evaluate(input3);
  console.log('Fatigue Value:', output3.indices.fatigue.value, `(${output3.indices.fatigue.label})`);
  console.log('Recovery Value:', output3.indices.recovery.value, `(${output3.indices.recovery.label})`);
  console.log('Traffic Light Color:', output3.globalTrafficLight.color, `(${output3.globalTrafficLight.simpleMessage})`);
  console.log('Cold Start:', output3.meta.coldStart);
  console.log('Cold Start Progress:', output3.meta.coldStartProgress);
} catch (err) {
  console.error('Error in CASO 3:', err);
}
console.log('\n==========================================\n');
