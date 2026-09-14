
/** Collision-resistant id from the platform CSPRNG (CodeQL js/insecure-randomness). */
const randomId = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Very old WebViews: still CSPRNG-backed via getRandomValues (no Math.random fallback).
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b: number) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Beta Testing & Soft Launch Management
 * Manage beta users, collect feedback, and control rollout
 */

interface BetaUser {
  id: string;
  email: string;
  name: string;
  joinedAt: string;
  tier: 'alpha' | 'beta' | 'early-access';
  status: 'active' | 'inactive' | 'churned';
  sessionsCount: number;
  feedbackCount: number;
  lastActiveAt?: string;
}

interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'praise';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  page: string;
  timestamp: string;
  status: 'new' | 'reviewing' | 'in-progress' | 'resolved' | 'wont-fix';
  screenshot?: string;
}

interface RolloutMetrics {
  timestamp: string;
  trafficPercentage: number;
  activeUsers: number;
  newUsers: number;
  errorRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  feedbackCount: number;
  criticalIssues: number;
}

interface SoftLaunchReport {
  startDate: string;
  currentPhase: '1%' | '5%' | '10%' | '25%' | '50%' | '100%';
  totalBetaUsers: number;
  activeUsers: number;
  totalFeedback: number;
  criticalIssues: number;
  resolvedIssues: number;
  overallHealth: 'excellent' | 'good' | 'concerning' | 'critical';
  readyForNextPhase: boolean;
  metrics: RolloutMetrics[];
  topIssues: Feedback[];
  recommendations: string[];
}

class BetaTestingManager {
  private betaUsers: BetaUser[] = [];
  private feedback: Feedback[] = [];
  private metrics: RolloutMetrics[] = [];
  private currentTrafficPercentage: number = 0;

  constructor() {
    this.loadFromStorage();
    this.initializeMetricsTracking();
  }

  /**
   * Initialize beta testing program
   */
  initializeBetaProgram(): void {
    console.log('🧪 Initializing Beta Testing Program...');
    
    // Generate mock beta users for testing
    this.generateMockBetaUsers(50);
    
    // Start metrics collection
    this.startMetricsCollection();
    
    this.saveToStorage();
    
    console.log(`✅ Beta program initialized with ${this.betaUsers.length} users`);
  }

  /**
   * Add beta user
   */
  addBetaUser(email: string, name: string, tier: 'alpha' | 'beta' | 'early-access' = 'beta'): BetaUser {
    const user: BetaUser = {
      id: this.generateId(),
      email,
      name,
      joinedAt: new Date().toISOString(),
      tier,
      status: 'active',
      sessionsCount: 0,
      feedbackCount: 0
    };
    
    this.betaUsers.push(user);
    this.saveToStorage();
    
    console.log(`✅ Added beta user: ${name} (${email})`);
    
    return user;
  }

  /**
   * Submit feedback
   */
  submitFeedback(
    userId: string,
    type: Feedback['type'],
    priority: Feedback['priority'],
    title: string,
    description: string,
    page: string
  ): Feedback {
    const feedback: Feedback = {
      id: this.generateId(),
      userId,
      type,
      priority,
      title,
      description,
      page,
      timestamp: new Date().toISOString(),
      status: 'new'
    };
    
    this.feedback.push(feedback);
    
    // Update user feedback count
    const user = this.betaUsers.find(u => u.id === userId);
    if (user) {
      user.feedbackCount++;
    }
    
    this.saveToStorage();
    
    const icon = priority === 'critical' ? '🔴' :
                 priority === 'high' ? '🟠' :
                 priority === 'medium' ? '🟡' : '🟢';
    
    console.log(`${icon} New ${type} feedback: ${title}`);
    
    return feedback;
  }

  /**
   * Update traffic percentage
   */
  setTrafficPercentage(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      console.error('❌ Traffic percentage must be between 0 and 100');
      return;
    }
    
    this.currentTrafficPercentage = percentage;
    
    // Record metrics snapshot
    this.recordMetricsSnapshot();
    
    this.saveToStorage();
    
    console.log(`📊 Traffic set to ${percentage}%`);
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): RolloutMetrics {
    const activeUsers = this.betaUsers.filter(u => u.status === 'active').length;
    const newUsers = this.betaUsers.filter(u => {
      const joinedDate = new Date(u.joinedAt);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return joinedDate > oneDayAgo;
    }).length;
    
    const criticalIssues = this.feedback.filter(f => 
      f.priority === 'critical' && f.status !== 'resolved'
    ).length;
    
    const recentFeedback = this.feedback.filter(f => {
      const feedbackDate = new Date(f.timestamp);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return feedbackDate > oneDayAgo;
    }).length;
    
    // Simulate error rate based on feedback
    const errorRate = Math.min((criticalIssues / Math.max(activeUsers, 1)) * 100, 10);
    
    // Simulate session duration (mock)
    const avgSessionDuration = 180 + Math.random() * 120; // 3-5 minutes
    
    // Simulate conversion rate (mock)
    const conversionRate = Math.max(2, 5 - (criticalIssues * 0.5));
    
    return {
      timestamp: new Date().toISOString(),
      trafficPercentage: this.currentTrafficPercentage,
      activeUsers,
      newUsers,
      errorRate: Math.round(errorRate * 100) / 100,
      avgSessionDuration: Math.round(avgSessionDuration),
      conversionRate: Math.round(conversionRate * 100) / 100,
      feedbackCount: recentFeedback,
      criticalIssues
    };
  }

  /**
   * Generate soft launch report
   */
  generateSoftLaunchReport(): SoftLaunchReport {
    const metrics = this.getCurrentMetrics();
    
    const totalBetaUsers = this.betaUsers.length;
    const activeUsers = this.betaUsers.filter(u => u.status === 'active').length;
    const totalFeedback = this.feedback.length;
    const criticalIssues = this.feedback.filter(f => 
      f.priority === 'critical' && f.status !== 'resolved'
    ).length;
    const resolvedIssues = this.feedback.filter(f => f.status === 'resolved').length;
    
    // Determine current phase
    let currentPhase: SoftLaunchReport['currentPhase'] = '1%';
    if (this.currentTrafficPercentage >= 100) currentPhase = '100%';
    else if (this.currentTrafficPercentage >= 50) currentPhase = '50%';
    else if (this.currentTrafficPercentage >= 25) currentPhase = '25%';
    else if (this.currentTrafficPercentage >= 10) currentPhase = '10%';
    else if (this.currentTrafficPercentage >= 5) currentPhase = '5%';
    
    // Calculate overall health
    let overallHealth: SoftLaunchReport['overallHealth'] = 'excellent';
    if (criticalIssues > 0) overallHealth = 'critical';
    else if (metrics.errorRate > 5) overallHealth = 'concerning';
    else if (metrics.errorRate > 2) overallHealth = 'good';
    
    // Determine if ready for next phase
    const readyForNextPhase = criticalIssues === 0 && 
                              metrics.errorRate < 5 && 
                              activeUsers > 0;
    
    // Get top issues
    const topIssues = this.feedback
      .filter(f => f.status !== 'resolved')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (criticalIssues > 0) {
      recommendations.push(`Resolve ${criticalIssues} critical issue(s) before increasing traffic`);
    }
    
    if (metrics.errorRate > 5) {
      recommendations.push('Error rate is high - investigate and fix issues');
    }
    
    if (activeUsers < 10 && this.currentTrafficPercentage > 0) {
      recommendations.push('Low active user count - improve onboarding and retention');
    }
    
    if (totalFeedback < 5 && activeUsers > 20) {
      recommendations.push('Low feedback rate - encourage users to share feedback');
    }
    
    if (readyForNextPhase && this.currentTrafficPercentage < 100) {
      const nextPhase = this.getNextPhasePercentage();
      recommendations.push(`✅ Ready to increase traffic to ${nextPhase}%`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All metrics look good! Monitor closely and collect more data.');
    }
    
    const report: SoftLaunchReport = {
      startDate: this.betaUsers.length > 0 ? this.betaUsers[0].joinedAt : new Date().toISOString(),
      currentPhase,
      totalBetaUsers,
      activeUsers,
      totalFeedback,
      criticalIssues,
      resolvedIssues,
      overallHealth,
      readyForNextPhase,
      metrics: this.metrics.slice(-7), // Last 7 snapshots
      topIssues,
      recommendations
    };
    
    this.logReport(report);
    
    return report;
  }

  /**
   * Export beta users list
   */
  exportBetaUsers(): void {
    const data = {
      exportDate: new Date().toISOString(),
      totalUsers: this.betaUsers.length,
      users: this.betaUsers
    };
    
    this.downloadJSON(data, 'beta-users');
  }

  /**
   * Export feedback
   */
  exportFeedback(): void {
    const data = {
      exportDate: new Date().toISOString(),
      totalFeedback: this.feedback.length,
      feedback: this.feedback
    };
    
    this.downloadJSON(data, 'beta-feedback');
  }

  /**
   * Export metrics
   */
  exportMetrics(): void {
    const data = {
      exportDate: new Date().toISOString(),
      totalSnapshots: this.metrics.length,
      metrics: this.metrics
    };
    
    this.downloadJSON(data, 'rollout-metrics');
  }

  /**
   * Private: Generate mock beta users
   */
  private generateMockBetaUsers(count: number): void {
    const names = [
      'Ahmed Rahman', 'Fatima Khan', 'Omar Hassan', 'Ayesha Ali',
      'Ibrahim Malik', 'Zainab Ahmed', 'Yusuf Ibrahim', 'Mariam Hassan',
      'Abdullah Karim', 'Sarah Rahman', 'Mohamed Ali', 'Layla Omar',
      'Hassan Ahmed', 'Aisha Malik', 'Ali Hassan'
    ];
    
    const tiers: ('alpha' | 'beta' | 'early-access')[] = ['alpha', 'beta', 'beta', 'early-access'];
    
    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const email = `${name.toLowerCase().replace(' ', '.')}${i}@example.com`;
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      
      const daysAgo = Math.floor(Math.random() * 14);
      const joinedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      const user: BetaUser = {
        id: this.generateId(),
        email,
        name,
        joinedAt,
        tier,
        status: Math.random() > 0.1 ? 'active' : 'inactive',
        sessionsCount: Math.floor(Math.random() * 20) + 1,
        feedbackCount: Math.floor(Math.random() * 5),
        lastActiveAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      this.betaUsers.push(user);
    }
    
    // Generate some mock feedback
    this.generateMockFeedback();
  }

  /**
   * Private: Generate mock feedback
   */
  private generateMockFeedback(): void {
    const feedbackTemplates = [
      { type: 'bug', title: 'Image upload fails', description: 'Images fail to upload on product page' },
      { type: 'feature', title: 'Add dark mode', description: 'Would love a dark mode option' },
      { type: 'improvement', title: 'Faster checkout', description: 'Checkout process feels slow' },
      { type: 'praise', title: 'Great UI', description: 'Love the clean interface!' },
      { type: 'bug', title: 'Payment error', description: 'Payment fails at final step' },
      { type: 'feature', title: 'Wishlist notification', description: 'Notify when wishlist items go on sale' },
    ];
    
    const priorities: Feedback['priority'][] = ['low', 'medium', 'medium', 'high', 'critical'];
    const pages = ['/shop', '/product/123', '/cart', '/checkout', '/profile'];
    
    const feedbackCount = Math.min(this.betaUsers.length, 15);
    
    for (let i = 0; i < feedbackCount; i++) {
      const template = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
      const user = this.betaUsers[Math.floor(Math.random() * this.betaUsers.length)];
      
      const feedback: Feedback = {
        id: this.generateId(),
        userId: user.id,
        type: template.type as Feedback['type'],
        // Demo fixture data — rotate deterministically instead of drawing a random priority.
        priority: priorities[i % priorities.length],
        title: template.title,
        description: template.description,
        page: pages[Math.floor(Math.random() * pages.length)],
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.3 ? 'new' : 'resolved'
      };
      
      this.feedback.push(feedback);
    }
  }

  /**
   * Private: Initialize metrics tracking
   */
  private initializeMetricsTracking(): void {
    // Record initial metrics
    this.recordMetricsSnapshot();
  }

  /**
   * Private: Start metrics collection
   */
  private startMetricsCollection(): void {
    // Collect metrics every 5 minutes
    setInterval(() => {
      this.recordMetricsSnapshot();
    }, 5 * 60 * 1000);
  }

  /**
   * Private: Record metrics snapshot
   */
  private recordMetricsSnapshot(): void {
    const metrics = this.getCurrentMetrics();
    this.metrics.push(metrics);
    
    // Keep only last 100 snapshots
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
    
    this.saveToStorage();
  }

  /**
   * Private: Get next phase percentage
   */
  private getNextPhasePercentage(): number {
    if (this.currentTrafficPercentage === 0) return 1;
    if (this.currentTrafficPercentage < 5) return 5;
    if (this.currentTrafficPercentage < 10) return 10;
    if (this.currentTrafficPercentage < 25) return 25;
    if (this.currentTrafficPercentage < 50) return 50;
    if (this.currentTrafficPercentage < 100) return 100;
    return 100;
  }

  /**
   * Private: Log report
   */
  private logReport(report: SoftLaunchReport): void {
    console.log('🧪 Soft Launch Report');
    console.log('=====================');
    console.log(`Current Phase: ${report.currentPhase}`);
    console.log(`Overall Health: ${report.overallHealth.toUpperCase()}`);
    console.log(`Beta Users: ${report.activeUsers}/${report.totalBetaUsers} active`);
    console.log(`Feedback: ${report.totalFeedback} total, ${report.criticalIssues} critical`);
    console.log('');
    
    if (report.topIssues.length > 0) {
      console.log('🔥 Top Issues:');
      report.topIssues.forEach((issue, i) => {
        const icon = issue.priority === 'critical' ? '🔴' :
                     issue.priority === 'high' ? '🟠' : '🟡';
        console.log(`${i + 1}. ${icon} ${issue.title} (${issue.type})`);
      });
      console.log('');
    }
    
    console.log('💡 Recommendations:');
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }

  /**
   * Private: Generate ID
   */
  private generateId(): string {
    return randomId();
  }

  /**
   * Private: Save to storage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('beta-users', JSON.stringify(this.betaUsers));
      localStorage.setItem('beta-feedback', JSON.stringify(this.feedback));
      localStorage.setItem('beta-metrics', JSON.stringify(this.metrics));
      localStorage.setItem('beta-traffic', this.currentTrafficPercentage.toString());
    } catch (error) {
      console.error('Failed to save beta data:', error);
    }
  }

  /**
   * Private: Load from storage
   */
  private loadFromStorage(): void {
    try {
      const users = localStorage.getItem('beta-users');
      const feedback = localStorage.getItem('beta-feedback');
      const metrics = localStorage.getItem('beta-metrics');
      const traffic = localStorage.getItem('beta-traffic');
      
      if (users) this.betaUsers = JSON.parse(users);
      if (feedback) this.feedback = JSON.parse(feedback);
      if (metrics) this.metrics = JSON.parse(metrics);
      if (traffic) this.currentTrafficPercentage = parseFloat(traffic);
    } catch (error) {
      console.error('Failed to load beta data:', error);
    }
  }

  /**
   * Private: Download JSON
   */
  private downloadJSON(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
let betaManagerInstance: BetaTestingManager | null = null;

export function getBetaTestingManager(): BetaTestingManager {
  if (!betaManagerInstance) {
    betaManagerInstance = new BetaTestingManager();
  }
  return betaManagerInstance;
}

// Global commands
if (typeof window !== 'undefined') {
  (window as any).initBetaProgram = () => {
    const manager = getBetaTestingManager();
    manager.initializeBetaProgram();
  };
  
  (window as any).addBetaUser = (email: string, name: string) => {
    const manager = getBetaTestingManager();
    return manager.addBetaUser(email, name);
  };
  
  (window as any).submitBetaFeedback = (
    userId: string,
    type: string,
    priority: string,
    title: string,
    description: string,
    page: string
  ) => {
    const manager = getBetaTestingManager();
    return manager.submitFeedback(userId, type as any, priority as any, title, description, page);
  };
  
  (window as any).setRolloutTraffic = (percentage: number) => {
    const manager = getBetaTestingManager();
    manager.setTrafficPercentage(percentage);
  };
  
  (window as any).getSoftLaunchReport = () => {
    const manager = getBetaTestingManager();
    return manager.generateSoftLaunchReport();
  };
  
  (window as any).exportBetaUsers = () => {
    const manager = getBetaTestingManager();
    manager.exportBetaUsers();
    console.log('✅ Beta users exported!');
  };
  
  (window as any).exportBetaFeedback = () => {
    const manager = getBetaTestingManager();
    manager.exportFeedback();
    console.log('✅ Feedback exported!');
  };
  
  console.log('🧪 Beta Testing Manager loaded. Commands:');
  console.log('  - window.initBetaProgram()');
  console.log('  - window.addBetaUser(email, name)');
  console.log('  - window.submitBetaFeedback(userId, type, priority, title, desc, page)');
  console.log('  - window.setRolloutTraffic(percentage)');
  console.log('  - window.getSoftLaunchReport()');
  console.log('  - window.exportBetaUsers()');
  console.log('  - window.exportBetaFeedback()');
}
