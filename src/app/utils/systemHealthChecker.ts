/**
 * EZYIFY Escrow System - Health Checker
 * Automated system health verification utility
 */

import { FINANCIAL, TIME_PERIODS, SECURITY } from '../constants/escrowConstants';
import {
  calculateSellerEarnings,
  calculateWithdrawalAmount,
  validateWithdrawal,
  getDaysRemainingInEscrow,
  calculateSecurityScore,
  getRiskLevel
} from './escrowHelpers';

// Health check result types
interface HealthCheckResult {
  category: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: any;
  timestamp: Date;
}

interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;
  checks: HealthCheckResult[];
  timestamp: Date;
  summary: {
    passed: number;
    warnings: number;
    failed: number;
  };
}

/**
 * Run all health checks
 */
export async function runSystemHealthCheck(): Promise<SystemHealthReport> {
  const checks: HealthCheckResult[] = [];

  // Constants validation
  checks.push(...checkConstants());

  // Helper functions validation
  checks.push(...checkHelperFunctions());

  // Component integration checks
  checks.push(...checkComponentIntegration());

  // Security checks
  checks.push(...checkSecurityConfiguration());

  // Performance checks
  checks.push(...checkPerformanceMetrics());

  // Calculate summary
  const summary = {
    passed: checks.filter(c => c.status === 'pass').length,
    warnings: checks.filter(c => c.status === 'warning').length,
    failed: checks.filter(c => c.status === 'fail').length
  };

  // Calculate health score (0-100)
  const totalChecks = checks.length;
  const score = Math.round(
    ((summary.passed * 100) + (summary.warnings * 50)) / (totalChecks * 100) * 100
  );

  // Determine overall health
  let overall: 'healthy' | 'degraded' | 'critical';
  if (summary.failed > 0) {
    overall = 'critical';
  } else if (summary.warnings > 3) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }

  return {
    overall,
    score,
    checks,
    timestamp: new Date(),
    summary
  };
}

/**
 * Check constants are properly configured
 */
function checkConstants(): HealthCheckResult[] {
  const checks: HealthCheckResult[] = [];

  // Financial constants
  checks.push({
    category: 'Constants',
    status: FINANCIAL.DAILY_WITHDRAWAL_LIMIT === 500 ? 'pass' : 'fail',
    message: 'Daily withdrawal limit configured correctly',
    details: { expected: 500, actual: FINANCIAL.DAILY_WITHDRAWAL_LIMIT },
    timestamp: new Date()
  });

  checks.push({
    category: 'Constants',
    status: FINANCIAL.WEEKLY_WITHDRAWAL_LIMIT === 2000 ? 'pass' : 'fail',
    message: 'Weekly withdrawal limit configured correctly',
    details: { expected: 2000, actual: FINANCIAL.WEEKLY_WITHDRAWAL_LIMIT },
    timestamp: new Date()
  });

  checks.push({
    category: 'Constants',
    status: FINANCIAL.PLATFORM_FEE_PERCENTAGE === 0.05 ? 'pass' : 'fail',
    message: 'Platform fee configured correctly (5%)',
    details: { expected: 0.05, actual: FINANCIAL.PLATFORM_FEE_PERCENTAGE },
    timestamp: new Date()
  });

  checks.push({
    category: 'Constants',
    status: FINANCIAL.WITHDRAWAL_FEE === 0.50 ? 'pass' : 'fail',
    message: 'Withdrawal fee configured correctly',
    details: { expected: 0.50, actual: FINANCIAL.WITHDRAWAL_FEE },
    timestamp: new Date()
  });

  // Time period constants
  checks.push({
    category: 'Constants',
    status: TIME_PERIODS.ESCROW_HOLD_DAYS === 7 ? 'pass' : 'fail',
    message: 'Escrow hold period configured correctly',
    details: { expected: 7, actual: TIME_PERIODS.ESCROW_HOLD_DAYS },
    timestamp: new Date()
  });

  checks.push({
    category: 'Constants',
    status: TIME_PERIODS.MINIMUM_ACCOUNT_AGE_DAYS === 7 ? 'pass' : 'fail',
    message: 'Minimum account age configured correctly',
    details: { expected: 7, actual: TIME_PERIODS.MINIMUM_ACCOUNT_AGE_DAYS },
    timestamp: new Date()
  });

  // Security constants
  checks.push({
    category: 'Constants',
    status: SECURITY.SCORE_TOTAL_MAX === 100 ? 'pass' : 'fail',
    message: 'Security score maximum configured correctly',
    details: { expected: 100, actual: SECURITY.SCORE_TOTAL_MAX },
    timestamp: new Date()
  });

  return checks;
}

/**
 * Check helper functions work correctly
 */
function checkHelperFunctions(): HealthCheckResult[] {
  const checks: HealthCheckResult[] = [];

  // Test commission calculation
  try {
    const earnings = calculateSellerEarnings(100);
    const expectedNet = 93; // 100 - 5 - 2 = 93
    
    checks.push({
      category: 'Helper Functions',
      status: earnings.netEarnings === expectedNet ? 'pass' : 'fail',
      message: 'Commission calculation accurate',
      details: { 
        input: 100,
        expected: expectedNet, 
        actual: earnings.netEarnings,
        breakdown: earnings
      },
      timestamp: new Date()
    });
  } catch (error) {
    checks.push({
      category: 'Helper Functions',
      status: 'fail',
      message: 'Commission calculation error',
      details: { error: (error as Error).message },
      timestamp: new Date()
    });
  }

  // Test withdrawal amount calculation
  try {
    const withdrawal = calculateWithdrawalAmount(93);
    const expectedNet = 92.50; // 93 - 0.50 = 92.50
    
    checks.push({
      category: 'Helper Functions',
      status: withdrawal.netAmount === expectedNet ? 'pass' : 'fail',
      message: 'Withdrawal fee calculation accurate',
      details: { 
        input: 93,
        expected: expectedNet, 
        actual: withdrawal.netAmount 
      },
      timestamp: new Date()
    });
  } catch (error) {
    checks.push({
      category: 'Helper Functions',
      status: 'fail',
      message: 'Withdrawal calculation error',
      details: { error: (error as Error).message },
      timestamp: new Date()
    });
  }

  // Test withdrawal validation
  try {
    const validation = validateWithdrawal(50, 100, 0, 0, true, 14);
    
    checks.push({
      category: 'Helper Functions',
      status: validation.isValid ? 'pass' : 'fail',
      message: 'Withdrawal validation works correctly',
      details: { 
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      },
      timestamp: new Date()
    });
  } catch (error) {
    checks.push({
      category: 'Helper Functions',
      status: 'fail',
      message: 'Withdrawal validation error',
      details: { error: (error as Error).message },
      timestamp: new Date()
    });
  }

  // Test escrow timeline calculation
  try {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() - 3); // 3 days ago
    const daysRemaining = getDaysRemainingInEscrow(deliveryDate);
    
    checks.push({
      category: 'Helper Functions',
      status: daysRemaining === 4 ? 'pass' : 'warning',
      message: 'Escrow timeline calculation works',
      details: { 
        deliveryDate: deliveryDate.toISOString(),
        expected: 4, 
        actual: daysRemaining 
      },
      timestamp: new Date()
    });
  } catch (error) {
    checks.push({
      category: 'Helper Functions',
      status: 'fail',
      message: 'Escrow timeline calculation error',
      details: { error: (error as Error).message },
      timestamp: new Date()
    });
  }

  // Test security score calculation
  try {
    const score = calculateSecurityScore({
      kycVerified: true,
      twoFactorEnabled: true,
      accountAgeDays: 60,
      verifiedPaymentMethods: 3,
      cleanTransactionHistory: true
    });
    
    const expectedScore = 94; // 25+20+15+9+25 = 94
    
    checks.push({
      category: 'Helper Functions',
      status: score === expectedScore ? 'pass' : 'fail',
      message: 'Security score calculation accurate',
      details: { expected: expectedScore, actual: score },
      timestamp: new Date()
    });
  } catch (error) {
    checks.push({
      category: 'Helper Functions',
      status: 'fail',
      message: 'Security score calculation error',
      details: { error: (error as Error).message },
      timestamp: new Date()
    });
  }

  // Test risk level calculation
  try {
    const riskLevel = getRiskLevel(85);
    
    checks.push({
      category: 'Helper Functions',
      status: riskLevel === 'low' ? 'pass' : 'fail',
      message: 'Risk level classification accurate',
      details: { score: 85, expected: 'low', actual: riskLevel },
      timestamp: new Date()
    });
  } catch (error) {
    checks.push({
      category: 'Helper Functions',
      status: 'fail',
      message: 'Risk level calculation error',
      details: { error: (error as Error).message },
      timestamp: new Date()
    });
  }

  return checks;
}

/**
 * Check component integration
 */
function checkComponentIntegration(): HealthCheckResult[] {
  const checks: HealthCheckResult[] = [];

  // Check if running in browser
  if (typeof window === 'undefined') {
    checks.push({
      category: 'Component Integration',
      status: 'warning',
      message: 'Running in Node.js environment (component checks skipped)',
      timestamp: new Date()
    });
    return checks;
  }

  // Check if React is available
  checks.push({
    category: 'Component Integration',
    status: typeof React !== 'undefined' ? 'pass' : 'fail',
    message: 'React library available',
    timestamp: new Date()
  });

  return checks;
}

/**
 * Check security configuration
 */
function checkSecurityConfiguration(): HealthCheckResult[] {
  const checks: HealthCheckResult[] = [];

  // Check security score factors sum to 100
  const totalPoints = 
    SECURITY.SCORE_KYC_VERIFIED +
    SECURITY.SCORE_2FA_ENABLED +
    SECURITY.SCORE_ACCOUNT_AGE_MAX +
    SECURITY.SCORE_PAYMENT_METHODS_MAX +
    SECURITY.SCORE_CLEAN_HISTORY;

  checks.push({
    category: 'Security',
    status: totalPoints === 100 ? 'pass' : 'fail',
    message: 'Security score factors sum to 100',
    details: { expected: 100, actual: totalPoints },
    timestamp: new Date()
  });

  // Check risk thresholds are logical
  const thresholdsValid = 
    SECURITY.SCORE_LOW_RISK_THRESHOLD > SECURITY.SCORE_MEDIUM_RISK_THRESHOLD &&
    SECURITY.SCORE_MEDIUM_RISK_THRESHOLD > 0;

  checks.push({
    category: 'Security',
    status: thresholdsValid ? 'pass' : 'fail',
    message: 'Risk thresholds configured logically',
    details: {
      low: SECURITY.SCORE_LOW_RISK_THRESHOLD,
      medium: SECURITY.SCORE_MEDIUM_RISK_THRESHOLD
    },
    timestamp: new Date()
  });

  // Check account restrictions
  checks.push({
    category: 'Security',
    status: SECURITY.MAX_PAYMENT_METHODS === 5 ? 'pass' : 'warning',
    message: 'Payment method limit configured',
    details: { limit: SECURITY.MAX_PAYMENT_METHODS },
    timestamp: new Date()
  });

  return checks;
}

/**
 * Check performance metrics
 */
function checkPerformanceMetrics(): HealthCheckResult[] {
  const checks: HealthCheckResult[] = [];

  if (typeof window === 'undefined') {
    checks.push({
      category: 'Performance',
      status: 'warning',
      message: 'Performance checks require browser environment',
      timestamp: new Date()
    });
    return checks;
  }

  // Check if performance API is available
  if (window.performance) {
    checks.push({
      category: 'Performance',
      status: 'pass',
      message: 'Performance API available',
      timestamp: new Date()
    });

    // Check memory usage if available
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      checks.push({
        category: 'Performance',
        status: usagePercent < 90 ? 'pass' : 'warning',
        message: 'Memory usage within limits',
        details: {
          usedMB: (memory.usedJSHeapSize / 1048576).toFixed(2),
          limitMB: (memory.jsHeapSizeLimit / 1048576).toFixed(2),
          usagePercent: usagePercent.toFixed(1)
        },
        timestamp: new Date()
      });
    }
  } else {
    checks.push({
      category: 'Performance',
      status: 'warning',
      message: 'Performance API not available',
      timestamp: new Date()
    });
  }

  return checks;
}

/**
 * Generate human-readable health report
 */
export function generateHealthReport(health: SystemHealthReport): string {
  const lines: string[] = [];
  
  lines.push('╔═══════════════════════════════════════════════════════════════╗');
  lines.push('║         EZYIFY ESCROW SYSTEM - HEALTH CHECK REPORT            ║');
  lines.push('╚═══════════════════════════════════════════════════════════════╝');
  lines.push('');
  
  // Overall status
  const statusIcon = 
    health.overall === 'healthy' ? '✅' :
    health.overall === 'degraded' ? '⚠️' : '❌';
  
  lines.push(`Overall Status: ${statusIcon} ${health.overall.toUpperCase()}`);
  lines.push(`Health Score: ${health.score}/100`);
  lines.push(`Timestamp: ${health.timestamp.toLocaleString()}`);
  lines.push('');
  
  // Summary
  lines.push('Summary:');
  lines.push(`  ✅ Passed:   ${health.summary.passed}`);
  lines.push(`  ⚠️  Warnings: ${health.summary.warnings}`);
  lines.push(`  ❌ Failed:   ${health.summary.failed}`);
  lines.push('');
  
  // Detailed results by category
  const categories = [...new Set(health.checks.map(c => c.category))];
  
  categories.forEach(category => {
    const categoryChecks = health.checks.filter(c => c.category === category);
    const categoryPassed = categoryChecks.filter(c => c.status === 'pass').length;
    const categoryTotal = categoryChecks.length;
    
    lines.push(`${category}: ${categoryPassed}/${categoryTotal} passed`);
    
    categoryChecks.forEach(check => {
      const icon = 
        check.status === 'pass' ? '  ✅' :
        check.status === 'warning' ? '  ⚠️' : '  ❌';
      
      lines.push(`${icon} ${check.message}`);
      
      if (check.details && check.status !== 'pass') {
        lines.push(`     Details: ${JSON.stringify(check.details)}`);
      }
    });
    
    lines.push('');
  });
  
  // Recommendations
  if (health.overall !== 'healthy') {
    lines.push('Recommendations:');
    
    health.checks.filter(c => c.status === 'fail').forEach(check => {
      lines.push(`  • Fix: ${check.message}`);
    });
    
    if (health.summary.warnings > 0) {
      lines.push(`  • Review ${health.summary.warnings} warning(s)`);
    }
    
    lines.push('');
  }
  
  lines.push('═══════════════════════════════════════════════════════════════');
  
  return lines.join('\n');
}

/**
 * Log health report to console
 */
export async function logHealthCheck(): Promise<void> {
  console.log('Running system health check...\n');
  
  const health = await runSystemHealthCheck();
  const report = generateHealthReport(health);
  
  console.log(report);
  
  if (health.overall === 'critical') {
    console.error('⚠️ CRITICAL ISSUES DETECTED! Please fix immediately.');
  } else if (health.overall === 'degraded') {
    console.warn('⚠️ System degraded. Review warnings.');
  } else {
    console.log('✅ All systems operational!');
  }
}

/**
 * Quick health check (returns boolean)
 */
export async function isSystemHealthy(): Promise<boolean> {
  const health = await runSystemHealthCheck();
  return health.overall === 'healthy';
}

/**
 * Get specific category health
 */
export async function getCategoryHealth(category: string): Promise<{
  passed: number;
  total: number;
  status: 'pass' | 'warning' | 'fail';
}> {
  const health = await runSystemHealthCheck();
  const categoryChecks = health.checks.filter(c => c.category === category);
  
  const passed = categoryChecks.filter(c => c.status === 'pass').length;
  const total = categoryChecks.length;
  const failed = categoryChecks.filter(c => c.status === 'fail').length;
  
  return {
    passed,
    total,
    status: failed > 0 ? 'fail' : (passed === total ? 'pass' : 'warning')
  };
}

/**
 * Export health check for monitoring
 */
export async function exportHealthCheck(): Promise<string> {
  const health = await runSystemHealthCheck();
  return JSON.stringify(health, null, 2);
}

// Export all functions
export default {
  runSystemHealthCheck,
  generateHealthReport,
  logHealthCheck,
  isSystemHealthy,
  getCategoryHealth,
  exportHealthCheck
};
