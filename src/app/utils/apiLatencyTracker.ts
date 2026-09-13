/**
 * API LATENCY TRACKER
 * Tracks P50, P95, P99 latencies for all API endpoints
 * Enables performance regression detection
 */

interface LatencyRecord {
  endpoint: string;
  latency: number;
  timestamp: number;
  status: number;
  attempt: number;
}

class APILatencyTracker {
  private records: LatencyRecord[] = [];
  private readonly maxRecords = 1000;
  private readonly alertThresholds = {
    p50: 200, // 200ms
    p95: 500, // 500ms
    p99: 1000, // 1 second
  };

  /**
   * Record an API call latency
   */
  recordLatency(
    endpoint: string,
    latency: number,
    status: number,
    attempt: number = 1
  ): void {
    this.records.push({
      endpoint,
      latency,
      timestamp: Date.now(),
      status,
      attempt,
    });

    // Keep only recent records
    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(-this.maxRecords);
    }
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Get latency statistics for an endpoint
   */
  getLatencyStats(endpoint?: string): {
    p50: number;
    p95: number;
    p99: number;
    avg: number;
    min: number;
    max: number;
    count: number;
    successRate: number;
  } {
    let filteredRecords = this.records;
    
    if (endpoint) {
      filteredRecords = this.records.filter(r => r.endpoint === endpoint);
    }

    if (filteredRecords.length === 0) {
      return {
        p50: 0,
        p95: 0,
        p99: 0,
        avg: 0,
        min: 0,
        max: 0,
        count: 0,
        successRate: 100,
      };
    }

    const latencies = filteredRecords.map(r => r.latency).sort((a, b) => a - b);
    const successCount = filteredRecords.filter(r => r.status >= 200 && r.status < 300).length;

    return {
      p50: this.calculatePercentile(latencies, 50),
      p95: this.calculatePercentile(latencies, 95),
      p99: this.calculatePercentile(latencies, 99),
      avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      min: latencies[0],
      max: latencies[latencies.length - 1],
      count: filteredRecords.length,
      successRate: (successCount / filteredRecords.length) * 100,
    };
  }

  /**
   * Get all unique endpoints
   */
  getEndpoints(): string[] {
    const endpoints = new Set(this.records.map(r => r.endpoint));
    return Array.from(endpoints).sort();
  }

  /**
   * Get latency stats for all endpoints
   */
  getAllEndpointStats(): Map<string, ReturnType<typeof this.getLatencyStats>> {
    const stats = new Map();
    const endpoints = this.getEndpoints();
    
    endpoints.forEach(endpoint => {
      stats.set(endpoint, this.getLatencyStats(endpoint));
    });
    
    return stats;
  }

  /**
   * Check if any endpoint exceeds thresholds
   */
  checkThresholds(): {
    passed: boolean;
    violations: Array<{
      endpoint: string;
      metric: 'p50' | 'p95' | 'p99';
      actual: number;
      threshold: number;
    }>;
  } {
    const violations: Array<{
      endpoint: string;
      metric: 'p50' | 'p95' | 'p99';
      actual: number;
      threshold: number;
    }> = [];

    const endpoints = this.getEndpoints();
    
    endpoints.forEach(endpoint => {
      const stats = this.getLatencyStats(endpoint);
      
      if (stats.p50 > this.alertThresholds.p50) {
        violations.push({
          endpoint,
          metric: 'p50',
          actual: stats.p50,
          threshold: this.alertThresholds.p50,
        });
      }
      
      if (stats.p95 > this.alertThresholds.p95) {
        violations.push({
          endpoint,
          metric: 'p95',
          actual: stats.p95,
          threshold: this.alertThresholds.p95,
        });
      }
      
      if (stats.p99 > this.alertThresholds.p99) {
        violations.push({
          endpoint,
          metric: 'p99',
          actual: stats.p99,
          threshold: this.alertThresholds.p99,
        });
      }
    });

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Get slowest endpoints
   */
  getSlowestEndpoints(limit: number = 10): Array<{
    endpoint: string;
    p95: number;
    count: number;
  }> {
    const stats = this.getAllEndpointStats();
    const entries = Array.from(stats.entries());
    
    return entries
      .map(([endpoint, stats]) => ({
        endpoint,
        p95: stats.p95,
        count: stats.count,
      }))
      .sort((a, b) => b.p95 - a.p95)
      .slice(0, limit);
  }

  /**
   * Get endpoints with low success rate
   */
  getUnreliableEndpoints(threshold: number = 95): Array<{
    endpoint: string;
    successRate: number;
    count: number;
  }> {
    const stats = this.getAllEndpointStats();
    const entries = Array.from(stats.entries());
    
    return entries
      .map(([endpoint, stats]) => ({
        endpoint,
        successRate: stats.successRate,
        count: stats.count,
      }))
      .filter(e => e.successRate < threshold)
      .sort((a, b) => a.successRate - b.successRate);
  }

  /**
   * Export latency data for analysis
   */
  exportData(): string {
    return JSON.stringify({
      recordCount: this.records.length,
      endpoints: this.getEndpoints().length,
      overallStats: this.getLatencyStats(),
      endpointStats: Array.from(this.getAllEndpointStats().entries()),
      slowestEndpoints: this.getSlowestEndpoints(),
      unreliableEndpoints: this.getUnreliableEndpoints(),
      thresholdCheck: this.checkThresholds(),
      records: this.records,
    }, null, 2);
  }

  /**
   * Clear all records
   */
  clear(): void {
    this.records = [];
  }

  /**
   * Get summary report
   */
  getSummaryReport(): string {
    const overall = this.getLatencyStats();
    const slowest = this.getSlowestEndpoints(5);
    const unreliable = this.getUnreliableEndpoints();
    const thresholds = this.checkThresholds();

    let report = '📊 API LATENCY REPORT\n';
    report += '='.repeat(50) + '\n\n';
    
    report += '📈 Overall Statistics:\n';
    report += `  Total Requests: ${overall.count}\n`;
    report += `  Success Rate: ${overall.successRate.toFixed(1)}%\n`;
    report += `  P50: ${overall.p50.toFixed(0)}ms\n`;
    report += `  P95: ${overall.p95.toFixed(0)}ms\n`;
    report += `  P99: ${overall.p99.toFixed(0)}ms\n`;
    report += `  Avg: ${overall.avg.toFixed(0)}ms\n`;
    report += `  Min: ${overall.min.toFixed(0)}ms\n`;
    report += `  Max: ${overall.max.toFixed(0)}ms\n\n`;

    if (slowest.length > 0) {
      report += '🐌 Slowest Endpoints (P95):\n';
      slowest.forEach((endpoint, index) => {
        report += `  ${index + 1}. ${endpoint.endpoint}: ${endpoint.p95.toFixed(0)}ms (${endpoint.count} calls)\n`;
      });
      report += '\n';
    }

    if (unreliable.length > 0) {
      report += '⚠️  Unreliable Endpoints (< 95% success):\n';
      unreliable.forEach(endpoint => {
        report += `  - ${endpoint.endpoint}: ${endpoint.successRate.toFixed(1)}% (${endpoint.count} calls)\n`;
      });
      report += '\n';
    }

    if (!thresholds.passed) {
      report += '❌ Threshold Violations:\n';
      thresholds.violations.forEach(v => {
        report += `  - ${v.endpoint} [${v.metric.toUpperCase()}]: ${v.actual.toFixed(0)}ms > ${v.threshold}ms\n`;
      });
      report += '\n';
    } else {
      report += '✅ All endpoints within thresholds\n\n';
    }

    return report;
  }
}

// Export singleton instance
export const apiLatencyTracker = new APILatencyTracker();

// Export class for testing
export default APILatencyTracker;
