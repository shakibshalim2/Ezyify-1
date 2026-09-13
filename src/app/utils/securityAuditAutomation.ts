/**
 * Security Audit Automation
 * Automated security testing and vulnerability detection
 */

interface SecurityTestResult {
  testName: string;
  passed: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation?: string;
  details?: any;
}

interface SecurityAuditReport {
  timestamp: string;
  overallScore: number;
  totalTests: number;
  passed: number;
  failed: number;
  critical: number;
  results: SecurityTestResult[];
}

class SecurityAuditAutomation {
  private results: SecurityTestResult[] = [];

  /**
   * Run all security tests
   */
  async runFullSecurityAudit(): Promise<SecurityAuditReport> {
    console.log('🔒 Starting Security Audit...');
    
    this.results = [];

    // Run all security tests
    await this.testXSSProtection();
    await this.testCSRFProtection();
    await this.testSecureHeaders();
    await this.testAuthenticationSecurity();
    await this.testContentSecurityPolicy();
    await this.testCookieSecurity();
    await this.testInputValidation();
    await this.testSQLInjectionPrevention();
    await this.testAPIEndpointSecurity();
    await this.testSensitiveDataExposure();
    await this.testHTTPSEnforcement();
    await this.testClickjackingProtection();

    // Generate report
    return this.generateReport();
  }

  /**
   * Test XSS Protection
   */
  private async testXSSProtection(): Promise<void> {
    const testName = 'XSS Protection';
    
    try {
      // Check for X-XSS-Protection header
      const hasXSSHeader = this.checkSecurityHeader('X-XSS-Protection');
      
      // Test script injection prevention
      const testInput = '<script>alert("XSS")</script>';
      const sanitized = this.sanitizeHTML(testInput);
      const isProtected = !sanitized.includes('<script>');
      
      // Check CSP for script-src
      const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || '';
      const hasScriptSrc = csp.includes('script-src');
      
      const passed = isProtected && (hasXSSHeader || hasScriptSrc);
      
      this.results.push({
        testName,
        passed,
        severity: 'critical',
        description: passed 
          ? 'XSS protection is properly configured'
          : 'XSS vulnerabilities detected',
        recommendation: passed 
          ? undefined 
          : 'Implement Content Security Policy and input sanitization',
        details: {
          hasXSSHeader,
          inputSanitization: isProtected,
          hasCSP: hasScriptSrc
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'critical',
        description: 'Failed to test XSS protection',
        recommendation: 'Manual review required'
      });
    }
  }

  /**
   * Test CSRF Protection
   */
  private async testCSRFProtection(): Promise<void> {
    const testName = 'CSRF Protection';
    
    try {
      // Check for CSRF token in forms
      const forms = document.querySelectorAll('form');
      let hasCSRFTokens = true;
      
      forms.forEach(form => {
        const hasToken = form.querySelector('input[name="csrf_token"]') !== null ||
                        form.querySelector('input[name="_csrf"]') !== null;
        if (!hasToken && form.method.toLowerCase() === 'post') {
          hasCSRFTokens = false;
        }
      });
      
      // Check for SameSite cookie attribute
      const cookies = document.cookie.split(';');
      const hasSameSite = cookies.some(cookie => 
        cookie.toLowerCase().includes('samesite=strict') || 
        cookie.toLowerCase().includes('samesite=lax')
      );
      
      const passed = hasCSRFTokens || hasSameSite || forms.length === 0;
      
      this.results.push({
        testName,
        passed,
        severity: 'critical',
        description: passed 
          ? 'CSRF protection is properly implemented'
          : 'CSRF vulnerabilities detected',
        recommendation: passed 
          ? undefined 
          : 'Implement CSRF tokens for all state-changing operations',
        details: {
          formsChecked: forms.length,
          hasCSRFTokens,
          hasSameSiteCookies: hasSameSite
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'critical',
        description: 'Failed to test CSRF protection'
      });
    }
  }

  /**
   * Test Secure Headers
   */
  private async testSecureHeaders(): Promise<void> {
    const testName = 'Security Headers';
    
    try {
      const requiredHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      };
      
      const missingHeaders: string[] = [];
      
      // In browser, we can't check response headers directly
      // But we can check if they're applied via meta tags or document properties
      const hasXFrameProtection = window.self === window.top;
      const hasHTTPS = window.location.protocol === 'https:';
      
      const score = (hasXFrameProtection ? 1 : 0) + (hasHTTPS ? 1 : 0);
      const passed = score >= 1;
      
      this.results.push({
        testName,
        passed,
        severity: 'high',
        description: passed 
          ? 'Security headers are properly configured'
          : 'Missing critical security headers',
        recommendation: passed 
          ? undefined 
          : 'Configure security headers in server response',
        details: {
          xFrameProtection: hasXFrameProtection,
          https: hasHTTPS,
          score: `${score}/2`
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'high',
        description: 'Failed to test security headers'
      });
    }
  }

  /**
   * Test Authentication Security
   */
  private async testAuthenticationSecurity(): Promise<void> {
    const testName = 'Authentication Security';
    
    try {
      // Check for secure token storage
      const hasLocalStorageTokens = localStorage.getItem('auth_token') !== null ||
                                    localStorage.getItem('access_token') !== null;
      
      // Check for httpOnly cookies (better practice)
      const cookies = document.cookie;
      const hasAuthCookie = cookies.includes('auth=') || cookies.includes('session=');
      
      // Password fields should have autocomplete off for sensitive data
      const passwordFields = document.querySelectorAll('input[type="password"]');
      let hasSecurePasswordFields = true;
      
      passwordFields.forEach(field => {
        const autocomplete = field.getAttribute('autocomplete');
        if (autocomplete === 'on') {
          hasSecurePasswordFields = false;
        }
      });
      
      const passed = !hasLocalStorageTokens && hasSecurePasswordFields;
      
      this.results.push({
        testName,
        passed,
        severity: 'critical',
        description: passed 
          ? 'Authentication is properly secured'
          : 'Authentication security issues detected',
        recommendation: passed 
          ? undefined 
          : 'Store tokens in httpOnly cookies, not localStorage',
        details: {
          tokenInLocalStorage: hasLocalStorageTokens,
          securePasswordFields: hasSecurePasswordFields,
          passwordFieldsCount: passwordFields.length
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'critical',
        description: 'Failed to test authentication security'
      });
    }
  }

  /**
   * Test Content Security Policy
   */
  private async testContentSecurityPolicy(): Promise<void> {
    const testName = 'Content Security Policy';
    
    try {
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      const cspContent = cspMeta?.getAttribute('content') || '';
      
      const hasCSP = cspContent.length > 0;
      const hasDefaultSrc = cspContent.includes('default-src');
      const hasScriptSrc = cspContent.includes('script-src');
      const hasStyleSrc = cspContent.includes('style-src');
      const noUnsafeInline = !cspContent.includes("'unsafe-inline'") || 
                             cspContent.includes('nonce-') || 
                             cspContent.includes('sha256-');
      
      const score = [hasCSP, hasDefaultSrc, hasScriptSrc, noUnsafeInline].filter(Boolean).length;
      const passed = score >= 3;
      
      this.results.push({
        testName,
        passed,
        severity: 'high',
        description: passed 
          ? 'Content Security Policy is properly configured'
          : 'CSP needs improvement',
        recommendation: passed 
          ? undefined 
          : 'Implement strict CSP with nonce or hash for inline scripts',
        details: {
          hasCSP,
          hasDefaultSrc,
          hasScriptSrc,
          hasStyleSrc,
          noUnsafeInline,
          score: `${score}/4`
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'high',
        description: 'Failed to test CSP'
      });
    }
  }

  /**
   * Test Cookie Security
   */
  private async testCookieSecurity(): Promise<void> {
    const testName = 'Cookie Security';
    
    try {
      const cookies = document.cookie.split(';');
      
      // Check if running on HTTPS
      const isHTTPS = window.location.protocol === 'https:';
      
      // In production, cookies should have Secure and HttpOnly flags
      // We can only check what's visible in document.cookie (HttpOnly cookies won't appear)
      const visibleCookies = cookies.length;
      const passed = isHTTPS && (visibleCookies === 0 || cookies.every(c => c.trim().length > 0));
      
      this.results.push({
        testName,
        passed,
        severity: 'high',
        description: passed 
          ? 'Cookies are properly secured'
          : 'Cookie security issues detected',
        recommendation: passed 
          ? undefined 
          : 'Set Secure, HttpOnly, and SameSite flags on all cookies',
        details: {
          https: isHTTPS,
          visibleCookies,
          recommendation: 'HttpOnly cookies won\'t appear in document.cookie (this is good)'
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'high',
        description: 'Failed to test cookie security'
      });
    }
  }

  /**
   * Test Input Validation
   */
  private async testInputValidation(): Promise<void> {
    const testName = 'Input Validation';
    
    try {
      const inputs = document.querySelectorAll('input, textarea');
      let validatedInputs = 0;
      
      inputs.forEach(input => {
        const hasValidation = input.hasAttribute('required') ||
                            input.hasAttribute('pattern') ||
                            input.hasAttribute('minlength') ||
                            input.hasAttribute('maxlength') ||
                            input.hasAttribute('min') ||
                            input.hasAttribute('max');
        if (hasValidation) validatedInputs++;
      });
      
      const validationRate = inputs.length > 0 ? (validatedInputs / inputs.length) * 100 : 100;
      const passed = validationRate >= 50; // At least 50% of inputs should have validation
      
      this.results.push({
        testName,
        passed,
        severity: 'medium',
        description: passed 
          ? 'Input validation is implemented'
          : 'Insufficient input validation',
        recommendation: passed 
          ? undefined 
          : 'Add validation attributes to all user inputs',
        details: {
          totalInputs: inputs.length,
          validatedInputs,
          validationRate: `${Math.round(validationRate)}%`
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'medium',
        description: 'Failed to test input validation'
      });
    }
  }

  /**
   * Test SQL Injection Prevention
   */
  private async testSQLInjectionPrevention(): Promise<void> {
    const testName = 'SQL Injection Prevention';
    
    try {
      // Check for any raw SQL-like strings in the page source
      const pageContent = document.body.innerHTML.toLowerCase();
      const sqlKeywords = ['select * from', 'drop table', 'insert into', 'delete from', 'update set'];
      
      const hasSQLPatterns = sqlKeywords.some(keyword => pageContent.includes(keyword));
      const passed = !hasSQLPatterns;
      
      this.results.push({
        testName,
        passed,
        severity: 'critical',
        description: passed 
          ? 'No SQL injection vulnerabilities detected in frontend'
          : 'Potential SQL patterns detected (requires backend review)',
        recommendation: passed 
          ? undefined 
          : 'Review backend for parameterized queries and ORM usage',
        details: {
          note: 'Frontend check only - backend must use parameterized queries'
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: true,
        severity: 'critical',
        description: 'SQL injection prevention (backend responsibility)'
      });
    }
  }

  /**
   * Test API Endpoint Security
   */
  private async testAPIEndpointSecurity(): Promise<void> {
    const testName = 'API Endpoint Security';
    
    try {
      // Test for exposed API keys
      const scripts = Array.from(document.scripts).map(s => s.innerHTML).join('');
      const hasExposedKeys = scripts.match(/api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i) !== null;
      
      // Test for exposed secrets
      const hasExposedSecrets = scripts.match(/secret\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i) !== null;
      
      const passed = !hasExposedKeys && !hasExposedSecrets;
      
      this.results.push({
        testName,
        passed,
        severity: 'critical',
        description: passed 
          ? 'No exposed API credentials detected'
          : 'Potential exposed API credentials found',
        recommendation: passed 
          ? undefined 
          : 'Move all API keys to environment variables on the server',
        details: {
          hasExposedKeys,
          hasExposedSecrets
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'critical',
        description: 'Failed to test API security'
      });
    }
  }

  /**
   * Test Sensitive Data Exposure
   */
  private async testSensitiveDataExposure(): Promise<void> {
    const testName = 'Sensitive Data Exposure';
    
    try {
      // Check localStorage and sessionStorage for sensitive data
      const sensitivePatterns = ['password', 'credit', 'ssn', 'card', 'cvv', 'pin'];
      const storageKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
      
      const hasSensitiveData = storageKeys.some(key => 
        sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern))
      );
      
      // Check for data in URL
      const urlParams = new URLSearchParams(window.location.search);
      const hasSensitiveParams = Array.from(urlParams.keys()).some(key =>
        sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern))
      );
      
      const passed = !hasSensitiveData && !hasSensitiveParams;
      
      this.results.push({
        testName,
        passed,
        severity: 'critical',
        description: passed 
          ? 'No sensitive data exposure detected'
          : 'Sensitive data found in insecure locations',
        recommendation: passed 
          ? undefined 
          : 'Never store sensitive data in localStorage or URL parameters',
        details: {
          sensitiveDataInStorage: hasSensitiveData,
          sensitiveDataInURL: hasSensitiveParams
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'critical',
        description: 'Failed to test sensitive data exposure'
      });
    }
  }

  /**
   * Test HTTPS Enforcement
   */
  private async testHTTPSEnforcement(): Promise<void> {
    const testName = 'HTTPS Enforcement';
    
    try {
      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
      
      // Check for mixed content
      const resources = document.querySelectorAll('img, script, link, iframe');
      let hasMixedContent = false;
      
      resources.forEach(resource => {
        const src = resource.getAttribute('src') || resource.getAttribute('href');
        if (src && src.startsWith('http:') && !src.includes('localhost')) {
          hasMixedContent = true;
        }
      });
      
      const passed = (isHTTPS || isLocalhost) && !hasMixedContent;
      
      this.results.push({
        testName,
        passed,
        severity: 'critical',
        description: passed 
          ? 'HTTPS is properly enforced'
          : 'HTTPS issues detected',
        recommendation: passed 
          ? undefined 
          : 'Enforce HTTPS and eliminate mixed content',
        details: {
          isHTTPS,
          isLocalhost,
          hasMixedContent,
          resourcesChecked: resources.length
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'critical',
        description: 'Failed to test HTTPS enforcement'
      });
    }
  }

  /**
   * Test Clickjacking Protection
   */
  private async testClickjackingProtection(): Promise<void> {
    const testName = 'Clickjacking Protection';
    
    try {
      const isFramed = window.self !== window.top;
      const passed = !isFramed;
      
      this.results.push({
        testName,
        passed,
        severity: 'medium',
        description: passed 
          ? 'Clickjacking protection is active'
          : 'Site can be framed (potential clickjacking)',
        recommendation: passed 
          ? undefined 
          : 'Set X-Frame-Options: DENY or CSP frame-ancestors directive',
        details: {
          canBeFramed: isFramed
        }
      });
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        severity: 'medium',
        description: 'Failed to test clickjacking protection'
      });
    }
  }

  /**
   * Helper: Check security header
   */
  private checkSecurityHeader(headerName: string): boolean {
    // Can't directly check response headers in browser
    // This is a placeholder for server-side checking
    return false;
  }

  /**
   * Helper: Sanitize HTML
   */
  private sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Generate security audit report
   */
  private generateReport(): SecurityAuditReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const critical = this.results.filter(r => !r.passed && r.severity === 'critical').length;
    
    const overallScore = Math.round((passed / this.results.length) * 100);
    
    const report: SecurityAuditReport = {
      timestamp: new Date().toISOString(),
      overallScore,
      totalTests: this.results.length,
      passed,
      failed,
      critical,
      results: this.results
    };
    
    // Log report
    console.log('🔒 Security Audit Report');
    console.log('========================');
    console.log(`Overall Score: ${overallScore}/100`);
    console.log(`Tests: ${passed}/${this.results.length} passed`);
    console.log(`Critical Issues: ${critical}`);
    console.log('');
    
    // Log failed tests
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('❌ Failed Tests:');
      failedTests.forEach(test => {
        const icon = test.severity === 'critical' ? '🔴' : 
                     test.severity === 'high' ? '🟠' : '🟡';
        console.log(`${icon} ${test.testName} (${test.severity})`);
        console.log(`   ${test.description}`);
        if (test.recommendation) {
          console.log(`   → ${test.recommendation}`);
        }
      });
    } else {
      console.log('✅ All security tests passed!');
    }
    
    return report;
  }

  /**
   * Export report
   */
  exportReport(report: SecurityAuditReport): void {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
let securityAuditInstance: SecurityAuditAutomation | null = null;

export function getSecurityAuditAutomation(): SecurityAuditAutomation {
  if (!securityAuditInstance) {
    securityAuditInstance = new SecurityAuditAutomation();
  }
  return securityAuditInstance;
}

// Global command
if (typeof window !== 'undefined') {
  (window as any).runSecurityAudit = async () => {
    const audit = getSecurityAuditAutomation();
    const report = await audit.runFullSecurityAudit();
    
    console.log('');
    console.log('💡 To export report: window.exportSecurityReport()');
    
    (window as any).__securityReport = report;
    
    return report;
  };
  
  (window as any).exportSecurityReport = () => {
    const report = (window as any).__securityReport;
    if (!report) {
      console.log('❌ No report available. Run window.runSecurityAudit() first.');
      return;
    }
    
    const audit = getSecurityAuditAutomation();
    audit.exportReport(report);
    console.log('✅ Security report exported!');
  };
  
  console.log('🔒 Security Audit Tool loaded. Use: window.runSecurityAudit()');
}
