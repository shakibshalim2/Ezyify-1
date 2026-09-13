/**
 * Infrastructure Validation Automation
 * Automated infrastructure testing and health checks
 */

interface InfrastructureTestResult {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime?: number;
  details: any;
  timestamp: string;
}

interface InfrastructureReport {
  timestamp: string;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  healthScore: number;
  components: InfrastructureTestResult[];
  recommendations: string[];
}

class InfrastructureValidation {
  private results: InfrastructureTestResult[] = [];

  /**
   * Run full infrastructure validation
   */
  async runFullInfrastructureCheck(): Promise<InfrastructureReport> {
    console.log('🏗️ Starting Infrastructure Validation...');
    
    this.results = [];

    // Run all infrastructure checks
    await this.checkCDNPerformance();
    await this.checkDNSResolution();
    await this.checkSSLCertificate();
    await this.checkAPIEndpoints();
    await this.checkDatabaseConnection();
    await this.checkStaticAssets();
    await this.checkLoadBalancer();
    await this.checkBackupSystem();
    await this.checkMonitoringSystem();
    await this.checkCacheSystem();

    return this.generateReport();
  }

  /**
   * Check CDN Performance
   */
  private async checkCDNPerformance(): Promise<void> {
    const component = 'CDN';
    const startTime = performance.now();
    
    try {
      // Test CDN by loading a static asset
      const testImage = '/favicon.svg';
      const response = await fetch(testImage, { method: 'HEAD' });
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Check CDN headers
      const hasCDN = response.headers.has('x-cache') || 
                     response.headers.has('cf-ray') ||
                     response.headers.has('x-amz-cf-id');
      
      const cacheControl = response.headers.get('cache-control') || '';
      const hasCaching = cacheControl.includes('max-age') || cacheControl.includes('public');
      
      const status = responseTime < 100 && hasCaching ? 'healthy' : 
                     responseTime < 500 ? 'warning' : 'critical';
      
      this.results.push({
        component,
        status,
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          hasCDN,
          hasCaching,
          cacheControl,
          responseTime: `${responseTime.toFixed(2)}ms`,
          status: response.status
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'critical',
        timestamp: new Date().toISOString(),
        details: {
          error: 'CDN check failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Check DNS Resolution
   */
  private async checkDNSResolution(): Promise<void> {
    const component = 'DNS';
    
    try {
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      // Check if custom domain is being used
      const isProductionDomain = !isLocalhost && !hostname.includes('preview');
      
      // DNS resolution time (approximated by navigation timing)
      const dnsTime = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const dnsLookupTime = dnsTime?.domainLookupEnd - dnsTime?.domainLookupStart;
      
      const status = isProductionDomain && dnsLookupTime < 100 ? 'healthy' :
                     !isProductionDomain ? 'warning' : 'critical';
      
      this.results.push({
        component,
        status,
        responseTime: dnsLookupTime,
        timestamp: new Date().toISOString(),
        details: {
          hostname,
          isProductionDomain,
          dnsLookupTime: dnsLookupTime ? `${dnsLookupTime.toFixed(2)}ms` : 'N/A',
          isLocalhost
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          error: 'DNS check inconclusive',
          message: 'Running in development mode'
        }
      });
    }
  }

  /**
   * Check SSL Certificate
   */
  private async checkSSLCertificate(): Promise<void> {
    const component = 'SSL/TLS';
    
    try {
      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost';
      
      // Check for mixed content
      const mixedContentDetected = Array.from(document.querySelectorAll('img, script, link'))
        .some(el => {
          const src = el.getAttribute('src') || el.getAttribute('href');
          return src && src.startsWith('http:') && !src.includes('localhost');
        });
      
      const status = isHTTPS && !mixedContentDetected ? 'healthy' :
                     isLocalhost ? 'warning' : 'critical';
      
      this.results.push({
        component,
        status,
        timestamp: new Date().toISOString(),
        details: {
          isHTTPS,
          isLocalhost,
          mixedContent: mixedContentDetected,
          protocol: window.location.protocol
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'critical',
        timestamp: new Date().toISOString(),
        details: {
          error: 'SSL check failed'
        }
      });
    }
  }

  /**
   * Check API Endpoints
   */
  private async checkAPIEndpoints(): Promise<void> {
    const component = 'API Endpoints';
    
    try {
      // Mock API check - replace with real API endpoints
      const endpoints = [
        '/api/health',
        '/api/status',
      ];
      
      const checks = await Promise.allSettled(
        endpoints.map(endpoint => 
          fetch(endpoint, { method: 'HEAD' })
            .then(r => ({ endpoint, ok: r.ok, status: r.status }))
            .catch(e => ({ endpoint, ok: false, error: e.message }))
        )
      );
      
      const allHealthy = checks.every(c => 
        c.status === 'fulfilled' && c.value.ok
      );
      
      // For mock/development, treat as warning
      const status = allHealthy ? 'healthy' : 'warning';
      
      this.results.push({
        component,
        status,
        timestamp: new Date().toISOString(),
        details: {
          endpointsChecked: endpoints.length,
          allHealthy,
          note: 'Mock endpoints - configure real API endpoints for production'
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          error: 'API endpoints not configured',
          note: 'Set up real API endpoints for production'
        }
      });
    }
  }

  /**
   * Check Database Connection
   */
  private async checkDatabaseConnection(): Promise<void> {
    const component = 'Database';
    
    try {
      // In frontend, we can't directly check DB
      // This would be done via API endpoint in real scenario
      
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          note: 'Database check requires backend API endpoint',
          recommendation: 'Create /api/health endpoint to check DB connection'
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          error: 'Database check requires backend implementation'
        }
      });
    }
  }

  /**
   * Check Static Assets
   */
  private async checkStaticAssets(): Promise<void> {
    const component = 'Static Assets';
    const startTime = performance.now();
    
    try {
      // Test loading critical assets
      const criticalAssets = [
        '/favicon.svg',
      ];
      
      const checks = await Promise.allSettled(
        criticalAssets.map(asset =>
          fetch(asset, { method: 'HEAD' })
            .then(r => ({ asset, ok: r.ok, status: r.status }))
        )
      );
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const allLoaded = checks.every(c => 
        c.status === 'fulfilled' && c.value.ok
      );
      
      const status = allLoaded && responseTime < 500 ? 'healthy' : 
                     allLoaded ? 'warning' : 'critical';
      
      this.results.push({
        component,
        status,
        responseTime,
        timestamp: new Date().toISOString(),
        details: {
          assetsChecked: criticalAssets.length,
          allLoaded,
          averageLoadTime: `${(responseTime / criticalAssets.length).toFixed(2)}ms`
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'critical',
        timestamp: new Date().toISOString(),
        details: {
          error: 'Static asset check failed'
        }
      });
    }
  }

  /**
   * Check Load Balancer
   */
  private async checkLoadBalancer(): Promise<void> {
    const component = 'Load Balancer';
    
    try {
      // Check for load balancer headers
      const response = await fetch(window.location.href, { method: 'HEAD' });
      
      const hasLoadBalancer = response.headers.has('x-load-balancer') ||
                             response.headers.has('x-forwarded-for') ||
                             response.headers.has('x-real-ip');
      
      const status = hasLoadBalancer ? 'healthy' : 'warning';
      
      this.results.push({
        component,
        status,
        timestamp: new Date().toISOString(),
        details: {
          hasLoadBalancer,
          note: hasLoadBalancer 
            ? 'Load balancer detected'
            : 'No load balancer detected - configure for production'
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          error: 'Load balancer check inconclusive'
        }
      });
    }
  }

  /**
   * Check Backup System
   */
  private async checkBackupSystem(): Promise<void> {
    const component = 'Backup System';
    
    try {
      // This requires backend verification
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          note: 'Backup system requires backend verification',
          recommendation: 'Verify automated backups are configured and tested'
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          error: 'Backup check requires backend implementation'
        }
      });
    }
  }

  /**
   * Check Monitoring System
   */
  private async checkMonitoringSystem(): Promise<void> {
    const component = 'Monitoring';
    
    try {
      // Check if performance monitoring is active
      const hasPerformanceAPI = 'performance' in window;
      const hasPerformanceObserver = 'PerformanceObserver' in window;
      const hasErrorTracking = '__errorCount' in window;
      
      const status = hasPerformanceAPI && hasPerformanceObserver ? 'healthy' : 'warning';
      
      this.results.push({
        component,
        status,
        timestamp: new Date().toISOString(),
        details: {
          performanceAPI: hasPerformanceAPI,
          performanceObserver: hasPerformanceObserver,
          errorTracking: hasErrorTracking,
          recommendation: 'Configure Datadog, New Relic, or similar for production'
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          error: 'Monitoring check failed'
        }
      });
    }
  }

  /**
   * Check Cache System
   */
  private async checkCacheSystem(): Promise<void> {
    const component = 'Cache';
    
    try {
      // Check browser cache
      const hasCacheAPI = 'caches' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      let swActive = false;
      if (hasServiceWorker) {
        const registration = await navigator.serviceWorker.getRegistration();
        swActive = registration?.active !== undefined;
      }
      
      const status = hasCacheAPI && swActive ? 'healthy' : 
                     hasCacheAPI ? 'warning' : 'critical';
      
      this.results.push({
        component,
        status,
        timestamp: new Date().toISOString(),
        details: {
          cacheAPI: hasCacheAPI,
          serviceWorker: hasServiceWorker,
          serviceWorkerActive: swActive,
          recommendation: swActive 
            ? 'Cache system operational'
            : 'Activate service worker for optimal caching'
        }
      });
    } catch (error) {
      this.results.push({
        component,
        status: 'warning',
        timestamp: new Date().toISOString(),
        details: {
          error: 'Cache check failed'
        }
      });
    }
  }

  /**
   * Generate infrastructure report
   */
  private generateReport(): InfrastructureReport {
    const healthyCount = this.results.filter(r => r.status === 'healthy').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const criticalCount = this.results.filter(r => r.status === 'critical').length;
    
    const healthScore = Math.round(
      ((healthyCount * 100) + (warningCount * 50)) / (this.results.length * 100) * 100
    );
    
    const overallHealth = criticalCount > 0 ? 'critical' :
                         warningCount > healthyCount ? 'degraded' : 'healthy';
    
    const recommendations: string[] = [];
    
    // Generate recommendations
    this.results.forEach(result => {
      if (result.status !== 'healthy') {
        if (result.component === 'CDN' && result.status === 'critical') {
          recommendations.push('Configure CDN for faster asset delivery');
        }
        if (result.component === 'SSL/TLS' && result.status === 'critical') {
          recommendations.push('Enable HTTPS and fix mixed content issues');
        }
        if (result.component === 'Database' && result.status === 'warning') {
          recommendations.push('Set up database health check endpoint');
        }
        if (result.component === 'Load Balancer' && result.status === 'warning') {
          recommendations.push('Configure load balancer for production');
        }
        if (result.component === 'Backup System' && result.status === 'warning') {
          recommendations.push('Verify automated backup system is operational');
        }
      }
    });
    
    const report: InfrastructureReport = {
      timestamp: new Date().toISOString(),
      overallHealth,
      healthScore,
      components: this.results,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
    
    // Log report
    console.log('🏗️ Infrastructure Health Report');
    console.log('================================');
    console.log(`Overall Health: ${overallHealth.toUpperCase()}`);
    console.log(`Health Score: ${healthScore}/100`);
    console.log(`Components: ${healthyCount} healthy, ${warningCount} warning, ${criticalCount} critical`);
    console.log('');
    
    // Log component status
    this.results.forEach(result => {
      const icon = result.status === 'healthy' ? '✅' :
                   result.status === 'warning' ? '⚠️' : '❌';
      const time = result.responseTime ? ` (${result.responseTime.toFixed(2)}ms)` : '';
      console.log(`${icon} ${result.component}${time}`);
    });
    
    // Log recommendations
    if (recommendations.length > 0) {
      console.log('');
      console.log('💡 Recommendations:');
      recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }
    
    return report;
  }

  /**
   * Export report
   */
  exportReport(report: InfrastructureReport): void {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infrastructure-check-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
let infrastructureInstance: InfrastructureValidation | null = null;

export function getInfrastructureValidation(): InfrastructureValidation {
  if (!infrastructureInstance) {
    infrastructureInstance = new InfrastructureValidation();
  }
  return infrastructureInstance;
}

// Global commands
if (typeof window !== 'undefined') {
  (window as any).runInfrastructureCheck = async () => {
    const infra = getInfrastructureValidation();
    const report = await infra.runFullInfrastructureCheck();
    
    console.log('');
    console.log('💡 To export report: window.exportInfrastructureReport()');
    
    (window as any).__infraReport = report;
    
    return report;
  };
  
  (window as any).exportInfrastructureReport = () => {
    const report = (window as any).__infraReport;
    if (!report) {
      console.log('❌ No report available. Run window.runInfrastructureCheck() first.');
      return;
    }
    
    const infra = getInfrastructureValidation();
    infra.exportReport(report);
    console.log('✅ Infrastructure report exported!');
  };
  
  console.log('🏗️ Infrastructure Validation Tool loaded. Use: window.runInfrastructureCheck()');
}
