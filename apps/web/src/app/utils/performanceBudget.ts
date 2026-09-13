/**
 * PERFORMANCE BUDGET CONFIGURATION
 * Define and enforce performance budgets for all routes
 * Block builds that violate performance standards
 */

export interface RouteBudget {
  route: string;
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  tbt: number; // Total Blocking Time (ms)
  cls: number; // Cumulative Layout Shift (score)
  fid: number; // First Input Delay (ms)
  ttfb: number; // Time to First Byte (ms)
  bundleSize: number; // Bundle size (KB)
  apiLatencyP95: number; // API P95 latency (ms)
}

/**
 * Performance budgets per route category
 */
export const PERFORMANCE_BUDGETS: Record<string, RouteBudget> = {
  // Critical user-facing pages (strictest budgets)
  'critical': {
    route: 'HomePage, ShopPage, ProductDetailPage',
    fcp: 800, // 0.8s
    lcp: 1500, // 1.5s
    tbt: 150, // 150ms
    cls: 0.05, // 0.05 score
    fid: 50, // 50ms
    ttfb: 200, // 200ms
    bundleSize: 250, // 250KB
    apiLatencyP95: 300, // 300ms
  },

  // Shopping & Commerce pages
  'commerce': {
    route: 'CartPage, CheckoutPage, OrdersPage',
    fcp: 1000, // 1s
    lcp: 2000, // 2s
    tbt: 200, // 200ms
    cls: 0.1, // 0.1 score
    fid: 100, // 100ms
    ttfb: 300, // 300ms
    bundleSize: 300, // 300KB
    apiLatencyP95: 500, // 500ms
  },

  // Social features
  'social': {
    route: 'ProfilePage, MessagesPage, NotificationsPage',
    fcp: 1000, // 1s
    lcp: 2000, // 2s
    tbt: 200, // 200ms
    cls: 0.1, // 0.1 score
    fid: 100, // 100ms
    ttfb: 300, // 300ms
    bundleSize: 350, // 350KB
    apiLatencyP95: 400, // 400ms
  },

  // Seller dashboard pages
  'seller': {
    route: 'SellerDashboard, ProductManagementPage, OrderManagement',
    fcp: 1200, // 1.2s
    lcp: 2500, // 2.5s
    tbt: 300, // 300ms
    cls: 0.1, // 0.1 score
    fid: 100, // 100ms
    ttfb: 400, // 400ms
    bundleSize: 400, // 400KB
    apiLatencyP95: 600, // 600ms
  },

  // Admin pages (more relaxed)
  'admin': {
    route: 'AdminDashboard, UserManagementDashboard, ContentModerationQueue',
    fcp: 1500, // 1.5s
    lcp: 3000, // 3s
    tbt: 400, // 400ms
    cls: 0.15, // 0.15 score
    fid: 150, // 150ms
    ttfb: 500, // 500ms
    bundleSize: 500, // 500KB
    apiLatencyP95: 800, // 800ms
  },

  // Static content pages
  'static': {
    route: 'AboutPage, TermsPage, PrivacyPage, HelpPage',
    fcp: 1000, // 1s
    lcp: 2000, // 2s
    tbt: 100, // 100ms
    cls: 0.05, // 0.05 score
    fid: 50, // 50ms
    ttfb: 200, // 200ms
    bundleSize: 200, // 200KB
    apiLatencyP95: 200, // 200ms
  },
};

/**
 * Global performance thresholds (applies to all pages)
 */
export const GLOBAL_THRESHOLDS = {
  // Core Web Vitals (Google standards)
  fcp: 1800, // 1.8s (Good: < 1.8s)
  lcp: 2500, // 2.5s (Good: < 2.5s)
  fid: 100, // 100ms (Good: < 100ms)
  cls: 0.1, // 0.1 (Good: < 0.1)
  
  // Additional metrics
  tbt: 300, // 300ms (Good: < 300ms)
  ttfb: 600, // 600ms (Good: < 600ms)
  
  // Bundle size (per route)
  bundleSize: 500, // 500KB max
  
  // API performance
  apiLatencyP50: 200, // 200ms
  apiLatencyP95: 500, // 500ms
  apiLatencyP99: 1000, // 1s
  
  // Success rates
  apiSuccessRate: 99.5, // 99.5%
  
  // Memory
  memoryUsagePercent: 90, // 90% of heap limit
} as const;

/**
 * Get budget for specific route
 */
export function getBudgetForRoute(route: string): RouteBudget {
  // Check if route matches any category
  for (const [category, budget] of Object.entries(PERFORMANCE_BUDGETS)) {
    if (budget.route.toLowerCase().includes(route.toLowerCase())) {
      return budget;
    }
  }
  
  // Return most strict budget if not found
  return PERFORMANCE_BUDGETS.critical;
}

/**
 * Check if metrics meet budget
 */
export function checkBudget(
  route: string,
  metrics: Partial<{
    fcp: number;
    lcp: number;
    tbt: number;
    cls: number;
    fid: number;
    ttfb: number;
    bundleSize: number;
    apiLatencyP95: number;
  }>
): {
  passed: boolean;
  violations: Array<{
    metric: string;
    actual: number;
    budget: number;
    exceeded: number;
  }>;
} {
  const budget = getBudgetForRoute(route);
  const violations: Array<{
    metric: string;
    actual: number;
    budget: number;
    exceeded: number;
  }> = [];

  // Check each metric
  Object.entries(metrics).forEach(([metric, actual]) => {
    if (actual === undefined || actual === null) return;
    
    const budgetValue = budget[metric as keyof RouteBudget] as number;
    if (budgetValue === undefined) return;
    
    if (actual > budgetValue) {
      violations.push({
        metric,
        actual,
        budget: budgetValue,
        exceeded: actual - budgetValue,
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Check if metrics meet global thresholds
 */
export function checkGlobalThresholds(
  metrics: Partial<{
    fcp: number;
    lcp: number;
    tbt: number;
    cls: number;
    fid: number;
    ttfb: number;
    bundleSize: number;
    apiLatencyP50: number;
    apiLatencyP95: number;
    apiLatencyP99: number;
    apiSuccessRate: number;
    memoryUsagePercent: number;
  }>
): {
  passed: boolean;
  violations: Array<{
    metric: string;
    actual: number;
    threshold: number;
    exceeded: number;
  }>;
} {
  const violations: Array<{
    metric: string;
    actual: number;
    threshold: number;
    exceeded: number;
  }> = [];

  // Check each metric against global thresholds
  Object.entries(metrics).forEach(([metric, actual]) => {
    if (actual === undefined || actual === null) return;
    
    const threshold = GLOBAL_THRESHOLDS[metric as keyof typeof GLOBAL_THRESHOLDS];
    if (threshold === undefined) return;
    
    // Success rate is inverted (higher is better)
    if (metric === 'apiSuccessRate') {
      if (actual < threshold) {
        violations.push({
          metric,
          actual,
          threshold,
          exceeded: threshold - actual,
        });
      }
    } else {
      if (actual > threshold) {
        violations.push({
          metric,
          actual,
          threshold,
          exceeded: actual - threshold,
        });
      }
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Get performance score (0-100) based on budgets
 */
export function getPerformanceScore(
  route: string,
  metrics: Partial<{
    fcp: number;
    lcp: number;
    tbt: number;
    cls: number;
    fid: number;
    ttfb: number;
  }>
): number {
  const budget = getBudgetForRoute(route);
  const scores: number[] = [];

  // Calculate score for each metric (0-100)
  Object.entries(metrics).forEach(([metric, actual]) => {
    if (actual === undefined || actual === null) return;
    
    const budgetValue = budget[metric as keyof RouteBudget] as number;
    if (budgetValue === undefined) return;
    
    // Score = 100 if actual <= budget, decreases linearly
    const score = Math.max(0, Math.min(100, (budgetValue / actual) * 100));
    scores.push(score);
  });

  if (scores.length === 0) return 0;
  
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Format budget report
 */
export function formatBudgetReport(
  route: string,
  metrics: Partial<{
    fcp: number;
    lcp: number;
    tbt: number;
    cls: number;
    fid: number;
    ttfb: number;
    bundleSize: number;
    apiLatencyP95: number;
  }>
): string {
  const budget = getBudgetForRoute(route);
  const check = checkBudget(route, metrics);
  const globalCheck = checkGlobalThresholds(metrics);
  const score = getPerformanceScore(route, metrics);

  let report = `📊 PERFORMANCE BUDGET REPORT: ${route}\n`;
  report += '='.repeat(60) + '\n\n';
  
  report += `Overall Score: ${score.toFixed(1)}/100 ${score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌'}\n\n`;

  report += 'Metric            Actual      Budget      Status\n';
  report += '-'.repeat(60) + '\n';

  Object.entries(metrics).forEach(([metric, actual]) => {
    if (actual === undefined || actual === null) return;
    
    const budgetValue = budget[metric as keyof RouteBudget] as number;
    if (budgetValue === undefined) return;
    
    const passed = actual <= budgetValue;
    const status = passed ? '✅ PASS' : '❌ FAIL';
    
    let actualStr = metric === 'cls' 
      ? actual.toFixed(3)
      : metric === 'bundleSize'
      ? `${actual}KB`
      : `${actual.toFixed(0)}ms`;
      
    let budgetStr = metric === 'cls'
      ? budgetValue.toFixed(3)
      : metric === 'bundleSize'
      ? `${budgetValue}KB`
      : `${budgetValue}ms`;
    
    report += `${metric.padEnd(16)} ${actualStr.padEnd(11)} ${budgetStr.padEnd(11)} ${status}\n`;
  });

  if (check.violations.length > 0) {
    report += '\n❌ Budget Violations:\n';
    check.violations.forEach(v => {
      report += `  - ${v.metric}: exceeded by ${v.exceeded.toFixed(0)}${v.metric === 'cls' ? '' : v.metric === 'bundleSize' ? 'KB' : 'ms'}\n`;
    });
  }

  if (globalCheck.violations.length > 0) {
    report += '\n⚠️  Global Threshold Violations:\n';
    globalCheck.violations.forEach(v => {
      report += `  - ${v.metric}: ${v.actual.toFixed(1)} > ${v.threshold} (exceeded by ${v.exceeded.toFixed(1)})\n`;
    });
  }

  if (check.passed && globalCheck.passed) {
    report += '\n✅ All budgets met!\n';
  }

  return report;
}

/**
 * Export budget configuration
 */
export function exportBudgets(): string {
  return JSON.stringify({
    routeBudgets: PERFORMANCE_BUDGETS,
    globalThresholds: GLOBAL_THRESHOLDS,
  }, null, 2);
}
