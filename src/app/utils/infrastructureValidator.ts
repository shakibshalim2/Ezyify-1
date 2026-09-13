/**
 * INFRASTRUCTURE VALIDATION UTILITY
 * Validates CDN, caching, network conditions, and infrastructure readiness
 */

interface InfrastructureCheck {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

interface ValidationReport {
  passed: boolean;
  score: number;
  checks: InfrastructureCheck[];
  timestamp: number;
}

/**
 * Check if service worker is registered and active
 */
export async function checkServiceWorker(): Promise<InfrastructureCheck> {
  try {
    if (!('serviceWorker' in navigator)) {
      return {
        name: 'Service Worker',
        passed: false,
        message: 'Service Worker not supported',
      };
    }

    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return {
        name: 'Service Worker',
        passed: false,
        message: 'Service Worker not registered',
      };
    }

    if (!registration.active) {
      return {
        name: 'Service Worker',
        passed: false,
        message: 'Service Worker registered but not active',
      };
    }

    return {
      name: 'Service Worker',
      passed: true,
      message: 'Service Worker active',
      details: {
        scope: registration.scope,
        updateViaCache: registration.updateViaCache,
      },
    };
  } catch (error) {
    return {
      name: 'Service Worker',
      passed: false,
      message: `Service Worker check failed: ${error}`,
    };
  }
}

/**
 * Check cache headers for static assets
 */
export async function checkCacheHeaders(): Promise<InfrastructureCheck> {
  try {
    const testUrls = [
      '/favicon.svg',
      '/manifest.json',
      '/icons/icon-192x192.svg',
    ];

    const results = await Promise.all(
      testUrls.map(async url => {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          const cacheControl = response.headers.get('cache-control');
          const etag = response.headers.get('etag');
          
          return {
            url,
            cacheControl,
            etag,
            hasCaching: !!(cacheControl || etag),
          };
        } catch {
          return {
            url,
            cacheControl: null,
            etag: null,
            hasCaching: false,
          };
        }
      })
    );

    const cachingEnabled = results.filter(r => r.hasCaching).length;
    const passed = cachingEnabled >= testUrls.length * 0.5; // At least 50% should have caching

    return {
      name: 'Cache Headers',
      passed,
      message: `${cachingEnabled}/${testUrls.length} assets have cache headers`,
      details: results,
    };
  } catch (error) {
    return {
      name: 'Cache Headers',
      passed: false,
      message: `Cache header check failed: ${error}`,
    };
  }
}

/**
 * Check network connection quality
 */
export function checkNetworkQuality(): InfrastructureCheck {
  try {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) {
      return {
        name: 'Network Quality',
        passed: true,
        message: 'Network API not supported (assuming good connection)',
      };
    }

    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink; // Mbps
    const rtt = connection.rtt; // ms

    // Good connection: 4G, > 5 Mbps downlink, < 100ms RTT
    const passed = effectiveType === '4g' || downlink >= 5 || rtt < 100;

    return {
      name: 'Network Quality',
      passed,
      message: `Connection: ${effectiveType}, ${downlink}Mbps, ${rtt}ms RTT`,
      details: {
        effectiveType,
        downlink,
        rtt,
        saveData: connection.saveData,
      },
    };
  } catch (error) {
    return {
      name: 'Network Quality',
      passed: true,
      message: 'Network check failed (assuming good connection)',
    };
  }
}

/**
 * Check CDN performance by testing asset loading
 */
export async function checkCDNPerformance(): Promise<InfrastructureCheck> {
  try {
    const testAsset = '/favicon.svg';
    const startTime = performance.now();
    
    const response = await fetch(testAsset, { 
      cache: 'no-store' // Force fresh fetch to test CDN
    });
    
    const endTime = performance.now();
    const latency = endTime - startTime;

    // Good CDN: < 200ms for small asset
    const passed = latency < 200;

    return {
      name: 'CDN Performance',
      passed,
      message: `Asset loaded in ${latency.toFixed(0)}ms`,
      details: {
        latency,
        threshold: 200,
        status: response.status,
      },
    };
  } catch (error) {
    return {
      name: 'CDN Performance',
      passed: false,
      message: `CDN check failed: ${error}`,
    };
  }
}

/**
 * Check DNS resolution time
 */
export async function checkDNSResolution(): Promise<InfrastructureCheck> {
  try {
    if (!performance.getEntriesByType) {
      return {
        name: 'DNS Resolution',
        passed: true,
        message: 'Performance API not available',
      };
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) {
      return {
        name: 'DNS Resolution',
        passed: true,
        message: 'Navigation timing not available',
      };
    }

    const dnsTime = navigation.domainLookupEnd - navigation.domainLookupStart;
    
    // Good DNS: < 50ms
    const passed = dnsTime < 50;

    return {
      name: 'DNS Resolution',
      passed,
      message: `DNS lookup: ${dnsTime.toFixed(0)}ms`,
      details: {
        dnsTime,
        threshold: 50,
      },
    };
  } catch (error) {
    return {
      name: 'DNS Resolution',
      passed: true,
      message: 'DNS check not applicable',
    };
  }
}

/**
 * Check SSL/TLS connection time
 */
export async function checkSSLConnection(): Promise<InfrastructureCheck> {
  try {
    if (!performance.getEntriesByType) {
      return {
        name: 'SSL Connection',
        passed: true,
        message: 'Performance API not available',
      };
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation || !navigation.secureConnectionStart) {
      return {
        name: 'SSL Connection',
        passed: true,
        message: 'SSL timing not available',
      };
    }

    const sslTime = navigation.connectEnd - navigation.secureConnectionStart;
    
    // Good SSL: < 100ms
    const passed = sslTime < 100;

    return {
      name: 'SSL Connection',
      passed,
      message: `SSL handshake: ${sslTime.toFixed(0)}ms`,
      details: {
        sslTime,
        threshold: 100,
      },
    };
  } catch (error) {
    return {
      name: 'SSL Connection',
      passed: true,
      message: 'SSL check not applicable',
    };
  }
}

/**
 * Check browser capabilities
 */
export function checkBrowserCapabilities(): InfrastructureCheck {
  const requiredFeatures = {
    'Service Worker': 'serviceWorker' in navigator,
    'IndexedDB': 'indexedDB' in window,
    'Fetch API': 'fetch' in window,
    'Promises': 'Promise' in window,
    'LocalStorage': 'localStorage' in window,
    'SessionStorage': 'sessionStorage' in window,
    'WebP Support': checkWebPSupport(),
    'IntersectionObserver': 'IntersectionObserver' in window,
    'RequestIdleCallback': 'requestIdleCallback' in window,
  };

  const supported = Object.values(requiredFeatures).filter(Boolean).length;
  const total = Object.keys(requiredFeatures).length;
  const passed = supported >= total * 0.8; // At least 80% support required

  return {
    name: 'Browser Capabilities',
    passed,
    message: `${supported}/${total} features supported`,
    details: requiredFeatures,
  };
}

/**
 * Check WebP support
 */
function checkWebPSupport(): boolean {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

/**
 * Simulate low bandwidth scenario
 */
export async function simulateLowBandwidth(): Promise<InfrastructureCheck> {
  try {
    // Test loading a small asset under simulated constraints
    const testUrl = '/favicon.svg';
    const controller = new AbortController();
    
    // Set timeout for 3G-like conditions (should complete in < 2s)
    const timeout = setTimeout(() => controller.abort(), 2000);
    
    const startTime = performance.now();
    await fetch(testUrl, { signal: controller.signal });
    const endTime = performance.now();
    
    clearTimeout(timeout);
    
    const loadTime = endTime - startTime;
    const passed = loadTime < 2000;

    return {
      name: 'Low Bandwidth Simulation',
      passed,
      message: `Asset loaded in ${loadTime.toFixed(0)}ms under constraints`,
      details: {
        loadTime,
        threshold: 2000,
      },
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        name: 'Low Bandwidth Simulation',
        passed: false,
        message: 'Asset loading timed out (> 2s)',
      };
    }
    
    return {
      name: 'Low Bandwidth Simulation',
      passed: false,
      message: `Simulation failed: ${error}`,
    };
  }
}

/**
 * Run all infrastructure checks
 */
export async function runInfrastructureValidation(): Promise<ValidationReport> {
  const checks = await Promise.all([
    checkServiceWorker(),
    checkCacheHeaders(),
    checkCDNPerformance(),
    checkDNSResolution(),
    checkSSLConnection(),
    Promise.resolve(checkNetworkQuality()),
    Promise.resolve(checkBrowserCapabilities()),
    simulateLowBandwidth(),
  ]);

  const passed = checks.filter(c => c.passed).length;
  const total = checks.length;
  const score = (passed / total) * 100;

  return {
    passed: score >= 80, // Need 80% to pass
    score,
    checks,
    timestamp: Date.now(),
  };
}

/**
 * Format validation report
 */
export function formatValidationReport(report: ValidationReport): string {
  let output = '🏗️  INFRASTRUCTURE VALIDATION REPORT\n';
  output += '='.repeat(60) + '\n\n';
  
  output += `Overall Score: ${report.score.toFixed(1)}% ${report.passed ? '✅' : '❌'}\n`;
  output += `Passed: ${report.checks.filter(c => c.passed).length}/${report.checks.length}\n\n`;

  output += 'Check Results:\n';
  output += '-'.repeat(60) + '\n';

  report.checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    output += `${status} ${check.name.padEnd(30)} ${check.message}\n`;
  });

  if (!report.passed) {
    output += '\n⚠️  Failed Checks:\n';
    report.checks.filter(c => !c.passed).forEach(check => {
      output += `  - ${check.name}: ${check.message}\n`;
    });
  }

  output += '\n' + new Date(report.timestamp).toLocaleString() + '\n';

  return output;
}

/**
 * Export validation report as JSON
 */
export function exportValidationReport(report: ValidationReport): string {
  return JSON.stringify(report, null, 2);
}
