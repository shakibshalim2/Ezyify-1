/**
 * PERFORMANCE REGRESSION GUARD
 * - Enforces performance budgets in CI/CD
 * - Fails build if FCP, LCP, TBT, CLS exceed thresholds
 * - Prevents merge/deploy on regression
 */

import { PERFORMANCE_TARGETS, PERFORMANCE_BUDGET } from './performanceConstants';

export interface PerformanceReport {
  passed: boolean;
  timestamp: number;
  metrics: {
    fcp: number | null;
    lcp: number | null;
    tbt: number | null;
    cls: number | null;
  };
  budget: {
    domNodes: number;
    jsHeapSize: number;
  };
  violations: string[];
  warnings: string[];
}

/**
 * Run performance regression check
 */
export function checkPerformanceRegression(
  metrics: {
    fcp: number | null;
    lcp: number | null;
    tbt: number | null;
    cls: number | null;
    domNodes: number | null;
    jsHeapSize: number | null;
  }
): PerformanceReport {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Check Core Web Vitals
  if (metrics.fcp !== null && metrics.fcp > PERFORMANCE_TARGETS.fcp) {
    violations.push(`FCP ${Math.round(metrics.fcp)}ms exceeds target ${PERFORMANCE_TARGETS.fcp}ms`);
  } else if (metrics.fcp !== null && metrics.fcp > PERFORMANCE_TARGETS.fcp * 0.9) {
    warnings.push(`FCP ${Math.round(metrics.fcp)}ms approaching target ${PERFORMANCE_TARGETS.fcp}ms`);
  }
  
  if (metrics.lcp !== null && metrics.lcp > PERFORMANCE_TARGETS.lcp) {
    violations.push(`LCP ${Math.round(metrics.lcp)}ms exceeds target ${PERFORMANCE_TARGETS.lcp}ms`);
  } else if (metrics.lcp !== null && metrics.lcp > PERFORMANCE_TARGETS.lcp * 0.9) {
    warnings.push(`LCP ${Math.round(metrics.lcp)}ms approaching target ${PERFORMANCE_TARGETS.lcp}ms`);
  }
  
  if (metrics.tbt !== null && metrics.tbt > PERFORMANCE_TARGETS.tbt) {
    violations.push(`TBT ${Math.round(metrics.tbt)}ms exceeds target ${PERFORMANCE_TARGETS.tbt}ms`);
  } else if (metrics.tbt !== null && metrics.tbt > PERFORMANCE_TARGETS.tbt * 0.9) {
    warnings.push(`TBT ${Math.round(metrics.tbt)}ms approaching target ${PERFORMANCE_TARGETS.tbt}ms`);
  }
  
  if (metrics.cls !== null && metrics.cls > PERFORMANCE_TARGETS.cls) {
    violations.push(`CLS ${metrics.cls.toFixed(3)} exceeds target ${PERFORMANCE_TARGETS.cls}`);
  } else if (metrics.cls !== null && metrics.cls > PERFORMANCE_TARGETS.cls * 0.9) {
    warnings.push(`CLS ${metrics.cls.toFixed(3)} approaching target ${PERFORMANCE_TARGETS.cls}`);
  }
  
  // Check Performance Budget
  if (metrics.domNodes !== null && metrics.domNodes > PERFORMANCE_BUDGET.totalDomNodes) {
    violations.push(`DOM nodes ${metrics.domNodes} exceeds budget ${PERFORMANCE_BUDGET.totalDomNodes}`);
  }
  
  const report: PerformanceReport = {
    passed: violations.length === 0,
    timestamp: Date.now(),
    metrics: {
      fcp: metrics.fcp,
      lcp: metrics.lcp,
      tbt: metrics.tbt,
      cls: metrics.cls,
    },
    budget: {
      domNodes: metrics.domNodes || 0,
      jsHeapSize: metrics.jsHeapSize || 0,
    },
    violations,
    warnings,
  };
  
  return report;
}

/**
 * Generate CI/CD report
 */
export function generateCICDReport(report: PerformanceReport): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push('PERFORMANCE REGRESSION GUARD REPORT');
  lines.push('='.repeat(80));
  lines.push('');
  
  // Status
  lines.push(`Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
  lines.push(`Timestamp: ${new Date(report.timestamp).toISOString()}`);
  lines.push('');
  
  // Metrics
  lines.push('Core Web Vitals:');
  lines.push(`  FCP: ${report.metrics.fcp !== null ? Math.round(report.metrics.fcp) + 'ms' : 'N/A'} (target: ${PERFORMANCE_TARGETS.fcp}ms)`);
  lines.push(`  LCP: ${report.metrics.lcp !== null ? Math.round(report.metrics.lcp) + 'ms' : 'N/A'} (target: ${PERFORMANCE_TARGETS.lcp}ms)`);
  lines.push(`  TBT: ${report.metrics.tbt !== null ? Math.round(report.metrics.tbt) + 'ms' : 'N/A'} (target: ${PERFORMANCE_TARGETS.tbt}ms)`);
  lines.push(`  CLS: ${report.metrics.cls !== null ? report.metrics.cls.toFixed(3) : 'N/A'} (target: ${PERFORMANCE_TARGETS.cls})`);
  lines.push('');
  
  // Budget
  lines.push('Performance Budget:');
  lines.push(`  DOM Nodes: ${report.budget.domNodes} (budget: ${PERFORMANCE_BUDGET.totalDomNodes})`);
  lines.push(`  JS Heap Size: ${report.budget.jsHeapSize.toFixed(1)}MB`);
  lines.push('');
  
  // Violations
  if (report.violations.length > 0) {
    lines.push('❌ VIOLATIONS:');
    report.violations.forEach(v => lines.push(`  - ${v}`));
    lines.push('');
  }
  
  // Warnings
  if (report.warnings.length > 0) {
    lines.push('⚠️  WARNINGS:');
    report.warnings.forEach(w => lines.push(`  - ${w}`));
    lines.push('');
  }
  
  // Result
  if (!report.passed) {
    lines.push('='.repeat(80));
    lines.push('BUILD FAILED: Performance regression detected');
    lines.push('Fix violations above before merging/deploying');
    lines.push('='.repeat(80));
  } else {
    lines.push('='.repeat(80));
    lines.push('BUILD PASSED: All performance targets met');
    lines.push('='.repeat(80));
  }
  
  return lines.join('\n');
}

/**
 * Export report as JSON for CI/CD tools
 */
export function exportReportJSON(report: PerformanceReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Check if performance has regressed compared to baseline
 */
export function compareWithBaseline(
  current: PerformanceReport['metrics'],
  baseline: PerformanceReport['metrics'],
  threshold: number = 0.1 // 10% regression threshold
): { regressed: boolean; regressions: string[] } {
  const regressions: string[] = [];
  
  // Compare each metric
  Object.keys(current).forEach(key => {
    const metricKey = key as keyof PerformanceReport['metrics'];
    const currentValue = current[metricKey];
    const baselineValue = baseline[metricKey];
    
    if (currentValue !== null && baselineValue !== null) {
      const change = (currentValue - baselineValue) / baselineValue;
      
      if (change > threshold) {
        regressions.push(
          `${metricKey.toUpperCase()} regressed by ${(change * 100).toFixed(1)}% ` +
          `(${baselineValue.toFixed(0)} → ${currentValue.toFixed(0)})`
        );
      }
    }
  });
  
  return {
    regressed: regressions.length > 0,
    regressions,
  };
}

/**
 * Save performance report to localStorage for CI/CD
 */
export function savePerformanceReport(report: PerformanceReport): void {
  try {
    localStorage.setItem('performance_report_latest', JSON.stringify(report));
    
    // Also save to history
    const history = localStorage.getItem('performance_report_history');
    const reports: PerformanceReport[] = history ? JSON.parse(history) : [];
    reports.push(report);
    
    // Keep only last 10 reports
    const trimmed = reports.slice(-10);
    localStorage.setItem('performance_report_history', JSON.stringify(trimmed));
  } catch (error) {
    console.warn('[Performance Guard] Failed to save report:', error);
  }
}

/**
 * Get latest performance report
 */
export function getLatestReport(): PerformanceReport | null {
  try {
    const report = localStorage.getItem('performance_report_latest');
    return report ? JSON.parse(report) : null;
  } catch (error) {
    console.warn('[Performance Guard] Failed to load report:', error);
    return null;
  }
}
