/**
 * Performance Engine — Public API
 *
 * Single entry point for consuming the engine.
 * Import only from here, never from internal modules directly.
 *
 * @example
 *   import { evaluate, PERFORMANCE_CONFIG } from '../engine/performance';
 *   const output = evaluate(myInput);
 */

export { evaluate } from './core/engineCore.js';
export { PERFORMANCE_CONFIG } from './performanceConfig.js';
