/**
 * Sport Profiles — Registro central
 *
 * El engine resuelve el perfil aquí y lo pasa como parámetro a los índices.
 * Los índices NO importan perfiles individuales directamente.
 *
 * Las claves del registro coinciden con los IDs de perfil (no con las cadenas
 * internas del engine — ver mapeo en engineCore.js: 'tkd' → 'taekwondo').
 */
import { TAEKWONDO_PROFILE } from './taekwondo.js';

export const SPORT_PROFILES = {
  taekwondo: TAEKWONDO_PROFILE,
};

/**
 * Devuelve el perfil deportivo para un sportId dado,
 * o null si no existe perfil definido (ej. 'gym').
 *
 * @param {string} sportId - ID del perfil (ej. 'taekwondo')
 * @returns {Object|null}
 */
export function getSportProfile(sportId) {
  return SPORT_PROFILES[sportId] ?? null;
}
