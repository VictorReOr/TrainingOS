import { EXERCISE_LIBRARY } from '../../../data/exerciseLibrary.js';
import { getExerciseMetadata } from '../../../data/exerciseMetadata.js';

/**
 * buildPerformanceInput
 *
 * Converts raw data from React contexts into the
 * validated PerformanceInput DTO expected by evaluate().
 *
 * NOTE: Field names here match the REAL ReadinessContext shape:
 *   - todayCheckIn.fecha  (not .date)
 *   - todayCheckIn.doms   (muscle soreness)
 *   - todayCheckIn.sleep, .stress, .fatigue
 *   - latestWeight comes from bodyMetrics[0].peso
 *   - sessionLogs use .fecha, .ejercicios[], .seriesLog[]
 */
export function buildPerformanceInput({
  athlete,
  activeMesocycle,
  prs,
  getPRHistory,
  sessionLogs,
  todayCheckIn,
  wellnessLogs,
  latestWeight
}) {
  return {
    athlete:         mapAthlete(athlete),
    currentMesocycle: mapMesocycle(activeMesocycle),
    exerciseHistory: buildExerciseHistory(sessionLogs),
    wellbeing:       mapWellbeing(todayCheckIn, latestWeight),
    sessionPlan:     null
  };
}

// ─────────────────────────────────────────
// Athlete mapping
// ─────────────────────────────────────────

function mapAthlete(a) {
  if (!a) {
    return {
      id: 'unknown',
      experience: 'intermediate',
      objective: 'hypertrophy',
      sport: 'gym',
      weeklyAvailability: 4,
      maxSessionDuration: 90
    };
  }

  // Map AthleteContext.activeSport → engine sport enum
  const sportMap = {
    gym:        'gym',
    tkd:        'tkd',
    taekwondo:  'tkd',
    all:        'both',
    both:       'both'
  };

  return {
    id:                  a.id ?? 'unknown',
    age:                 a.age ?? null,
    weight:              a.weight ?? null,
    height:              a.height ?? null,
    experience:          a.level ?? 'intermediate',
    objective:           a.objective ?? 'hypertrophy',
    sport:               sportMap[a.activeSport] ?? 'gym',
    weeklyAvailability:  a.weeklyAvailability ?? 4,
    maxSessionDuration:  a.maxSessionDuration ?? 90
  };
}

// ─────────────────────────────────────────
// Mesocycle mapping
// ─────────────────────────────────────────

function mapMesocycle(meso) {
  if (!meso) return null;

  const startDate  = new Date(meso.startDate);
  const today      = new Date();
  const diffDays   = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.max(1, Math.floor(diffDays / 7) + 1);

  return {
    type:         meso.type,
    currentWeek:  Math.min(currentWeek, meso.weeks),
    totalWeeks:   meso.weeks
  };
}

// ─────────────────────────────────────────
// Exercise history mapping
// ─────────────────────────────────────────

/**
 * Groups session logs by exercise and maps sets to engine format.
 *
 * Real sessionLog shape (from SessionContext / localStorage):
 *   {
 *     fecha: ISO string,
 *     ejercicios: [
 *       {
 *         id: string,
 *         nombre: string,
 *         seriesLog: [
 *           { carga, reps, rir, done, velocidad?, calidadTecnica? }
 *         ]
 *       }
 *     ]
 *   }
 */
function buildExerciseHistory(sessionLogs) {
  if (!sessionLogs || sessionLogs.length === 0) return [];

  const byExercise = {};

  for (const log of sessionLogs) {
    if (!log.ejercicios) continue;

    for (const ejercicio of log.ejercicios) {
      const exId = ejercicio.id ?? ejercicio.nombre;
      if (!exId) continue;

      if (!byExercise[exId]) {
        // Resolve metadata from library (has pattern, systemicCost, sportTransfer)
        const libEx = EXERCISE_LIBRARY.find(
          e => e.id === exId || e.name === ejercicio.nombre
        );
        const metadata = libEx
          ? getExerciseMetadata(libEx)
          : {
              pattern:       'knee_dominant',
              systemicCost:  5,
              sportTransfer: 5,
              priority:      'accessory'
            };

        byExercise[exId] = {
          exerciseId:    exId,
          exerciseName:  ejercicio.nombre ?? exId,
          pattern:       metadata.pattern,
          systemicCost:  metadata.systemicCost,
          sportTransfer: metadata.sportTransfer,
          sessions:      []
        };
      }

      // Map completed sets to engine DTO
      const sets = (ejercicio.seriesLog ?? [])
        .filter(s => s.done)
        .map(s => ({
          load:             parseFloat(s.carga)         || 0,
          reps:             parseInt(s.reps)             || 0,
          rir:              s.rir     != null ? Number(s.rir)     : null,
          rpe:              s.rpe     != null ? Number(s.rpe)     : null,
          perceivedVelocity:  s.velocidad       ?? null,
          technicalQuality:   s.calidadTecnica  != null
                                ? Number(s.calidadTecnica)
                                : null,
          done: true
        }));

      if (sets.length > 0) {
        byExercise[exId].sessions.push({
          date: log.fecha ?? new Date().toISOString(),
          sets
        });
      }
    }
  }

  return Object.values(byExercise);
}

// ─────────────────────────────────────────
// Wellbeing mapping
// ─────────────────────────────────────────

/**
 * Maps the real ReadinessContext todayCheckIn shape to engine wellbeing DTO.
 *
 * Real todayCheckIn fields:
 *   { fecha, sleep, stress, doms, fatigue }
 *
 * Engine wellbeing fields:
 *   { sleep, stress, energy, muscleSoreness, bodyWeight }
 */
function mapWellbeing(checkIn, latestWeight) {
  if (!checkIn) return null;

  return {
    sleep:          checkIn.sleep   ?? 3,
    stress:         checkIn.stress  ?? 3,
    // ReadinessContext stores 'fatigue' as energy proxy (inverse)
    energy:         checkIn.fatigue != null
                      ? 10 - checkIn.fatigue   // higher fatigue = lower energy
                      : 5,
    muscleSoreness: checkIn.doms    ?? 3,
    bodyWeight:     latestWeight    ?? null
  };
}
