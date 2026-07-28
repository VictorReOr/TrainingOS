/**
 * weekProgression.js — Pure utility (no React, no DOM, no localStorage)
 *
 * Generates and applies load-progression proposals for week repetition,
 * using exercise decisions already computed by the Performance Engine.
 */

/**
 * Extracts all exercises from a session template, walking through
 * blocks → exercises. Returns flat array with sessionId/sessionName context.
 */
function flattenExercises(session) {
  const exercises = [];
  const blocks = session.blocks || [];
  for (const block of blocks) {
    const blockExercises = block.exercises || [];
    for (const ex of blockExercises) {
      exercises.push({
        ...ex,
        _sessionId: session.id,
        _sessionName: session.name || session.nombre || 'Sesión',
      });
    }
  }
  return exercises;
}

/**
 * Generates a progression proposal for a week.
 *
 * @param {Array<Object>} sourceWeekTemplates - Session objects assigned to this week
 * @param {Object} exerciseDecisions - { [exerciseId]: { trafficLight, suggestedLoadDelta, isStagnating, reasoning } }
 * @returns {Array<ProgressionProposalItem>}
 */
export function buildProgressionProposal(sourceWeekTemplates, exerciseDecisions) {
  if (!Array.isArray(sourceWeekTemplates)) return [];
  const decisions = exerciseDecisions || {};

  const proposal = [];

  for (const session of sourceWeekTemplates) {
    const exercises = flattenExercises(session);

    for (const exercise of exercises) {
      const exId = exercise.id;
      const decision = decisions[exId] || null;

      const oldLoad = exercise.prescribedLoad ?? exercise.carga ?? null;
      const suggestedDelta = decision?.suggestedLoadDelta ?? 0;
      const newLoad = oldLoad != null
        ? Math.max(0, oldLoad + suggestedDelta)
        : null;

      proposal.push({
        sessionId: session.id,
        sessionName: session.name || session.nombre || 'Sesión',
        exerciseId: exId,
        exerciseName: exercise.name || exercise.nombre || exId,
        oldLoad,
        suggestedDelta,
        newLoad,
        trafficLight: decision?.trafficLight?.color ?? 'yellow',
        trafficLightLabel: decision?.trafficLight?.label ?? 'Sin datos',
        isStagnating: decision?.isStagnating ?? false,
        reasoning: decision?.reasoning ?? 'Sin historial suficiente',
        // The coach can override this in the UI before approving
        approvedLoad: newLoad,
        // Preserve series/reps metadata for display
        series: exercise.series ?? exercise.sets ?? null,
        reps: exercise.reps ?? null,
      });
    }
  }

  return proposal;
}

/**
 * Applies approved (and potentially coach-edited) load changes onto
 * cloned session templates, producing new templates ready to persist.
 *
 * @param {Array<Object>} sourceWeekTemplates - Original session objects
 * @param {Array<ProgressionProposalItem>} approvedItems - Items with final approvedLoad
 * @returns {Array<Object>} New session templates with updated loads
 */
export function applyApprovedProgression(sourceWeekTemplates, approvedItems) {
  if (!Array.isArray(sourceWeekTemplates) || !Array.isArray(approvedItems)) {
    return [];
  }

  // Index approved items by exerciseId for O(1) lookup
  const byExerciseId = new Map();
  for (const item of approvedItems) {
    byExerciseId.set(item.exerciseId, item);
  }

  return sourceWeekTemplates.map(session => ({
    ...session,
    id: undefined, // Will be regenerated on save (new template, not same ref)
    blocks: (session.blocks || []).map(block => ({
      ...block,
      exercises: (block.exercises || []).map(exercise => {
        const approved = byExerciseId.get(exercise.id);
        if (approved && approved.approvedLoad != null) {
          return {
            ...exercise,
            prescribedLoad: approved.approvedLoad,
            carga: approved.approvedLoad,
          };
        }
        return { ...exercise };
      }),
    })),
  }));
}

/**
 * Chains progression across multiple weeks for mesocycle repetition.
 * Week N+1 builds on the approved loads from Week N.
 *
 * @param {Array<Object>} sourceWeekTemplates - Session objects from the origin week
 * @param {Object} exerciseDecisions - Current engine decisions
 * @param {number} totalWeeks - How many weeks to generate
 * @returns {Array<Array<ProgressionProposalItem>>} One proposal array per week
 */
export function buildChainedMesocycleProposal(sourceWeekTemplates, exerciseDecisions, totalWeeks) {
  if (totalWeeks < 1) return [];

  const weekProposals = [];
  let currentTemplates = sourceWeekTemplates;
  const decisions = exerciseDecisions || {};

  for (let week = 0; week < totalWeeks; week++) {
    const proposal = buildProgressionProposal(currentTemplates, decisions);
    weekProposals.push(proposal);

    // Pre-apply this week's proposed loads to serve as the base for the next week
    currentTemplates = applyApprovedProgression(currentTemplates, proposal);
  }

  return weekProposals;
}
