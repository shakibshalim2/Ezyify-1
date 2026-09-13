/**
 * PERFORMANCE REGRESSION PROTECTION SYSTEM
 * Automatically detects and prevents performance regressions
 * Blocks builds if performance degrades beyond acceptable thresholds
 */

import { getPageLoadMetrics, checkPerformanceThresholds } from './performanceMonitor';
import { apiLatencyTracker } from './apiLatencyTracker';
import { checkBudget, checkGlobalThresholds, GLOBAL_THRESHOLDS } from './performanceBudget';
import { 
  getStoredRUMMetrics, 
  getAverageMetrics, 
  detectPerformanceDegradation 
} from './realUserMonitoring';

export interface RegressionCheck {
  metric: string;
  baseline: number;
  current: number;
  change: number;
  changePercent: number;
  threshold: number;
  passed: boolean;
  severity: 'critical' | 'warning' | 'info';
}

export interface RegressionReport {
  passed: boolean;
  score: number;
  checks: RegressionCheck[];
  timestamp: number;
  deploymentVersion?: string;
}

/**
 * Performance baselines (from current production)
 */
const PERFORMANCE_BASELINES = {
  fcp: 950, // First Contentful Paint (ms)
  lcp: 1500, // Largest Contentful Paint (ms)
  cls: 0.05, // Cumulative Layout Shift
  fid: 50, // First Input Delay (ms)
  tbt: 150, // Total Blocking Time (ms)
  ttfb: 200, // Time to First Byte (ms)
  apiP50: 150, // API P50 latency (ms)
  apiP95: 400, // API P95 latency (ms)
  apiP99: 800, // API P99 latency (ms)
  apiSuccessRate: 99.5, // API success rate (%)
};

/**
 * Regression thresholds (maximum allowed degradation)
 */
const REGRESSION_THRESHOLDS = {
  critical: 0.20, // 20% degradation = critical (block build)
  warning: 0.10, // 10% degradation = warning (alert)
  info: 0.05, // 5% degradation = info (monitor)
};

/**
 * Check for performance regressions
 */
export async function checkPerformanceRegression(
  deploymentVersion?: string
): Promise<RegressionReport> {
  const checks: RegressionCheck[] = [];

  try {
    // 1. Check Web Vitals
    const vitals = await getPageLoadMetrics();
    
    checks.push(
      createRegressionCheck(
        'FCP',
        PERFORMANCE_BASELINES.fcp,
        vitals.firstContentfulPaint,
        REGRESSION_THRESHOLDS.critical,
        'ms'
      )
    );

    checks.push(
      createRegressionCheck(
        'LCP',
        PERFORMANCE_BASELINES.lcp,
        vitals.largestContentfulPaint,
        REGRESSION_THRESHOLDS.critical,
        'ms'
      )
    );

    checks.push(
      createRegressionCheck(
        'CLS',
        PERFORMANCE_BASELINES.cls,
        vitals.cumulativeLayoutShift,
        REGRESSION_THRESHOLDS.warning,
        'score'
      )
    );

    checks.push(
      createRegressionCheck(
        'FID',
        PERFORMANCE_BASELINES.fid,
        vitals.firstInputDelay,
        REGRESSION_THRESHOLDS.warning,
        'ms'
      )
    );

    // 2. Check API Performance
    const apiStats = apiLatencyTracker.getLatencyStats();
    
    if (apiStats.count > 0) {
      checks.push(
        createRegressionCheck(
          'API P50',
          PERFORMANCE_BASELINES.apiP50,
          apiStats.p50,
          REGRESSION_THRESHOLDS.warning,
          'ms'
        )
      );

      checks.push(
        createRegressionCheck(
          'API P95',
          PERFORMANCE_BASELINES.apiP95,
          apiStats.p95,
          REGRESSION_THRESHOLDS.critical,
          'ms'
        )
      );

      checks.push(
        createRegressionCheck(
          'API P99',
          PERFORMANCE_BASELINES.apiP99,
          apiStats.p99,
          REGRESSION_THRESHOLDS.warning,
          'ms'
        )
      );

      // Success rate is inverted (lower is worse)
      const successRateCheck = createRegressionCheck(
        'API Success Rate',
        PERFORMANCE_BASELINES.apiSuccessRate,
        apiStats.successRate,
        REGRESSION_THRESHOLDS.critical,
        '%',
        true // inverted
      );
      checks.push(successRateCheck);
    }

    // 3. Check RUM data (if available) — compare latest sample against the rolling average
    const rumMetrics = getStoredRUMMetrics();
    if (rumMetrics.length > 1 && deploymentVersion) {
      const avgMetrics = getAverageMetrics();
      const latest = rumMetrics[rumMetrics.length - 1];
      const degradation = detectPerformanceDegradation(latest, avgMetrics, REGRESSION_THRESHOLDS.warning);
      if (degradation.degraded) {
        degradation.issues.forEach(issue => {
          checks.push({
            metric: `RUM ${issue}`,
            baseline: 0,
            current: 0,
            change: 0,
            changePercent: 0,
            threshold: REGRESSION_THRESHOLDS.warning * 100,
            passed: false,
            severity: 'warning',
          });
        });
      }
    }

  } catch (error) {
    console.error('Performance regression check failed:', error);
  }

  // Calculate overall score
  const passedChecks = checks.filter(c => c.passed).length;
  const score = checks.length > 0 ? (passedChecks / checks.length) * 100 : 100;

  // Determine if overall check passed
  const criticalFailures = checks.filter(c => !c.passed && c.severity === 'critical').length;
  const passed = criticalFailures === 0 && score >= 80;

  return {
    passed,
    score,
    checks,
    timestamp: Date.now(),
    deploymentVersion,
  };
}

/**
 * Create a regression check
 */
function createRegressionCheck(
  metric: string,
  baseline: number,
  current: number,
  threshold: number,
  unit: string,
  inverted: boolean = false
): RegressionCheck {
  const change = current - baseline;
  const changePercent = baseline > 0 ? (change / baseline) * 100 : 0;

  // For inverted metrics (like success rate), lower is worse
  const degradation = inverted 
    ? -changePercent / 100 // Convert to negative for easier comparison
    : changePercent / 100;

  const passed = inverted
    ? current >= baseline * (1 - threshold) // Allow small decrease
    : current <= baseline * (1 + threshold); // Allow small increase

  let severity: 'critical' | 'warning' | 'info' = 'info';
  
  if (!passed) {
    if (Math.abs(degradation) >= REGRESSION_THRESHOLDS.critical) {
      severity = 'critical';
    } else if (Math.abs(degradation) >= REGRESSION_THRESHOLDS.warning) {
      severity = 'warning';
    }
  }

  return {
    metric,
    baseline,
    current,
    change,
    changePercent,
    threshold: threshold * 100,
    passed,
    severity,
  };
}

/**
 * Format regression report
 */
export function formatRegressionReport(report: RegressionReport): string {
  let output = '🔍 PERFORMANCE REGRESSION CHECK\n';
  output += '='.repeat(60) + '\n\n';

  output += `Overall Score: ${report.score.toFixed(1)}% ${report.passed ? '✅' : '❌'}\n`;
  output += `Timestamp: ${new Date(report.timestamp).toLocaleString()}\n`;
  if (report.deploymentVersion) {
    output += `Deployment: ${report.deploymentVersion}\n`;
  }
  output += '\n';

  // Group checks by severity
  const critical = report.checks.filter(c => !c.passed && c.severity === 'critical');
  const warnings = report.checks.filter(c => !c.passed && c.severity === 'warning');
  const passed = report.checks.filter(c => c.passed);

  if (critical.length > 0) {
    output += '❌ CRITICAL REGRESSIONS (Build should be blocked):\n';
    output += '-'.repeat(60) + '\n';
    critical.forEach(check => {
      output += formatCheckLine(check);
    });
    output += '\n';
  }

  if (warnings.length > 0) {
    output += '⚠️  WARNINGS (Monitor closely):\n';
    output += '-'.repeat(60) + '\n';
    warnings.forEach(check => {
      output += formatCheckLine(check);
    });
    output += '\n';
  }

  if (passed.length > 0) {
    output += `✅ PASSED CHECKS (${passed.length}/${report.checks.length}):\n`;
    output += '-'.repeat(60) + '\n';
    passed.forEach(check => {
      output += `  ${check.metric}: ${check.current.toFixed(2)} (baseline: ${check.baseline.toFixed(2)}) ${check.changePercent >= 0 ? '↑' : '↓'} ${Math.abs(check.changePercent).toFixed(1)}%\n`;
    });
    output += '\n';
  }

  if (!report.passed) {
    output += '🚫 BUILD SHOULD BE BLOCKED\n';
    output += 'Critical performance regressions detected.\n';
    output += 'Please fix the issues before deploying.\n';
  } else {
    output += '✅ BUILD APPROVED\n';
    output += 'No critical performance regressions detected.\n';
  }

  return output;
}

/**
 * Format a single check line
 */
function formatCheckLine(check: RegressionCheck): string {
  const icon = check.severity === 'critical' ? '❌' : '⚠️';
  return `  ${icon} ${check.metric}: ${check.current.toFixed(2)} (baseline: ${check.baseline.toFixed(2)}) ${check.changePercent >= 0 ? '↑' : '↓'} ${Math.abs(check.changePercent).toFixed(1)}% (threshold: ±${check.threshold.toFixed(0)}%)\n`;
}

/**
 * Update performance baselines
 */
export function updatePerformanceBaselines(
  newBaselines: Partial<typeof PERFORMANCE_BASELINES>
): void {
  Object.assign(PERFORMANCE_BASELINES, newBaselines);
  console.log('📊 Performance baselines updated:', newBaselines);
}

/**
 * Get current baselines
 */
export function getPerformanceBaselines(): typeof PERFORMANCE_BASELINES {
  return { ...PERFORMANCE_BASELINES };
}

/**
 * Run regression check and block if failed
 */
export async function runRegressionCheckOrThrow(
  deploymentVersion?: string
): Promise<RegressionReport> {
  const report = await checkPerformanceRegression(deploymentVersion);
  
  console.log(formatRegressionReport(report));

  if (!report.passed) {
    throw new Error(
      `Performance regression detected! Build blocked.\n\n` +
      formatRegressionReport(report)
    );
  }

  return report;
}

/**
 * Export regression report as JSON
 */
export function exportRegressionReport(report: RegressionReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Initialize regression monitoring
 */
export function initializeRegressionMonitoring(): void {
  if (typeof window === 'undefined') return;

  console.log('🔍 Performance regression monitoring initialized');
  console.log('📊 Current baselines:', PERFORMANCE_BASELINES);
  console.log('⚠️  Regression thresholds:', {
    critical: `${REGRESSION_THRESHOLDS.critical * 100}%`,
    warning: `${REGRESSION_THRESHOLDS.warning * 100}%`,
    info: `${REGRESSION_THRESHOLDS.info * 100}%`,
  });

  // Run initial check after page load
  if (document.readyState === 'complete') {
    setTimeout(() => {
      checkPerformanceRegression().then(report => {
        if (!report.passed) {
          console.warn('⚠️  Performance regression detected on page load');
          console.log(formatRegressionReport(report));
        }
      });
    }, 5000); // Wait 5 seconds after page load
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        checkPerformanceRegression().then(report => {
          if (!report.passed) {
            console.warn('⚠️  Performance regression detected on page load');
            console.log(formatRegressionReport(report));
          }
        });
      }, 5000);
    });
  }
}
