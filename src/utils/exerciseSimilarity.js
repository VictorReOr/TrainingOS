/**
 * exerciseSimilarity.js — Utilidades puras para medir similitud textual entre nombres de ejercicios.
 */

/**
 * Normaliza un nombre: minúsculas, sin tildes, trim y espacios colapsados.
 * Idéntico a la lógica interna de normalize() en exerciseMatcher.js.
 *
 * @param {string} name
 * @returns {string}
 */
function normalize(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Colapsar espacios extra
}

/**
 * Calcula la distancia de edición de Levenshtein entre dos cadenas.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // Eliminación
        dp[i][j - 1] + 1,      // Inserción
        dp[i - 1][j - 1] + cost // Sustitución
      );
    }
  }

  return dp[m][n];
}

/**
 * Calcula la similitud entre dos nombres de ejercicios (0 a 1).
 *
 * Combina:
 * 1. Similitud por tokens (Jaccard) sobre palabras individuales.
 * 2. Similitud por distancia de Levenshtein normalizada sobre el string completo.
 *
 * Retorna el máximo de ambos scores.
 *
 * @param {string} nameA
 * @param {string} nameB
 * @returns {number} Valor entre 0 y 1
 */
export function calculateSimilarity(nameA, nameB) {
  const normA = normalize(nameA);
  const normB = normalize(nameB);

  if (!normA && !normB) return 1;
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;

  // 1. Similitud por tokens (Jaccard: intersección / unión de palabras)
  const tokensA = new Set(normA.split(' ').filter(Boolean));
  const tokensB = new Set(normB.split(' ').filter(Boolean));

  let intersectionSize = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionSize++;
    }
  }

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  const jaccardScore = unionSize === 0 ? 0 : intersectionSize / unionSize;

  // 2. Similitud por distancia de edición (Levenshtein normalizada)
  const maxLen = Math.max(normA.length, normB.length);
  const distance = levenshteinDistance(normA, normB);
  const levenshteinScore = maxLen === 0 ? 1 : Math.max(0, 1 - (distance / maxLen));

  // 3. Devuelve el máximo de ambos scores
  return Math.max(jaccardScore, levenshteinScore);
}

/**
 * Encuentra el mejor candidato dentro de una lista basada en calculateSimilarity.
 *
 * @param {string} rawName - Nombre a comparar
 * @param {Array<{id: string, name: string}>} candidates - Lista de candidatos ya unificada
 * @returns {{ candidate: { id: string, name: string }, score: number } | null}
 */
export function findBestMatch(rawName, candidates) {
  if (!rawName || !Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  let bestCandidate = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    if (!candidate || !candidate.name) continue;
    const score = calculateSimilarity(rawName, candidate.name);
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  if (!bestCandidate) return null;

  return {
    candidate: bestCandidate,
    score: bestScore,
  };
}
