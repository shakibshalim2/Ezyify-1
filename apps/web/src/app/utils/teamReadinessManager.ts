/**
 * Team Readiness Manager
 * Manages Phase 4: Team preparation and readiness validation
 */

export interface TeamMember {
  id: string;
  name: string;
  role: 'support' | 'engineering' | 'operations' | 'management';
  status: 'trained' | 'in-training' | 'not-started';
  completedTasks: string[];
  onCallScheduled: boolean;
}

export interface TeamTask {
  id: string;
  title: string;
  description: string;
  category: 'training' | 'process' | 'documentation' | 'infrastructure';
  priority: 'critical' | 'high' | 'medium' | 'low';
  completed: boolean;
  assignee?: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface TeamReadinessReport {
  overallReadiness: number;
  teamMembers: TeamMember[];
  tasks: TeamTask[];
  criticalTasksRemaining: number;
  readyForLaunch: boolean;
  recommendations: string[];
  timestamp: string;
}

class TeamReadinessManager {
  private teamMembers: TeamMember[] = [];
  private tasks: TeamTask[] = [];
  private initialized = false;

  /**
   * Initialize Team Readiness Program
   */
  initializeTeamReadiness(): void {
    if (this.initialized) {
      console.log('⚠️ Team readiness already initialized');
      return;
    }

    // Initialize default team structure
    this.teamMembers = [
      {
        id: 'tm1',
        name: 'Support Team Lead',
        role: 'support',
        status: 'not-started',
        completedTasks: [],
        onCallScheduled: false
      },
      {
        id: 'tm2',
        name: 'Engineering Lead',
        role: 'engineering',
        status: 'not-started',
        completedTasks: [],
        onCallScheduled: false
      },
      {
        id: 'tm3',
        name: 'Operations Manager',
        role: 'operations',
        status: 'not-started',
        completedTasks: [],
        onCallScheduled: false
      },
      {
        id: 'tm4',
        name: 'Product Manager',
        role: 'management',
        status: 'not-started',
        completedTasks: [],
        onCallScheduled: false
      }
    ];

    // Initialize critical tasks
    this.tasks = [
      {
        id: 'tt1',
        title: 'Support Team Training',
        description: 'Complete customer support training for EZYIFY platform, escrow system, and dispute resolution',
        category: 'training',
        priority: 'critical',
        completed: false
      },
      {
        id: 'tt2',
        title: 'Operations Runbook Review',
        description: 'Review and practice all operational procedures including incident response',
        category: 'documentation',
        priority: 'critical',
        completed: false
      },
      {
        id: 'tt3',
        title: 'Incident Response Drill',
        description: 'Conduct full incident response simulation with all team members',
        category: 'process',
        priority: 'critical',
        completed: false
      },
      {
        id: 'tt4',
        title: 'On-Call Schedule Setup',
        description: 'Establish 24/7 on-call rotation for engineering and operations',
        category: 'process',
        priority: 'critical',
        completed: false
      },
      {
        id: 'tt5',
        title: 'Communication Channels',
        description: 'Setup and test all team communication channels (Slack, Discord, Emergency)',
        category: 'infrastructure',
        priority: 'high',
        completed: false
      },
      {
        id: 'tt6',
        title: 'Documentation Review',
        description: 'All team members review critical documentation (API docs, runbooks, policies)',
        category: 'documentation',
        priority: 'high',
        completed: false
      },
      {
        id: 'tt7',
        title: 'Monitoring Dashboard Training',
        description: 'Train team on reading and responding to monitoring alerts',
        category: 'training',
        priority: 'high',
        completed: false
      },
      {
        id: 'tt8',
        title: 'Escalation Process',
        description: 'Document and practice issue escalation procedures',
        category: 'process',
        priority: 'high',
        completed: false
      },
      {
        id: 'tt9',
        title: 'Database Backup Verification',
        description: 'Verify team can restore from backups successfully',
        category: 'infrastructure',
        priority: 'critical',
        completed: false
      },
      {
        id: 'tt10',
        title: 'Security Incident Response',
        description: 'Practice security incident detection and response procedures',
        category: 'process',
        priority: 'critical',
        completed: false
      }
    ];

    this.initialized = true;

    console.log('✅ Team readiness program initialized');
    console.log(`📋 ${this.tasks.length} tasks created`);
    console.log(`👥 ${this.teamMembers.length} team members added`);
    console.log('\n💡 Use window.getTeamReadinessReport() to view status');
  }

  /**
   * Mark task as complete
   */
  completeTask(taskId: string, notes?: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      console.error(`❌ Task ${taskId} not found`);
      return;
    }

    task.completed = true;
    task.completedAt = new Date().toISOString();
    if (notes) {
      task.notes = notes;
    }

    console.log(`✅ Task completed: ${task.title}`);
    
    // Update progress
    this.updateTeamProgress();
  }

  /**
   * Assign task to team member
   */
  assignTask(taskId: string, memberId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    const member = this.teamMembers.find(m => m.id === memberId);

    if (!task) {
      console.error(`❌ Task ${taskId} not found`);
      return;
    }

    if (!member) {
      console.error(`❌ Team member ${memberId} not found`);
      return;
    }

    task.assignee = memberId;
    console.log(`✅ Task "${task.title}" assigned to ${member.name}`);
  }

  /**
   * Schedule team member for on-call
   */
  scheduleOnCall(memberId: string): void {
    const member = this.teamMembers.find(m => m.id === memberId);
    if (!member) {
      console.error(`❌ Team member ${memberId} not found`);
      return;
    }

    member.onCallScheduled = true;
    console.log(`✅ ${member.name} scheduled for on-call rotation`);
  }

  /**
   * Update team member status
   */
  updateMemberStatus(memberId: string, status: 'trained' | 'in-training' | 'not-started'): void {
    const member = this.teamMembers.find(m => m.id === memberId);
    if (!member) {
      console.error(`❌ Team member ${memberId} not found`);
      return;
    }

    member.status = status;
    console.log(`✅ ${member.name} status updated to: ${status}`);
  }

  /**
   * Update team progress based on completed tasks
   */
  private updateTeamProgress(): void {
    this.teamMembers.forEach(member => {
      const memberTasks = this.tasks.filter(t => t.assignee === member.id);
      const completedTasks = memberTasks.filter(t => t.completed);
      
      if (memberTasks.length > 0) {
        const progressRatio = completedTasks.length / memberTasks.length;
        
        if (progressRatio === 1) {
          member.status = 'trained';
        } else if (progressRatio > 0) {
          member.status = 'in-training';
        }
      }
    });
  }

  /**
   * Get team readiness report
   */
  getTeamReadinessReport(): TeamReadinessReport {
    if (!this.initialized) {
      console.warn('⚠️ Team readiness not initialized. Run window.initializeTeamReadiness() first');
    }

    const completedTasks = this.tasks.filter(t => t.completed).length;
    const totalTasks = this.tasks.length;
    const overallReadiness = Math.round((completedTasks / totalTasks) * 100);

    const criticalTasksRemaining = this.tasks.filter(
      t => !t.completed && t.priority === 'critical'
    ).length;

    const readyForLaunch = criticalTasksRemaining === 0 && overallReadiness >= 85;

    // Generate recommendations
    const recommendations: string[] = [];

    if (criticalTasksRemaining > 0) {
      recommendations.push(`⚠️ ${criticalTasksRemaining} critical tasks remaining - must complete before launch`);
    }

    const unscheduledMembers = this.teamMembers.filter(m => !m.onCallScheduled).length;
    if (unscheduledMembers > 0) {
      recommendations.push(`⚠️ ${unscheduledMembers} team members not scheduled for on-call`);
    }

    const untrainedMembers = this.teamMembers.filter(m => m.status !== 'trained').length;
    if (untrainedMembers > 0) {
      recommendations.push(`⚠️ ${untrainedMembers} team members not fully trained`);
    }

    if (readyForLaunch) {
      recommendations.push('✅ Team is ready for launch!');
      recommendations.push('💡 Consider a final team briefing before soft launch');
    } else if (overallReadiness >= 70) {
      recommendations.push('📈 Good progress - focus on completing critical tasks');
    } else {
      recommendations.push('🚨 Team readiness below threshold - prioritize critical tasks');
    }

    return {
      overallReadiness,
      teamMembers: this.teamMembers,
      tasks: this.tasks,
      criticalTasksRemaining,
      readyForLaunch,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Export team readiness report
   */
  exportTeamReadinessReport(): void {
    const report = this.getTeamReadinessReport();
    
    const exportData = {
      ...report,
      exportedAt: new Date().toISOString(),
      platform: 'EZYIFY',
      phase: 'Phase 4: Team Readiness'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ezyify-team-readiness-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ Team readiness report exported');
    console.log('📊 Overall Readiness:', report.overallReadiness + '%');
  }

  /**
   * Get list of team members
   */
  getTeamMembers(): TeamMember[] {
    return this.teamMembers;
  }

  /**
   * Get list of tasks
   */
  getTasks(): TeamTask[] {
    return this.tasks;
  }

  /**
   * Add team member
   */
  addTeamMember(name: string, role: 'support' | 'engineering' | 'operations' | 'management'): void {
    const newMember: TeamMember = {
      id: `tm${this.teamMembers.length + 1}`,
      name,
      role,
      status: 'not-started',
      completedTasks: [],
      onCallScheduled: false
    };

    this.teamMembers.push(newMember);
    console.log(`✅ Team member added: ${name} (${role})`);
  }

  /**
   * Print team readiness summary
   */
  printSummary(): void {
    const report = this.getTeamReadinessReport();

    console.log('\n' + '='.repeat(60));
    console.log('👥 TEAM READINESS REPORT');
    console.log('='.repeat(60));
    console.log(`Overall Readiness: ${report.overallReadiness}%`);
    console.log(`Tasks Completed: ${this.tasks.filter(t => t.completed).length}/${this.tasks.length}`);
    console.log(`Critical Tasks Remaining: ${report.criticalTasksRemaining}`);
    console.log(`Ready for Launch: ${report.readyForLaunch ? '✅ YES' : '❌ NO'}`);
    console.log('\n📋 Team Members:');
    report.teamMembers.forEach(member => {
      console.log(`  ${member.name} (${member.role})`);
      console.log(`    Status: ${member.status}`);
      console.log(`    On-Call: ${member.onCallScheduled ? '✅' : '❌'}`);
    });
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });
    console.log('='.repeat(60) + '\n');
  }
}

// Export singleton instance
export const teamReadinessManager = new TeamReadinessManager();

// Expose global functions
declare global {
  interface Window {
    initializeTeamReadiness: () => void;
    completeTeamTask: (taskId: string, notes?: string) => void;
    assignTeamTask: (taskId: string, memberId: string) => void;
    scheduleOnCall: (memberId: string) => void;
    updateMemberStatus: (memberId: string, status: 'trained' | 'in-training' | 'not-started') => void;
    getTeamReadinessReport: () => TeamReadinessReport;
    exportTeamReadinessReport: () => void;
    getTeamMembers: () => TeamMember[];
    getTeamTasks: () => TeamTask[];
    addTeamMember: (name: string, role: 'support' | 'engineering' | 'operations' | 'management') => void;
    printTeamSummary: () => void;
  }
}

// Initialize global functions
if (typeof window !== 'undefined') {
  window.initializeTeamReadiness = () => teamReadinessManager.initializeTeamReadiness();
  window.completeTeamTask = (taskId: string, notes?: string) => teamReadinessManager.completeTask(taskId, notes);
  window.assignTeamTask = (taskId: string, memberId: string) => teamReadinessManager.assignTask(taskId, memberId);
  window.scheduleOnCall = (memberId: string) => teamReadinessManager.scheduleOnCall(memberId);
  window.updateMemberStatus = (memberId: string, status: any) => teamReadinessManager.updateMemberStatus(memberId, status);
  window.getTeamReadinessReport = () => teamReadinessManager.getTeamReadinessReport();
  window.exportTeamReadinessReport = () => teamReadinessManager.exportTeamReadinessReport();
  window.getTeamMembers = () => teamReadinessManager.getTeamMembers();
  window.getTeamTasks = () => teamReadinessManager.getTasks();
  window.addTeamMember = (name: string, role: any) => teamReadinessManager.addTeamMember(name, role);
  window.printTeamSummary = () => teamReadinessManager.printSummary();

  console.log('✅ Team Readiness Manager loaded');
  console.log('💡 Use window.initializeTeamReadiness() to start Phase 4');
}
