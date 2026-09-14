/**
 * PERFORMANCE LOCK CONFIGURATION
 * 
 * PRODUCTION HARDENING - February 25, 2026 Launch
 * 
 * This file LOCKS performance optimizations and prevents
 * re-enabling of aggressive monitoring at startup.
 * 
 * ⚠️ DO NOT MODIFY UNLESS EXPLICITLY TESTING IN DEVELOPMENT
 */

export const PERFORMANCE_LOCK_CONFIG = {
  // Lock timestamp
  lockedAt: '2026-02-01T00:00:00Z',
  lockedBy: 'Pre-Launch Validation System',
  
  // Launch date
  launchDate: '2026-02-25T00:00:00Z',
  
  // Performance lock settings
  lock: {
    // Prevent auto-initialization of monitoring systems
    disableAutoMonitoring: true,
    
    // Prevent aggressive RUM activation
    disableProductionRUM: true,
    
    // Prevent chaos testing auto-start
    disableChaosFramework: true,
    
    // Prevent automated performance tests at startup
    disableAutomatedTests: true,
    
    // Prevent memory monitoring auto-start
    disableMemoryMonitoring: true,
    
    // Prevent regression monitoring
    disableRegressionMonitoring: true,
    
    // Allow lightweight long task validator (read-only)
    allowLongTaskValidator: true,
    
    // Allow on-demand activation via console
    allowManualActivation: true,
  },
  
  // Performance targets (locked)
  targets: {
    fcp: 1000, // First Contentful Paint < 1s
    lcp: 2000, // Largest Contentful Paint < 2s
    fid: 50,   // First Input Delay < 50ms
    cls: 0.05, // Cumulative Layout Shift < 0.05
    tti: 3000, // Time to Interactive < 3s
    performanceScore: 95, // Lighthouse score >= 95
  },
  
  // Allowed monitoring in production
  allowedMonitoring: [
    'error-tracking',      // Error boundary logging
    'analytics',           // User analytics
    'crash-reporting',     // Critical crash reports
    'long-task-observer',  // Lightweight long task detection (passive)
  ],
  
  // Forbidden at startup
  forbiddenAtStartup: [
    'performance-testing',
    'automated-testing',
    'e2e-scenarios',
    'regression-monitoring',
    'chaos-testing',
    'memory-profiling',
    'heavy-rum-activation',
  ],
  
  // Console warning for attempted re-enable
  warningMessage: `
⚠️  PERFORMANCE LOCK ACTIVE ⚠️

This platform is locked for production launch on February 25, 2026.
Aggressive monitoring systems are disabled at startup to ensure zero UI blocking.

To manually enable monitoring for testing:
  - window.activateProductionRUM() - Manual RUM activation
  - window.validateLongTasks() - Long task validation
  - window.runProductionValidation() - Full validation suite

DO NOT modify /config/performanceLock.ts without explicit approval.
`,
} as const;

/**
 * Check if monitoring system is allowed at startup
 */
export function isAllowedAtStartup(systemName: string): boolean {
  return !PERFORMANCE_LOCK_CONFIG.forbiddenAtStartup.includes(systemName as any);
}

/**
 * Check if manual activation is allowed
 */
export function isManualActivationAllowed(): boolean {
  return PERFORMANCE_LOCK_CONFIG.lock.allowManualActivation;
}

/**
 * Get performance targets
 */
export function getPerformanceTargets() {
  return PERFORMANCE_LOCK_CONFIG.targets;
}

/**
 * Display lock warning
 */
export function displayLockWarning(): void {
  if (PERFORMANCE_LOCK_CONFIG.lock.disableAutoMonitoring) {
    console.log(PERFORMANCE_LOCK_CONFIG.warningMessage);
  }
}

/**
 * Validate if system should initialize
 */
export function shouldInitializeSystem(systemName: string): boolean {
  // Check if in forbidden list
  if (PERFORMANCE_LOCK_CONFIG.forbiddenAtStartup.includes(systemName as any)) {
    console.warn(`[Performance Lock] System "${systemName}" is disabled at startup`);
    return false;
  }
  
  // Check if in allowed list
  if (PERFORMANCE_LOCK_CONFIG.allowedMonitoring.includes(systemName as any)) {
    return true;
  }
  
  // Default: don't initialize unknown systems
  return false;
}

// Expose to window for validation
if (typeof window !== 'undefined') {
  (window as any).__performanceLock = PERFORMANCE_LOCK_CONFIG;
  (window as any).checkPerformanceLock = () => {
    console.log('🔒 Performance Lock Status:');
    console.log('  Locked:', PERFORMANCE_LOCK_CONFIG.lock.disableAutoMonitoring);
    console.log('  Launch Date:', PERFORMANCE_LOCK_CONFIG.launchDate);
    console.log('  Allowed Monitoring:', PERFORMANCE_LOCK_CONFIG.allowedMonitoring);
    console.log('  Forbidden at Startup:', PERFORMANCE_LOCK_CONFIG.forbiddenAtStartup);
    return PERFORMANCE_LOCK_CONFIG;
  };
}

export default PERFORMANCE_LOCK_CONFIG;
