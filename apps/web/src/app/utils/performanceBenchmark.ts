/**
 * EZYIFY Escrow System - Performance Benchmark Utility
 * Automated performance testing and benchmarking
 */

import { 
  calculateSellerEarnings, 
  calculateWithdrawalAmount,
  validateWithdrawal,
  getDaysRemainingInEscrow,
  calculateSecurityScore,
  formatCurrency
} from './escrowHelpers';

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  status: 'pass' | 'warning' | 'fail';
}

interface BenchmarkSuite {
  name: string;
  timestamp: Date;
  results: BenchmarkResult[];
  summary: {
    totalTests: number;
    passed: number;
    warnings: number;
    failed: number;
    overallScore: number;
  };
}

/**
 * Performance thresholds (in milliseconds)
 */
const PERFORMANCE_THRESHOLDS = {
  calculation: {
    target: 1,      // 1ms
    warning: 5,     // 5ms
    critical: 10    // 10ms
  },
  validation: {
    target: 2,      // 2ms
    warning: 10,    // 10ms
    critical: 20    // 20ms
  },
  formatting: {
    target: 0.5,    // 0.5ms
    warning: 2,     // 2ms
    critical: 5     // 5ms
  }
};

/**
 * Run a single benchmark test
 */
function runBenchmark(
  name: string,
  fn: () => void,
  iterations: number = 1000,
  threshold: keyof typeof PERFORMANCE_THRESHOLDS = 'calculation'
): BenchmarkResult {
  const times: number[] = [];
  
  // Warm-up run
  for (let i = 0; i < 100; i++) {
    fn();
  }
  
  // Actual benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / averageTime;
  
  // Determine status based on thresholds
  const thresholds = PERFORMANCE_THRESHOLDS[threshold];
  let status: 'pass' | 'warning' | 'fail';
  
  if (averageTime <= thresholds.target) {
    status = 'pass';
  } else if (averageTime <= thresholds.warning) {
    status = 'warning';
  } else {
    status = 'fail';
  }
  
  return {
    operation: name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond,
    status
  };
}

/**
 * Run all benchmarks
 */
export function runAllBenchmarks(): BenchmarkSuite {
  console.log('🔥 Starting EZYIFY Escrow System Performance Benchmarks...\n');
  
  const results: BenchmarkResult[] = [];
  
  // Benchmark 1: Commission Calculation
  console.log('Testing commission calculations...');
  results.push(
    runBenchmark(
      'Calculate Seller Earnings (simple)',
      () => calculateSellerEarnings(100),
      10000,
      'calculation'
    )
  );
  
  results.push(
    runBenchmark(
      'Calculate Seller Earnings (large amount)',
      () => calculateSellerEarnings(999999.99),
      10000,
      'calculation'
    )
  );
  
  // Benchmark 2: Withdrawal Amount Calculation
  console.log('Testing withdrawal calculations...');
  results.push(
    runBenchmark(
      'Calculate Withdrawal Amount',
      () => calculateWithdrawalAmount(93.00),
      10000,
      'calculation'
    )
  );
  
  // Benchmark 3: Withdrawal Validation
  console.log('Testing withdrawal validation...');
  results.push(
    runBenchmark(
      'Validate Withdrawal (pass)',
      () => validateWithdrawal(50, 100, 0, 0, true, 14),
      5000,
      'validation'
    )
  );
  
  results.push(
    runBenchmark(
      'Validate Withdrawal (fail - insufficient balance)',
      () => validateWithdrawal(150, 100, 0, 0, true, 14),
      5000,
      'validation'
    )
  );
  
  results.push(
    runBenchmark(
      'Validate Withdrawal (fail - multiple checks)',
      () => validateWithdrawal(100, 50, 400, 1500, false, 5),
      5000,
      'validation'
    )
  );
  
  // Benchmark 4: Escrow Timeline Calculation
  console.log('Testing escrow timeline calculations...');
  const testDate = new Date();
  testDate.setDate(testDate.getDate() - 3);
  
  results.push(
    runBenchmark(
      'Calculate Days Remaining in Escrow',
      () => getDaysRemainingInEscrow(testDate),
      10000,
      'calculation'
    )
  );
  
  // Benchmark 5: Security Score Calculation
  console.log('Testing security score calculations...');
  results.push(
    runBenchmark(
      'Calculate Security Score (high score)',
      () => calculateSecurityScore({
        kycVerified: true,
        twoFactorEnabled: true,
        accountAgeDays: 60,
        verifiedPaymentMethods: 3,
        cleanTransactionHistory: true
      }),
      10000,
      'calculation'
    )
  );
  
  results.push(
    runBenchmark(
      'Calculate Security Score (low score)',
      () => calculateSecurityScore({
        kycVerified: false,
        twoFactorEnabled: false,
        accountAgeDays: 5,
        verifiedPaymentMethods: 0,
        cleanTransactionHistory: false
      }),
      10000,
      'calculation'
    )
  );
  
  // Benchmark 6: Currency Formatting
  console.log('Testing currency formatting...');
  results.push(
    runBenchmark(
      'Format Currency (simple)',
      () => formatCurrency(93.00),
      10000,
      'formatting'
    )
  );
  
  results.push(
    runBenchmark(
      'Format Currency (large amount)',
      () => formatCurrency(1234567.89),
      10000,
      'formatting'
    )
  );
  
  // Benchmark 7: Complex Workflow
  console.log('Testing complex workflows...');
  results.push(
    runBenchmark(
      'Complete Withdrawal Validation Workflow',
      () => {
        const earnings = calculateSellerEarnings(100);
        const withdrawal = calculateWithdrawalAmount(earnings.netEarnings);
        const validation = validateWithdrawal(
          withdrawal.requestedAmount,
          earnings.netEarnings,
          0,
          0,
          true,
          14
        );
        return { earnings, withdrawal, validation };
      },
      5000,
      'validation'
    )
  );
  
  results.push(
    runBenchmark(
      'Complete Security Scoring Workflow',
      () => {
        const score = calculateSecurityScore({
          kycVerified: true,
          twoFactorEnabled: true,
          accountAgeDays: 60,
          verifiedPaymentMethods: 3,
          cleanTransactionHistory: true
        });
        return score;
      },
      5000,
      'calculation'
    )
  );
  
  // Calculate summary
  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const overallScore = Math.round((passed / results.length) * 100);
  
  return {
    name: 'EZYIFY Escrow System Performance Benchmark',
    timestamp: new Date(),
    results,
    summary: {
      totalTests: results.length,
      passed,
      warnings,
      failed,
      overallScore
    }
  };
}

/**
 * Generate human-readable benchmark report
 */
export function generateBenchmarkReport(suite: BenchmarkSuite): string {
  const lines: string[] = [];
  
  lines.push('╔════════════════════════════════════════════════════════════════╗');
  lines.push('║    EZYIFY ESCROW SYSTEM - PERFORMANCE BENCHMARK REPORT         ║');
  lines.push('╚════════════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`Benchmark Suite: ${suite.name}`);
  lines.push(`Timestamp: ${suite.timestamp.toISOString()}`);
  lines.push(`Environment: ${typeof window !== 'undefined' ? 'Browser' : 'Node.js'}`);
  lines.push('');
  
  // Summary
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('SUMMARY');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push(`Total Tests: ${suite.summary.totalTests}`);
  lines.push(`✅ Passed: ${suite.summary.passed}`);
  lines.push(`⚠️  Warnings: ${suite.summary.warnings}`);
  lines.push(`❌ Failed: ${suite.summary.failed}`);
  lines.push(`Overall Score: ${suite.summary.overallScore}%`);
  lines.push('');
  
  // Detailed results
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('DETAILED RESULTS');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  
  suite.results.forEach((result, index) => {
    const statusIcon = 
      result.status === 'pass' ? '✅' :
      result.status === 'warning' ? '⚠️' : '❌';
    
    lines.push(`${index + 1}. ${statusIcon} ${result.operation}`);
    lines.push(`   Iterations: ${result.iterations.toLocaleString()}`);
    lines.push(`   Total Time: ${result.totalTime.toFixed(2)}ms`);
    lines.push(`   Average: ${result.averageTime.toFixed(3)}ms`);
    lines.push(`   Min: ${result.minTime.toFixed(3)}ms`);
    lines.push(`   Max: ${result.maxTime.toFixed(3)}ms`);
    lines.push(`   Operations/sec: ${Math.round(result.opsPerSecond).toLocaleString()}`);
    lines.push(`   Status: ${result.status.toUpperCase()}`);
    lines.push('');
  });
  
  // Performance categories
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('PERFORMANCE BY CATEGORY');
  lines.push('═══════════════════════════════════════════════════════════════');
  
  const categories = {
    'Calculations': suite.results.filter(r => r.operation.includes('Calculate') || r.operation.includes('Days')),
    'Validations': suite.results.filter(r => r.operation.includes('Validate')),
    'Formatting': suite.results.filter(r => r.operation.includes('Format')),
    'Workflows': suite.results.filter(r => r.operation.includes('Workflow'))
  };
  
  Object.entries(categories).forEach(([category, results]) => {
    if (results.length === 0) return;
    
    const avgTime = results.reduce((sum, r) => sum + r.averageTime, 0) / results.length;
    const passed = results.filter(r => r.status === 'pass').length;
    const percentage = Math.round((passed / results.length) * 100);
    
    lines.push(`${category}:`);
    lines.push(`  Tests: ${results.length}`);
    lines.push(`  Avg Time: ${avgTime.toFixed(3)}ms`);
    lines.push(`  Pass Rate: ${percentage}%`);
    lines.push('');
  });
  
  // Recommendations
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('RECOMMENDATIONS');
  lines.push('═══════════════════════════════════════════════════════════════');
  
  const slowTests = suite.results.filter(r => r.status === 'warning' || r.status === 'fail');
  
  if (slowTests.length === 0) {
    lines.push('✅ All tests passed performance targets!');
    lines.push('   System is performing optimally.');
  } else {
    lines.push(`⚠️  ${slowTests.length} test(s) need attention:`);
    lines.push('');
    slowTests.forEach(test => {
      lines.push(`• ${test.operation}`);
      lines.push(`  Current: ${test.averageTime.toFixed(3)}ms`);
      if (test.status === 'warning') {
        lines.push(`  Action: Monitor closely, consider optimization`);
      } else {
        lines.push(`  Action: URGENT - Optimize immediately`);
      }
      lines.push('');
    });
  }
  
  // Footer
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push('Note: All benchmarks ran with warm-up iterations to ensure');
  lines.push('JIT compilation and caching effects are accounted for.');
  lines.push('');
  lines.push('For production monitoring, see: MONITORING_OBSERVABILITY_GUIDE.md');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Compare two benchmark suites
 */
export function compareBenchmarks(
  baseline: BenchmarkSuite,
  current: BenchmarkSuite
): string {
  const lines: string[] = [];
  
  lines.push('╔════════════════════════════════════════════════════════════════╗');
  lines.push('║         PERFORMANCE BENCHMARK COMPARISON                       ║');
  lines.push('╚════════════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`Baseline: ${baseline.timestamp.toISOString()}`);
  lines.push(`Current:  ${current.timestamp.toISOString()}`);
  lines.push('');
  
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('PERFORMANCE CHANGES');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  
  current.results.forEach(currentResult => {
    const baselineResult = baseline.results.find(r => r.operation === currentResult.operation);
    
    if (!baselineResult) {
      lines.push(`🆕 ${currentResult.operation} (New Test)`);
      lines.push(`   Average: ${currentResult.averageTime.toFixed(3)}ms`);
      lines.push('');
      return;
    }
    
    const percentChange = ((currentResult.averageTime - baselineResult.averageTime) / baselineResult.averageTime) * 100;
    const improvement = percentChange < 0;
    const icon = 
      Math.abs(percentChange) < 5 ? '➡️' :
      improvement ? '⬆️' : '⬇️';
    
    lines.push(`${icon} ${currentResult.operation}`);
    lines.push(`   Baseline: ${baselineResult.averageTime.toFixed(3)}ms`);
    lines.push(`   Current:  ${currentResult.averageTime.toFixed(3)}ms`);
    lines.push(`   Change:   ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% ${improvement ? '(FASTER)' : '(SLOWER)'}`);
    
    if (Math.abs(percentChange) > 20) {
      lines.push(`   ⚠️  Significant change detected!`);
    }
    
    lines.push('');
  });
  
  return lines.join('\n');
}

/**
 * Export benchmark results
 */
export function exportBenchmarkResults(suite: BenchmarkSuite): string {
  return JSON.stringify(suite, null, 2);
}

/**
 * Run benchmarks and log results
 */
export function runAndLogBenchmarks(): void {
  console.log('Starting performance benchmarks...\n');
  
  const suite = runAllBenchmarks();
  const report = generateBenchmarkReport(suite);
  
  console.log('\n' + report);
  
  if (suite.summary.failed > 0) {
    console.error('\n❌ Some benchmarks failed performance targets!');
    console.error('Review the report above and optimize slow operations.\n');
  } else if (suite.summary.warnings > 0) {
    console.warn('\n⚠️  Some benchmarks are approaching performance limits.');
    console.warn('Consider optimization to maintain performance.\n');
  } else {
    console.log('\n✅ All benchmarks passed! System is performing optimally.\n');
  }
  
  // Export results
  if (typeof window === 'undefined') {
    // Node.js environment - save to file
    const fs = require('fs');
    const filename = `benchmark-${Date.now()}.json`;
    fs.writeFileSync(filename, exportBenchmarkResults(suite));
    console.log(`Results exported to: ${filename}\n`);
  }
}

/**
 * Quick performance check (runs subset of tests)
 */
export function quickPerformanceCheck(): boolean {
  console.log('Running quick performance check...\n');
  
  const criticalTests = [
    runBenchmark(
      'Calculate Seller Earnings',
      () => calculateSellerEarnings(100),
      1000,
      'calculation'
    ),
    runBenchmark(
      'Validate Withdrawal',
      () => validateWithdrawal(50, 100, 0, 0, true, 14),
      1000,
      'validation'
    ),
    runBenchmark(
      'Calculate Security Score',
      () => calculateSecurityScore({
        kycVerified: true,
        twoFactorEnabled: true,
        accountAgeDays: 60,
        verifiedPaymentMethods: 3,
        cleanTransactionHistory: true
      }),
      1000,
      'calculation'
    )
  ];
  
  const allPassed = criticalTests.every(test => test.status === 'pass');
  
  if (allPassed) {
    console.log('✅ Quick check passed! Core operations performing well.\n');
  } else {
    console.error('❌ Quick check failed! Review performance issues.\n');
    criticalTests.forEach(test => {
      if (test.status !== 'pass') {
        console.error(`  ${test.operation}: ${test.averageTime.toFixed(3)}ms (${test.status})`);
      }
    });
    console.log('');
  }
  
  return allPassed;
}

// Export all functions
export default {
  runAllBenchmarks,
  generateBenchmarkReport,
  compareBenchmarks,
  exportBenchmarkResults,
  runAndLogBenchmarks,
  quickPerformanceCheck
};
