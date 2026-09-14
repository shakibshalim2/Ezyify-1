/**
 * INITIALIZATION GUARD
 * Prevents blank screens by catching and handling critical initialization errors
 */

let initializationComplete = false;
const MAX_INITIALIZATION_TIME = 30000; // 30 seconds — allow time for Vite dep re-optimization

/**
 * Mark initialization as complete
 */
export function markInitializationComplete(): void {
  initializationComplete = true;
  console.log('[Init] ✅ Application initialization complete');
}

/**
 * Check if initialization is complete
 */
export function isInitializationComplete(): boolean {
  return initializationComplete;
}

/**
 * Set up initialization timeout guard
 * If app doesn't initialize within time limit, show error screen
 */
export function setupInitializationGuard(): void {
  if (typeof window === 'undefined') return;

  const timeout = setTimeout(() => {
    if (!initializationComplete) {
      console.error('[Init] ⚠️ Application failed to initialize within time limit');
      
      // Show emergency fallback UI
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = `
          <div style="
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0a0a0a;
            color: #fafafa;
            font-family: system-ui, -apple-system, sans-serif;
            padding: 1rem;
          ">
            <div style="
              max-width: 28rem;
              text-align: center;
            ">
              <div style="font-size: 4rem; margin-bottom: 1rem;">⏳</div>
              <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">
                Loading takes longer than expected
              </h1>
              <p style="color: #a1a1a1; margin-bottom: 1.5rem;">
                The application is taking longer to load. This might be due to a slow connection or browser cache issues.
              </p>
              <button 
                onclick="window.location.reload()" 
                style="
                  padding: 0.5rem 1rem;
                  background: #3b82f6;
                  color: white;
                  border: none;
                  border-radius: 0.375rem;
                  cursor: pointer;
                  font-size: 1rem;
                  font-weight: 500;
                "
                onmouseover="this.style.background='#2563eb'"
                onmouseout="this.style.background='#3b82f6'"
              >
                Reload Page
              </button>
            </div>
          </div>
        `;
      }
    }
  }, MAX_INITIALIZATION_TIME);

  // Clear timeout when initialization completes
  const originalMarkComplete = markInitializationComplete;
  (window as any).__markInitComplete = () => {
    clearTimeout(timeout);
    originalMarkComplete();
  };
}

/**
 * Safe initialization wrapper
 * Catches errors during initialization and shows fallback UI
 */
export function safeInitialize(fn: () => void): void {
  try {
    fn();
  } catch (error) {
    console.error('[Init] Critical initialization error:', error);
    
    // Show error UI
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          color: #fafafa;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 1rem;
        ">
          <div style="
            max-width: 28rem;
            text-align: center;
          ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">
              Failed to Start
            </h1>
            <p style="color: #a1a1a1; margin-bottom: 1.5rem;">
              The application failed to start properly. Please try reloading the page.
            </p>
            <details style="
              text-align: left;
              background: rgba(255, 255, 255, 0.05);
              padding: 1rem;
              border-radius: 0.5rem;
              margin-bottom: 1rem;
            ">
              <summary style="cursor: pointer; font-weight: 500; margin-bottom: 0.5rem;">
                Error Details
              </summary>
              <pre style="
                font-size: 0.75rem;
                color: #a1a1a1;
                overflow: auto;
                max-height: 8rem;
              ">${error instanceof Error ? error.message : String(error)}</pre>
            </details>
            <button 
              onclick="window.location.reload()" 
              style="
                padding: 0.5rem 1rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 500;
              "
              onmouseover="this.style.background='#2563eb'"
              onmouseout="this.style.background='#3b82f6'"
            >
              Reload Page
            </button>
          </div>
        </div>
      `;
    }
  }
}

/**
 * Check browser compatibility
 */
export function checkBrowserCompatibility(): boolean {
  if (typeof window === 'undefined') return false;

  const requiredFeatures = {
    Promise: typeof Promise !== 'undefined',
    Fetch: typeof fetch !== 'undefined',
    LocalStorage: typeof localStorage !== 'undefined',
    SessionStorage: typeof sessionStorage !== 'undefined',
    ES6: typeof Symbol !== 'undefined',
  };

  const missing = Object.entries(requiredFeatures)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  if (missing.length > 0) {
    console.warn('[Init] Missing browser features:', missing);
    return false;
  }

  return true;
}

/**
 * Initialize browser compatibility check
 */
export function initializeBrowserCheck(): void {
  if (!checkBrowserCompatibility()) {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          color: #fafafa;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 1rem;
        ">
          <div style="
            max-width: 28rem;
            text-align: center;
          ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🌐</div>
            <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">
              Browser Not Supported
            </h1>
            <p style="color: #a1a1a1; margin-bottom: 1.5rem;">
              Your browser doesn't support some features required by this application. 
              Please update your browser or use a modern browser like Chrome, Firefox, Safari, or Edge.
            </p>
          </div>
        </div>
      `;
    }
  }
}
