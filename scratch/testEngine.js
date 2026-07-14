import { prescribeLoad, computeNextSession, lookupHelmsTable } from '../src/utils/overloadEngine.js';

console.log('Testing Helms lookup:');
console.log('Reps 5, RPE 9:', lookupHelmsTable(5, 9)); // Expect 0.892
console.log('Reps 5, RPE 8.75 (interpolate):', lookupHelmsTable(5, 8.75)); // Expect ~0.885
console.log('Reps 11 (interpolate), RPE 8:', lookupHelmsTable(11, 8)); // Expect ~0.776

console.log('\nTesting prescribeLoad:');
console.log('e1RM 100kg, Reps 8, RPE 8:', prescribeLoad({ e1RM: 100, targetReps: 8, rpeTarget: 8 }));

console.log('\nTesting computeNextSession:');
const history = [
  { e1RM: 100, load: 80, avgRPE: 8 },
  { e1RM: 100, load: 80, avgRPE: 8 },
  { e1RM: 100, load: 80, avgRPE: 8 }
];
console.log('Intermedio, lastLoad 80, lastRPE 8, target 8:', computeNextSession({
  lastLoad: 80,
  lastAvgRPE: 8,
  rpeTarget: 8,
  targetReps: 8,
  e1RM: 100,
  athleteLevel: 'intermedio',
  exerciseHistory: history
}));
