/**
 * Utilities for matching imported exercise names against the canonical exercise library.
 */

import { getAliasTarget } from './exerciseAliases.js';

export function matchExerciseId(excelExerciseName, exerciseLibrary) {
  if (!excelExerciseName) return null;

  // 1. Normaliza el nombre: minúsculas, sin tildes, trim, espacios colapsados
  const normalize = (name) => {
    return name
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' '); // Colapsar espacios extra
  };

  const normalizedInput = normalize(excelExerciseName);

  // NUEVO: consulta la tabla de alias antes del match exacto
  const aliasTarget = getAliasTarget(normalizedInput);
  if (aliasTarget) return aliasTarget;

  // 2. Busca match EXACTO normalizado contra exerciseLibrary[].name
  for (const libExercise of exerciseLibrary) {
    if (normalize(libExercise.name) === normalizedInput) {
      // 3. Si hay match -> retorna el id canónico
      return libExercise.id;
    }
  }

  // 4. Si NO hay match -> retorna null
  return null;
}

