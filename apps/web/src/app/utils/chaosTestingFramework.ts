/**
 * Chaos Testing Framework
 * Simulates real-world failures and network conditions
 * 
 * Tests platform resilience under:
 * - API failures and timeouts
 * - Network instability
 * - High load and concurrency
 * - Partial outages
 */

interface ChaosConfig {
  enabled: boolean;
  apiFailureRate: number;      // 0-1 (0 = no failures, 1 = all fail)
  apiDelayMin: number;          // Min delay in ms
  apiDelayMax: number;          // Max delay in ms
  networkLatency: number;       // Added latency in ms
  packetLossRate: number;       // 0-1 (simulated packet loss)
  timeoutRate: number;          // 0-1 (request timeout rate)
  serverErrorRate: number;      // 0-1 (500 error rate)
  partialOutageServices: string[]; // Services to simulate outage
}

interface ChaosMetrics {
  totalRequests: number;
  failedRequests: number;
  timedOutRequests: number;
  delayedRequests: number;
  averageDelay: number;
  uiBlocks: number;              // Should ALWAYS be 0
  blankScreens: number;          // Should ALWAYS be 0
  skeletonFailures: number;      // Should ALWAYS be 0
}

class ChaosTestingFramework {
  private config: ChaosConfig = {
    enabled: false,
    apiFailureRate: 0,
    apiDelayMin: 0,
    apiDelayMax: 0,
    networkLatency: 0,
    packetLossRate: 0,
    timeoutRate: 0,
    serverErrorRate: 0,
    partialOutageServices: [],
  };
  
  private metrics: ChaosMetrics = {
    totalRequests: 0,
    failedRequests: 0,
    timedOutRequests: 0,
    delayedRequests: 0,
    averageDelay: 0,
    uiBlocks: 0,
    blankScreens: 0,
    skeletonFailures: 0,
  };
  
  private originalFetch: typeof fetch;
  private monitoringInterval: number | null = null;
  
  constructor() {
    this.originalFetch = window.fetch.bind(window);
  }
  
  /**
   * Start chaos testing
   */
  public start(config: Partial<ChaosConfig> = {}): void {
    this.config = { ...this.config, ...config, enabled: true };
    this.resetMetrics();
    this.interceptFetch();
    this.startUIMonitoring();
    
    console.log('%c🔥 CHAOS TESTING STARTED', 'color: red; font-weight: bold; font-size: 16px;');
    console.log('[Chaos] Config:', this.config);
  }
  
  /**
   * Stop chaos testing
   */
  public stop(): void {
    this.config.enabled = false;
    this.restoreFetch();
    this.stopUIMonitoring();
    
    console.log('%c✅ CHAOS TESTING STOPPED', 'color: green; font-weight: bold; font-size: 16px;');
    console.log('[Chaos] Final Metrics:', this.metrics);
    console.log('[Chaos] CRITICAL:', {
      uiBlocks: this.metrics.uiBlocks,
      blankScreens: this.metrics.blankScreens,
      skeletonFailures: this.metrics.skeletonFailures,
    });
  }
  
  /**
   * Reset metrics
   */
  private resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      failedRequests: 0,
      timedOutRequests: 0,
      delayedRequests: 0,
      averageDelay: 0,
      uiBlocks: 0,
      blankScreens: 0,
      skeletonFailures: 0,
    };
  }
  
  /**
   * Intercept fetch to inject failures
   */
  private interceptFetch(): void {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      if (!this.config.enabled) {
        return this.originalFetch(input, init);
      }
      
      this.metrics.totalRequests++;
      
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Check if service is in partial outage
      const isOutage = this.config.partialOutageServices.some(service => url.includes(service));
      if (isOutage) {
        this.metrics.failedRequests++;
        console.warn(`[Chaos] Partial outage: ${url}`);
        throw new Error('Service unavailable (chaos)');
      }
      
      // Simulate packet loss
      if (Math.random() < this.config.packetLossRate) {
        this.metrics.failedRequests++;
        console.warn(`[Chaos] Packet loss: ${url}`);
        throw new Error('Network error (chaos)');
      }
      
      // Simulate timeout
      if (Math.random() < this.config.timeoutRate) {
        this.metrics.timedOutRequests++;
        console.warn(`[Chaos] Timeout: ${url}`);
        await this.sleep(30000); // 30s timeout
        throw new Error('Request timeout (chaos)');
      }
      
      // Add network latency
      if (this.config.networkLatency > 0) {
        await this.sleep(this.config.networkLatency);
      }
      
      // Add random delay
      if (this.config.apiDelayMax > 0) {
        const delay = this.randomDelay(this.config.apiDelayMin, this.config.apiDelayMax);
        if (delay > 0) {
          this.metrics.delayedRequests++;
          this.metrics.averageDelay = 
            (this.metrics.averageDelay * (this.metrics.delayedRequests - 1) + delay) / 
            this.metrics.delayedRequests;
          await this.sleep(delay);
        }
      }
      
      // Simulate API failure
      if (Math.random() < this.config.apiFailureRate) {
        this.metrics.failedRequests++;
        console.warn(`[Chaos] API failure: ${url}`);
        
        // Return 500 error
        if (Math.random() < this.config.serverErrorRate) {
          return new Response(JSON.stringify({ error: 'Internal server error (chaos)' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error('API request failed (chaos)');
      }
      
      // Make actual request
      return this.originalFetch(input, init);
    };
  }
  
  /**
   * Restore original fetch
   */
  private restoreFetch(): void {
    window.fetch = this.originalFetch;
  }
  
  /**
   * Monitor UI for blocks and blank screens
   */
  private startUIMonitoring(): void {
    let lastFrameTime = performance.now();
    let blankScreenCheckCount = 0;
    
    const checkUI = () => {
      const now = performance.now();
      const frameDuration = now - lastFrameTime;
      lastFrameTime = now;
      
      // Check for UI freeze (>100ms frame time)
      if (frameDuration > 100) {
        this.metrics.uiBlocks++;
        console.error(`[Chaos] ❌ UI BLOCK DETECTED: ${frameDuration.toFixed(2)}ms`);
      }
      
      // Check for blank screen (every 100 checks)
      blankScreenCheckCount++;
      if (blankScreenCheckCount >= 100) {
        blankScreenCheckCount = 0;
        if (this.isBlankScreen()) {
          this.metrics.blankScreens++;
          console.error('[Chaos] ❌ BLANK SCREEN DETECTED');
        }
      }
      
      // Check skeleton presence
      if (!this.hasSkeletonOrContent()) {
        this.metrics.skeletonFailures++;
        console.error('[Chaos] ❌ NO SKELETON OR CONTENT');
      }
    };
    
    this.monitoringInterval = window.setInterval(checkUI, 100);
  }
  
  /**
   * Stop UI monitoring
   */
  private stopUIMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  /**
   * Check if screen is blank
   */
  private isBlankScreen(): boolean {
    const root = document.getElementById('root');
    if (!root) return true;
    
    // Check if root has any visible content
    const hasContent = root.children.length > 0;
    const hasText = (root.textContent || '').trim().length > 0;
    
    return !hasContent && !hasText;
  }
  
  /**
   * Check if skeleton or content is present
   */
  private hasSkeletonOrContent(): boolean {
    // Check for skeleton elements
    const hasSkeleton = document.querySelector('.animate-pulse, [class*="skeleton"]');
    
    // Check for actual content
    const hasContent = document.querySelector('main, [role="main"]');
    
    return !!(hasSkeleton || hasContent);
  }
  
  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Generate random delay
   */
  private randomDelay(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  
  /**
   * Get current metrics
   */
  public getMetrics(): ChaosMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get current config
   */
  public getConfig(): ChaosConfig {
    return { ...this.config };
  }
  
  /**
   * Print detailed report
   */
  public printReport(): void {
    console.log('%c📊 CHAOS TESTING REPORT', 'color: blue; font-weight: bold; font-size: 16px;');
    console.log('━'.repeat(60));
    
    console.log('\n📈 Request Metrics:');
    console.log(`  Total Requests:    ${this.metrics.totalRequests}`);
    console.log(`  Failed Requests:   ${this.metrics.failedRequests}`);
    console.log(`  Timed Out:         ${this.metrics.timedOutRequests}`);
    console.log(`  Delayed Requests:  ${this.metrics.delayedRequests}`);
    console.log(`  Average Delay:     ${this.metrics.averageDelay.toFixed(2)}ms`);
    
    const failureRate = this.metrics.totalRequests > 0 
      ? (this.metrics.failedRequests / this.metrics.totalRequests * 100).toFixed(2)
      : '0.00';
    console.log(`  Failure Rate:      ${failureRate}%`);
    
    console.log('\n🎯 CRITICAL METRICS (Must be 0):');
    const allPassed = 
      this.metrics.uiBlocks === 0 &&
      this.metrics.blankScreens === 0 &&
      this.metrics.skeletonFailures === 0;
    
    const status = allPassed ? '✅ PASS' : '❌ FAIL';
    const color = allPassed ? 'green' : 'red';
    
    console.log(`%c  UI Blocks:         ${this.metrics.uiBlocks} ${this.metrics.uiBlocks === 0 ? '✅' : '❌'}`, `color: ${this.metrics.uiBlocks === 0 ? 'green' : 'red'}`);
    console.log(`%c  Blank Screens:     ${this.metrics.blankScreens} ${this.metrics.blankScreens === 0 ? '✅' : '❌'}`, `color: ${this.metrics.blankScreens === 0 ? 'green' : 'red'}`);
    console.log(`%c  Skeleton Failures: ${this.metrics.skeletonFailures} ${this.metrics.skeletonFailures === 0 ? '✅' : '❌'}`, `color: ${this.metrics.skeletonFailures === 0 ? 'green' : 'red'}`);
    
    console.log(`\n%c🎯 Overall Result: ${status}`, `color: ${color}; font-weight: bold; font-size: 14px;`);
    console.log('━'.repeat(60));
  }
}

// Global instance
let chaosFramework: ChaosTestingFramework | null = null;

/**
 * Get or create chaos framework instance
 */
export function getChaosFramework(): ChaosTestingFramework {
  if (!chaosFramework) {
    chaosFramework = new ChaosTestingFramework();
    (window as any).__chaos = chaosFramework;
  }
  return chaosFramework;
}

/**
 * Start chaos testing with preset scenarios
 */
export function startChaosTest(scenario: 'light' | 'moderate' | 'severe' | 'extreme'): void {
  const framework = getChaosFramework();
  
  const scenarios = {
    light: {
      apiFailureRate: 0.05,      // 5% failure
      apiDelayMin: 100,
      apiDelayMax: 500,
      networkLatency: 50,
      packetLossRate: 0.01,      // 1% packet loss
      timeoutRate: 0.01,
      serverErrorRate: 0.5,
    },
    moderate: {
      apiFailureRate: 0.15,      // 15% failure
      apiDelayMin: 200,
      apiDelayMax: 2000,
      networkLatency: 200,
      packetLossRate: 0.05,      // 5% packet loss
      timeoutRate: 0.03,
      serverErrorRate: 0.6,
    },
    severe: {
      apiFailureRate: 0.30,      // 30% failure
      apiDelayMin: 500,
      apiDelayMax: 5000,
      networkLatency: 500,
      packetLossRate: 0.10,      // 10% packet loss
      timeoutRate: 0.05,
      serverErrorRate: 0.7,
    },
    extreme: {
      apiFailureRate: 0.50,      // 50% failure
      apiDelayMin: 1000,
      apiDelayMax: 10000,
      networkLatency: 1000,
      packetLossRate: 0.20,      // 20% packet loss
      timeoutRate: 0.10,
      serverErrorRate: 0.8,
    },
  };
  
  framework.start(scenarios[scenario]);
  console.log(`%c🔥 Started ${scenario.toUpperCase()} chaos test`, 'color: orange; font-weight: bold;');
}

/**
 * Stop chaos testing
 */
export function stopChaosTest(): void {
  const framework = getChaosFramework();
  framework.stop();
  framework.printReport();
}

/**
 * Run chaos test for specific duration
 */
export async function runChaosTestFor(
  scenario: 'light' | 'moderate' | 'severe' | 'extreme',
  durationMs: number
): Promise<ChaosMetrics> {
  return new Promise((resolve) => {
    startChaosTest(scenario);
    
    setTimeout(() => {
      const metrics = getChaosFramework().getMetrics();
      stopChaosTest();
      resolve(metrics);
    }, durationMs);
  });
}

/**
 * Test specific service outage
 */
export function testPartialOutage(services: string[]): void {
  const framework = getChaosFramework();
  framework.start({
    partialOutageServices: services,
  });
  console.log(`%c🔥 Testing partial outage for: ${services.join(', ')}`, 'color: orange; font-weight: bold;');
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).startChaosTest = startChaosTest;
  (window as any).stopChaosTest = stopChaosTest;
  (window as any).runChaosTestFor = runChaosTestFor;
  (window as any).testPartialOutage = testPartialOutage;
}

export default ChaosTestingFramework;
