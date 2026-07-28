import { useState, useCallback, useMemo } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { usePerformanceEngine } from './usePerformanceEngine';
import {
  buildProgressionProposal,
  applyApprovedProgression,
  buildChainedMesocycleProposal,
} from '../utils/weekProgression';

// ══════════════════════════════════════════════════════════
// useWeekRepetition — Orchestrator hook
//
// Connects PlannerContext (source of truth for what's planned)
// with the Performance Engine (read-only exercise decisions)
// to generate, preview, and confirm week-repetition proposals.
//
// Rules obeyed:
// - Never reads Google Sheets directly (PlannerContext handles that)
// - Never mutates the frozen engine output
// - Only persists via PlannerContext.assignSessionToDay (existing)
// - Emits 'planner_week_repeated' event after confirm
// ══════════════════════════════════════════════════════════

const DAYS_ES = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

/** ISO date string for a given monday + day offset */
function formatISO(d) {
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Get all assigned session templates for a given week monday */
function getWeekTemplates(weekAssignments, monday) {
  const templates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const iso = formatISO(d);
    const assigned = weekAssignments[iso];
    if (assigned) {
      templates.push({
        ...assigned,
        _dayIndex: i,
        _dayKey: DAYS_ES[i],
        _dateISO: iso,
      });
    }
  }
  return templates;
}

export function useWeekRepetition() {
  const {
    weekAssignments,
    assignSessionToDay,
    currentWeekStart,
    activeMesocycle,
    seasons,
  } = usePlanner();

  const { exerciseDecisions } = usePerformanceEngine();

  // In-memory state for mesocycle wizard (not persisted until confirmed)
  const [mesocycleProposals, setMesocycleProposals] = useState(null);

  // ── Generate proposal for a single week ────────────────────────────────
  const generateWeekProposal = useCallback(
    (sourceMondayDate) => {
      const monday = sourceMondayDate || currentWeekStart;
      const templates = getWeekTemplates(weekAssignments, monday);

      if (templates.length === 0) return [];

      return buildProgressionProposal(templates, exerciseDecisions);
    },
    [weekAssignments, currentWeekStart, exerciseDecisions]
  );

  // ── Generate chained mesocycle proposal ────────────────────────────────
  const generateMesocycleProposal = useCallback(
    (sourceMondayDate, totalWeeks) => {
      const monday = sourceMondayDate || currentWeekStart;
      const templates = getWeekTemplates(weekAssignments, monday);

      if (templates.length === 0 || totalWeeks < 1) {
        setMesocycleProposals(null);
        return [];
      }

      const proposals = buildChainedMesocycleProposal(
        templates,
        exerciseDecisions,
        totalWeeks
      );

      // Store in memory for the wizard flow — NOT in localStorage
      setMesocycleProposals({
        sourceMondayDate: monday,
        sourceTemplates: templates,
        proposals,
        totalWeeks,
      });

      return proposals;
    },
    [weekAssignments, currentWeekStart, exerciseDecisions]
  );

  // ── Update an individual week's proposal in the mesocycle wizard ────────
  const updateMesocycleWeekProposal = useCallback(
    (weekIndex, updatedProposal) => {
      if (!mesocycleProposals) return;

      setMesocycleProposals(prev => {
        const newProposals = [...prev.proposals];
        newProposals[weekIndex] = updatedProposal;

        // Rechain subsequent weeks: rebuild the accumulated base by walking
        // forward from sourceTemplates through weeks 0..weekIndex, then
        // regenerate all weeks after weekIndex from that accumulated base.
        if (weekIndex < newProposals.length - 1) {
          // Step 1: Reconstruct the accumulated templates up through weekIndex
          // by applying each week's proposal (0..weekIndex) sequentially.
          let currentTemplates = prev.sourceTemplates;
          for (let w = 0; w <= weekIndex; w++) {
            currentTemplates = applyApprovedProgression(
              currentTemplates,
              newProposals[w]
            );
          }

          // Step 2: Regenerate every subsequent week from the accumulated base.
          for (let i = weekIndex + 1; i < newProposals.length; i++) {
            const rechained = buildProgressionProposal(
              currentTemplates,
              exerciseDecisions
            );
            newProposals[i] = rechained;
            currentTemplates = applyApprovedProgression(
              currentTemplates,
              rechained
            );
          }
        }

        return { ...prev, proposals: newProposals };
      });
    },
    [mesocycleProposals, exerciseDecisions]
  );

  // ── Confirm and persist a single week proposal ─────────────────────────
  const confirmProposal = useCallback(
    (proposal, targetMondayDate) => {
      if (!proposal || proposal.length === 0) return;

      // Get source templates to apply the approved changes
      const sourceMondayDate = currentWeekStart;
      const sourceTemplates = getWeekTemplates(weekAssignments, sourceMondayDate);

      const newTemplates = applyApprovedProgression(sourceTemplates, proposal);

      // Assign each new template to the corresponding day in the target week
      for (const template of newTemplates) {
        const dayIndex = template._dayIndex;
        if (dayIndex == null) continue;

        const targetDate = new Date(targetMondayDate);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        const targetISO = formatISO(targetDate);

        // Generate new unique ID
        const newId = `${template.id || 'sess'}-rep-${Date.now()}-${dayIndex}`;

        assignSessionToDay(targetISO, {
          ...template,
          id: newId,
          _dayIndex: undefined,
          _dayKey: undefined,
          _dateISO: undefined,
        });
      }

      // Emit reactive event for Home, Plan, Evolution to update
      window.dispatchEvent(new Event('planner_week_repeated'));
    },
    [weekAssignments, currentWeekStart, assignSessionToDay]
  );

  // ── Confirm entire mesocycle ────────────────────────────────────────────
  const confirmMesocycleProposals = useCallback(
    (targetStartMonday) => {
      if (!mesocycleProposals) return;

      const { sourceTemplates, proposals } = mesocycleProposals;

      let currentTemplates = sourceTemplates;

      for (let weekIdx = 0; weekIdx < proposals.length; weekIdx++) {
        const weekProposal = proposals[weekIdx];
        const newTemplates = applyApprovedProgression(currentTemplates, weekProposal);

        // Calculate target monday for this week
        const targetMonday = new Date(targetStartMonday);
        targetMonday.setDate(targetMonday.getDate() + weekIdx * 7);

        for (const template of newTemplates) {
          const dayIndex = template._dayIndex;
          if (dayIndex == null) continue;

          const targetDate = new Date(targetMonday);
          targetDate.setDate(targetDate.getDate() + dayIndex);
          const targetISO = formatISO(targetDate);

          const newId = `${template.id || 'sess'}-rep-${weekIdx}-${dayIndex}-${Date.now()}`;

          assignSessionToDay(targetISO, {
            ...template,
            id: newId,
            _dayIndex: undefined,
            _dayKey: undefined,
            _dateISO: undefined,
          });
        }

        // Chain: next week builds on this week's approved loads
        currentTemplates = newTemplates;
      }

      setMesocycleProposals(null);
      window.dispatchEvent(new Event('planner_week_repeated'));
    },
    [mesocycleProposals, assignSessionToDay]
  );

  // ── Computed: how many weeks remain in the active mesocycle ─────────────
  const remainingMesocycleWeeks = useMemo(() => {
    if (!activeMesocycle) return 0;
    const start = new Date(activeMesocycle.startDate);
    const today = new Date();
    const elapsed = Math.floor((today - start) / (7 * 86400000));
    return Math.max(0, activeMesocycle.weeks - elapsed - 1);
  }, [activeMesocycle]);

  return {
    generateWeekProposal,
    generateMesocycleProposal,
    updateMesocycleWeekProposal,
    confirmProposal,
    confirmMesocycleProposals,
    mesocycleProposals,
    remainingMesocycleWeeks,
    exerciseDecisions,
  };
}
