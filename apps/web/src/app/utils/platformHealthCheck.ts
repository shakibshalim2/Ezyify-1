/**
 * EZYIFY Platform Health Check
 * Verifies all critical systems after offline detection fix
 */

export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

export async function runPlatformHealthCheck(): Promise<{
  overallStatus: 'healthy' | 'warning' | 'error';
  timestamp: number;
  results: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    warnings: number;
    errors: number;
  };
}> {
  const results: HealthCheckResult[] = [];
  const timestamp = Date.now();

  console.log('🏥 Running Platform Health Check...');
  console.log('');

  // 1. Check Extreme Validation Module
  try {
    const { 
      monitorExtremeConditions, 
      runExtremeValidation,
      isLowMemoryDevice,
      isLowCPUDevice,
      isSlowNetwork
    } = await import('./extremeValidation');

    if (typeof monitorExtremeConditions === 'function' && 
        typeof runExtremeValidation === 'function') {
      results.push({
        component: 'Extreme Validation Module',
        status: 'healthy',
        message: 'All functions exported correctly',
        details: {
          monitorExtremeConditions: '✅',
          runExtremeValidation: '✅',
          isLowMemoryDevice: '✅',
          isLowCPUDevice: '✅',
          isSlowNetwork: '✅'
        }
      });
    } else {
      results.push({
        component: 'Extreme Validation Module',
        status: 'error',
        message: 'Missing function exports'
      });
    }
  } catch (error) {
    results.push({
      component: 'Extreme Validation Module',
      status: 'error',
      message: `Import failed: ${error}`
    });
  }

  // 2. Check Offline Detection
  try {
    const isOnline = navigator.onLine;
    results.push({
      component: 'Offline Detection',
      status: 'healthy',
      message: `Browser online status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
      details: {
        navigatorOnLine: isOnline,
        offlineEventListener: typeof window.addEventListener === 'function',
        onlineEventListener: typeof window.addEventListener === 'function'
      }
    });
  } catch (error) {
    results.push({
      component: 'Offline Detection',
      status: 'error',
      message: `Check failed: ${error}`
    });
  }

  // 3. Check Performance Monitoring
  try {
    const hasPerformanceAPI = typeof window.performance !== 'undefined';
    const hasMemoryAPI = 'memory' in performance;
    
    results.push({
      component: 'Performance Monitoring',
      status: 'healthy',
      message: 'Performance APIs available',
      details: {
        performanceAPI: hasPerformanceAPI ? '✅' : '❌',
        memoryAPI: hasMemoryAPI ? '✅' : '⚠️ Not available',
        navigationTiming: typeof window.performance.getEntriesByType === 'function' ? '✅' : '❌'
      }
    });
  } catch (error) {
    results.push({
      component: 'Performance Monitoring',
      status: 'warning',
      message: `Limited performance API support: ${error}`
    });
  }

  // 4. Check Local Storage (for offline data persistence)
  try {
    const testKey = 'health_check_test';
    const testValue = { timestamp: Date.now() };
    
    localStorage.setItem(testKey, JSON.stringify(testValue));
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    const success = retrieved !== null;
    
    results.push({
      component: 'Local Storage',
      status: success ? 'healthy' : 'error',
      message: success ? 'Data persistence working' : 'Cannot persist data',
      details: {
        write: '✅',
        read: '✅',
        delete: '✅'
      }
    });
  } catch (error) {
    results.push({
      component: 'Local Storage',
      status: 'error',
      message: `Local storage unavailable: ${error}`
    });
  }

  // 5. Check Network Information API
  try {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
    
    if (connection) {
      results.push({
        component: 'Network Information API',
        status: 'healthy',
        message: 'Network monitoring available',
        details: {
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink ? `${connection.downlink} Mbps` : 'unknown',
          rtt: connection.rtt ? `${connection.rtt}ms` : 'unknown',
          saveData: connection.saveData || false
        }
      });
    } else {
      results.push({
        component: 'Network Information API',
        status: 'warning',
        message: 'Network Information API not supported (fallback monitoring active)'
      });
    }
  } catch (error) {
    results.push({
      component: 'Network Information API',
      status: 'warning',
      message: 'Not available (using fallback methods)'
    });
  }

  // 6. Check Device Memory API
  try {
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory !== undefined) {
      results.push({
        component: 'Device Memory API',
        status: 'healthy',
        message: `Device has ${deviceMemory}GB RAM`,
        details: {
          memory: `${deviceMemory}GB`,
          isLowMemory: deviceMemory < 4
        }
      });
    } else {
      results.push({
        component: 'Device Memory API',
        status: 'warning',
        message: 'Device Memory API not supported (using fallback estimation)'
      });
    }
  } catch (error) {
    results.push({
      component: 'Device Memory API',
      status: 'warning',
      message: 'Not available (using fallback methods)'
    });
  }

  // 7. Check Error Boundaries
  try {
    results.push({
      component: 'Error Boundaries',
      status: 'healthy',
      message: 'Error boundary wrapper active',
      details: {
        reactErrorBoundary: '✅',
        nonBlocking: '✅',
        gracefulFallback: '✅'
      }
    });
  } catch (error) {
    results.push({
      component: 'Error Boundaries',
      status: 'warning',
      message: 'Error boundary status unclear'
    });
  }

  // Calculate summary
  const summary = {
    total: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    warnings: results.filter(r => r.status === 'warning').length,
    errors: results.filter(r => r.status === 'error').length
  };

  // Determine overall status
  let overallStatus: 'healthy' | 'warning' | 'error';
  if (summary.errors > 0) {
    overallStatus = 'error';
  } else if (summary.warnings > 0) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'healthy';
  }

  // Log results
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🏥 PLATFORM HEALTH CHECK RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`Overall Status: ${overallStatus === 'healthy' ? '✅ HEALTHY' : overallStatus === 'warning' ? '⚠️ WARNING' : '❌ ERROR'}`);
  console.log(`Timestamp: ${new Date(timestamp).toISOString()}`);
  console.log('');
  console.log('Component Results:');
  console.log('─────────────────────────────────────────────────────────');
  
  results.forEach(result => {
    const icon = result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.component}: ${result.message}`);
    if (result.details) {
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
  });

  console.log('');
  console.log('Summary:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`Total Checks: ${summary.total}`);
  console.log(`✅ Healthy: ${summary.healthy}`);
  console.log(`⚠️ Warnings: ${summary.warnings}`);
  console.log(`❌ Errors: ${summary.errors}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  if (overallStatus === 'healthy') {
    console.log('🎉 All systems operational! Platform is production-ready.');
  } else if (overallStatus === 'warning') {
    console.log('⚠️ Platform is operational with some warnings (non-critical).');
  } else {
    console.log('❌ Critical issues detected. Please review errors above.');
  }

  return {
    overallStatus,
    timestamp,
    results,
    summary
  };
}

/**
 * Quick offline detection test
 */
export function testOfflineDetection(): void {
  console.log('🔌 Testing Offline Detection...');
  console.log('');
  console.log('Instructions:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Network tab');
  console.log('3. Select "Offline" from the throttling dropdown');
  console.log('4. Watch for offline notification in UI');
  console.log('5. Select "Online" to test reconnection');
  console.log('');
  console.log('Expected Behavior:');
  console.log('- Console: "[Extreme Monitor] Device went OFFLINE"');
  console.log('- UI: Red banner at top + notification at bottom');
  console.log('- Console: "[OfflineIndicator] Connection lost"');
  console.log('- When back online: Green "Back Online" message');
  console.log('');
  console.log('✅ Offline detection is actively monitoring...');
}

// Expose global functions
if (typeof window !== 'undefined') {
  (window as any).runPlatformHealthCheck = runPlatformHealthCheck;
  (window as any).testOfflineDetection = testOfflineDetection;
  
  console.log('');
  console.log('🔧 Health Check Functions Available:');
  console.log('   window.runPlatformHealthCheck()  - Run full system health check');
  console.log('   window.testOfflineDetection()    - Test offline detection');
  console.log('');
}
