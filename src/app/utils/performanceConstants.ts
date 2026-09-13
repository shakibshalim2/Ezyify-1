/**
 * PERFORMANCE CONSTANTS
 * Shared performance targets and budgets across the application
 */

/**
 * WORLD-CLASS PERFORMANCE TARGETS (Non-Negotiable)
 */
export const PERFORMANCE_TARGETS = {
  fcp: 300,      // First Contentful Paint ≤ 300ms
  lcp: 600,      // Largest Contentful Paint ≤ 600ms
  tbt: 50,       // Total Blocking Time ≤ 50ms
  cls: 0.05,     // Cumulative Layout Shift ≤ 0.05
  fid: 100,      // First Input Delay ≤ 100ms
  ttfb: 200,     // Time to First Byte ≤ 200ms
} as const;

/**
 * Performance Budget
 */
export const PERFORMANCE_BUDGET = {
  jsInitial: 100,     // KB
  cssCritical: 30,    // KB
  totalDomNodes: 50,  // count
  jsExecution: 100,   // ms
} as const;

/**
 * Performance Status Thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  excellent: 1.0,   // <= target
  good: 1.5,        // <= target * 1.5
  poor: Infinity,   // > target * 1.5
} as const;
