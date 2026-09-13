import { getProductionValidationOrchestrator } from './productionValidationOrchestrator';
import { getAutomatedValidationRunner } from './automatedValidationRunner';
import { getSecurityAuditAutomation } from './securityAuditAutomation';
import { getInfrastructureValidation } from './infrastructureValidation';
import { getBetaTestingManager } from './betaTestingManager';

/**
 * SYSTEM TRIGGERS
 * Moves heavy monitoring and validation systems to manual trigger mode
 * to ensure stable and fast initial render.
 */
export function initializeManualTriggers(): void {
  if (typeof window === 'undefined') return;

  // Assign triggers to window object for manual execution via console or dashboard
  (window as any).runProductionValidation = () => {
    console.log('🚀 Starting Production Validation...');
    return getProductionValidationOrchestrator();
  };
  
  (window as any).runAutomatedValidation = () => {
    console.log('🚀 Starting Automated Validation...');
    return getAutomatedValidationRunner();
  };
  
  (window as any).runSecurityAudit = () => {
    console.log('🚀 Starting Security Audit...');
    return getSecurityAuditAutomation();
  };
  
  (window as any).runInfrastructureValidation = () => {
    console.log('🚀 Starting Infrastructure Validation...');
    return getInfrastructureValidation();
  };
  
  (window as any).runBetaTestingSetup = () => {
    console.log('🚀 Starting Beta Testing Setup...');
    return getBetaTestingManager();
  };
  
  (window as any).runAllDiagnostics = () => {
    console.log('🚀 Running All Diagnostic Tools...');
    getProductionValidationOrchestrator();
    getAutomatedValidationRunner();
    getSecurityAuditAutomation();
    getInfrastructureValidation();
  };

  console.log('%c🛠️ [System Triggers] Manual modes initialized. Access via console (e.g., window.runSecurityAudit())', 'color: #3b82f6; font-weight: bold');
}
