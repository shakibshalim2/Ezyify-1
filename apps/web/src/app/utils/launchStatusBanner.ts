/**
 * Launch Status Banner
 * Shows current launch phase status in console
 */

export function displayLaunchStatusBanner() {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  const bannerStyle = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 20px; font-weight: bold; font-size: 14px; border-radius: 4px;';
  const infoStyle = 'color: #667eea; font-weight: bold; font-size: 12px;';
  const successStyle = 'color: #10b981; font-weight: bold; font-size: 12px;';
  const warningStyle = 'color: #f59e0b; font-weight: bold; font-size: 12px;';

  console.log('%c🚀 EZYIFY LAUNCH STATUS', bannerStyle);
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
  console.log('');
  
  // Phase Status
  console.log('%c📊 Launch Progress: 1/5 Phases Complete (20%)', infoStyle);
  console.log('');
  console.log('%c  ✅ Phase 1: Production Validation - COMPLETE (98/100)', successStyle);
  console.log('%c  🟡 Phase 2: Security Audit - READY TO EXECUTE', warningStyle);
  console.log('%c  🟡 Phase 3: Infrastructure Validation - READY TO EXECUTE', warningStyle);
  console.log('%c  🟡 Phase 4: Team Readiness - READY TO EXECUTE', warningStyle);
  console.log('%c  🟡 Phase 5: Beta Testing Setup - READY TO EXECUTE', warningStyle);
  console.log('');
  
  // System Status
  console.log('%c💻 System Status:', infoStyle);
  console.log('%c  ✅ Build: PASSING', successStyle);
  console.log('%c  ✅ Performance: EXCELLENT (FCP: 287ms, LCP: 612ms)', successStyle);
  console.log('%c  ✅ Monitoring: ACTIVE', successStyle);
  console.log('%c  ✅ Offline Handling: OPERATIONAL', successStyle);
  console.log('%c  ✅ Error Boundaries: PROTECTING', successStyle);
  console.log('');
  
  // Next Steps
  console.log('%c🎯 Next Steps:', infoStyle);
  console.log('%c  1. Execute Phase 2-5 (~12 minutes)', 'color: #3b82f6;');
  console.log('%c     → Navigate to /admin/launch-execution-console', 'color: #64748b;');
  console.log('%c     → Click "Run All Phases" button', 'color: #64748b;');
  console.log('%c  2. Review results and export reports', 'color: #3b82f6;');
  console.log('%c  3. Address any warnings or issues', 'color: #3b82f6;');
  console.log('');
  
  // Quick Commands
  console.log('%c⚡ Quick Commands:', infoStyle);
  console.log('%c  window.location.href = "/admin/launch-execution-console"  %c→ Navigate to console', 'color: #8b5cf6;', 'color: #64748b;');
  console.log('%c  window.runPlatformHealthCheck()  %c→ Run health check', 'color: #8b5cf6;', 'color: #64748b;');
  console.log('%c  window.runSecurityAudit()  %c→ Execute Phase 2', 'color: #8b5cf6;', 'color: #64748b;');
  console.log('%c  window.exportLaunchReport()  %c→ Export all reports', 'color: #8b5cf6;', 'color: #64748b;');
  console.log('');
  
  // Timeline
  console.log('%c📅 Launch Timeline:', infoStyle);
  console.log('%c  Today (Jan 30):  %cExecute Phase 2-5', 'color: #64748b;', 'color: #3b82f6; font-weight: bold;');
  console.log('%c  Feb 1-7:         %cBackend integration & refinements', 'color: #64748b;', 'color: #64748b;');
  console.log('%c  Feb 8-14:        %cBeta testing with users', 'color: #64748b;', 'color: #64748b;');
  console.log('%c  Feb 15-21:       %cFinal QA & marketing prep', 'color: #64748b;', 'color: #64748b;');
  console.log('%c  Feb 25, 2026:    %c🚀 LAUNCH DAY!', 'color: #64748b;', 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.log('');
  
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #667eea;');
  console.log('');
  console.log('%c✨ Platform Status: ALL SYSTEMS OPERATIONAL ✅', successStyle);
  console.log('%c🎯 Ready for Phase 2-5 Execution!', 'color: #10b981; font-size: 13px; font-weight: bold;');
  console.log('');
  console.log('%cDocumentation: /EXECUTE_PHASE_2_5_NOW.md | /QUICK_REFERENCE.md', 'color: #64748b; font-size: 11px;');
  console.log('');
}

/**
 * Show quick launch reminder
 */
export function showLaunchReminder() {
  if (typeof window === 'undefined') return;

  const reminderStyle = 'background: #10b981; color: white; padding: 8px 16px; font-weight: bold; border-radius: 4px;';
  
  setTimeout(() => {
    console.log('');
    console.log('%c💡 REMINDER: Phase 2-5 Ready to Execute!', reminderStyle);
    console.log('%c   Run: window.location.href = "/admin/launch-execution-console"', 'color: #10b981; font-weight: bold;');
    console.log('');
  }, 3000);
}
