/**
 * Reporting Service
 * Handles aggregation queries for dashboards and reports
 */

import prisma from '../lib/prisma';
import { Prisma, InitiativeStatus, RiskSeverity, RiskStatus, MilestoneStatus } from '@prisma/client';

// Types for reporting
export interface PortfolioSummary {
  totalInitiatives: number;
  statusBreakdown: Record<string, number>;
  totalBudgetAllocated: number;
  totalBudgetAtRisk: number;
  averageAdoptionAttainment: number;
  benefitsRealizationRate: number;
  blockedCount: number;
  pendingAgentActionsCount: number;
  top5AtRiskInitiatives: Array<{
    id: number;
    name: string;
    status: string;
    riskScore: number;
  }>;
}

export interface InitiativeProgress {
  initiativeId: number;
  initiativeName: string;
  milestoneCompletionPercent: number;
  openRisksCount: number;
  pendingDecisionsCount: number;
  adoptionAttainment: number;
}

export interface BlockedWorkItem {
  initiativeId: number;
  initiativeName: string;
  owner: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  blockingEntityType: 'MILESTONE' | 'RISK' | 'INITIATIVE';
  blockingEntityTitle: string;
  daysBlocked: number;
}

export interface NextActionItem {
  initiativeId: number;
  initiativeName: string;
  actionType: 'OVERDUE_MILESTONE' | 'CRITICAL_RISK' | 'PENDING_AGENT_ACTION';
  actionTitle: string;
  priority: string;
  dueDate?: Date;
}

export interface TeamDashboard {
  myInitiatives: InitiativeProgress[];
  totalInitiatives: number;
  averageMilestoneCompletion: number;
  totalOpenRisks: number;
  totalPendingDecisions: number;
}

export interface AuditLogFilters {
  entityType?: string;
  entityId?: number;
  actorId?: number;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class ReportingService {
  /**
   * Get executive dashboard KPIs
   */
  async getExecutiveDashboard(): Promise<PortfolioSummary> {
    // Get all initiatives with their related data
    const initiatives = await prisma.initiative.findMany({
      include: {
        risks: true,
        milestones: true,
        adoptionSignals: true,
        benefits: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    initiatives.forEach((initiative) => {
      statusBreakdown[initiative.status] = (statusBreakdown[initiative.status] || 0) + 1;
    });

    // Budget calculations
    const totalBudgetAllocated = initiatives.reduce(
      (sum, i) => sum + (i.budgetCents || 0),
      0
    );
    const totalBudgetAtRisk = initiatives
      .filter((i) => i.status === InitiativeStatus.AT_RISK)
      .reduce((sum, i) => sum + (i.budgetCents || 0), 0);

    // Adoption attainment average
    const adoptionValues = initiatives
      .map((i) => i.adoptionSignals[i.adoptionSignals.length - 1]?.value || 0)
      .filter((v) => v > 0);
    const averageAdoptionAttainment =
      adoptionValues.length > 0
        ? adoptionValues.reduce((a, b) => a + b, 0) / adoptionValues.length
        : 0;

    // Benefits realization rate
    const benefits = await prisma.benefit.findMany();
    const realizedBenefits = benefits.filter((b) => b.status === 'REALIZED');
    const benefitsRealizationRate =
      benefits.length > 0 ? (realizedBenefits.length / benefits.length) * 100 : 0;

    // Blocked count
    const blockedInitiatives = initiatives.filter(
      (i) =>
        i.status === InitiativeStatus.BLOCKED ||
        i.milestones.some((m) => m.status === MilestoneStatus.BLOCKED) ||
        i.risks.some(
          (r) =>
            (r.severity === RiskSeverity.CRITICAL || r.severity === RiskSeverity.HIGH) &&
            r.status === RiskStatus.OPEN
        )
    );

    // Pending agent actions
    const pendingAgentActionsCount = await prisma.agentAction.count({
      where: { status: 'PENDING' },
    });

    // Top 5 at-risk initiatives
    const atRiskInitiatives = initiatives
      .filter((i) => i.status === InitiativeStatus.AT_RISK)
      .map((i) => ({
        id: i.id,
        name: i.name,
        status: i.status,
        riskScore: i.risks.reduce((sum, r) => sum + (r.probability * r.impact || 0), 0),
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);

    return {
      totalInitiatives: initiatives.length,
      statusBreakdown,
      totalBudgetAllocated,
      totalBudgetAtRisk,
      averageAdoptionAttainment,
      benefitsRealizationRate,
      blockedCount: blockedInitiatives.length,
      pendingAgentActionsCount,
      top5AtRiskInitiatives: atRiskInitiatives,
    };
  }

  /**
   * Get blocked work items
   */
  async getBlockedWork(): Promise<BlockedWorkItem[]> {
    const blockedItems: BlockedWorkItem[] = [];

    // Get initiatives with blocked milestones
    const initiativesWithBlockedMilestones = await prisma.initiative.findMany({
      where: {
        milestones: {
          some: {
            status: MilestoneStatus.BLOCKED,
          },
        },
      },
      include: {
        milestones: {
          where: {
            status: MilestoneStatus.BLOCKED,
          },
        },
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    initiativesWithBlockedMilestones.forEach((initiative) => {
      initiative.milestones.forEach((milestone) => {
        const daysBlocked = milestone.actualDate
          ? Math.floor(
              (new Date().getTime() - new Date(milestone.actualDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        blockedItems.push({
          initiativeId: initiative.id,
          initiativeName: initiative.name,
          owner: initiative.owner,
          blockingEntityType: 'MILESTONE',
          blockingEntityTitle: milestone.title,
          daysBlocked: Math.max(0, daysBlocked),
        });
      });
    });

    // Get initiatives with critical/high open risks
    const initiativesWithCriticalRisks = await prisma.initiative.findMany({
      where: {
        risks: {
          some: {
            severity: { in: [RiskSeverity.CRITICAL, RiskSeverity.HIGH] },
            status: RiskStatus.OPEN,
          },
        },
      },
      include: {
        risks: {
          where: {
            severity: { in: [RiskSeverity.CRITICAL, RiskSeverity.HIGH] },
            status: RiskStatus.OPEN,
          },
        },
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    initiativesWithCriticalRisks.forEach((initiative) => {
      initiative.risks.forEach((risk) => {
        const daysBlocked = Math.floor(
          (new Date().getTime() - new Date(risk.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        blockedItems.push({
          initiativeId: initiative.id,
          initiativeName: initiative.name,
          owner: initiative.owner,
          blockingEntityType: 'RISK',
          blockingEntityTitle: risk.title,
          daysBlocked,
        });
      });
    });

    // Get blocked initiatives
    const blockedInitiatives = await prisma.initiative.findMany({
      where: {
        status: InitiativeStatus.BLOCKED,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    blockedInitiatives.forEach((initiative) => {
      const daysBlocked = initiative.updatedAt
        ? Math.floor(
            (new Date().getTime() - new Date(initiative.updatedAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      blockedItems.push({
        initiativeId: initiative.id,
        initiativeName: initiative.name,
        owner: initiative.owner,
        blockingEntityType: 'INITIATIVE',
        blockingEntityTitle: 'Initiative Blocked',
        daysBlocked: Math.max(0, daysBlocked),
      });
    });

    return blockedItems.sort((a, b) => b.daysBlocked - a.daysBlocked);
  }

  /**
   * Get next recommended actions
   */
  async getNextActions(): Promise<NextActionItem[]> {
    const actions: NextActionItem[] = [];

    // Overdue milestones
    const overdueMilestones = await prisma.milestone.findMany({
      where: {
        plannedDate: {
          lt: new Date(),
        },
        actualDate: null,
        status: { not: MilestoneStatus.COMPLETED },
      },
      include: {
        initiative: {
          select: {
            id: true,
            name: true,
            priority: true,
          },
        },
      },
      orderBy: {
        plannedDate: 'asc',
      },
    });

    overdueMilestones.forEach((milestone) => {
      actions.push({
        initiativeId: milestone.initiative.id,
        initiativeName: milestone.initiative.name,
        actionType: 'OVERDUE_MILESTONE',
        actionTitle: `Overdue: ${milestone.title}`,
        priority: milestone.initiative.priority,
        dueDate: milestone.plannedDate,
      });
    });

    // Critical unresolved risks
    const criticalRisks = await prisma.risk.findMany({
      where: {
        severity: RiskSeverity.CRITICAL,
        status: RiskStatus.OPEN,
      },
      include: {
        initiative: {
          select: {
            id: true,
            name: true,
            priority: true,
          },
        },
      },
    });

    criticalRisks.forEach((risk) => {
      actions.push({
        initiativeId: risk.initiative.id,
        initiativeName: risk.initiative.name,
        actionType: 'CRITICAL_RISK',
        actionTitle: `Critical Risk: ${risk.title}`,
        priority: risk.initiative.priority,
      });
    });

    // Pending agent actions
    const pendingActions = await prisma.agentAction.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        initiative: {
          select: {
            id: true,
            name: true,
            priority: true,
          },
        },
      },
    });

    pendingActions.forEach((action) => {
      actions.push({
        initiativeId: action.initiative.id,
        initiativeName: action.initiative.name,
        actionType: 'PENDING_AGENT_ACTION',
        actionTitle: `Pending Approval: ${action.actionType}`,
        priority: action.initiative.priority,
      });
    });

    // Sort by priority (CRITICAL > HIGH > MEDIUM > LOW)
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return actions.sort(
      (a, b) =>
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 4)
    );
  }

  /**
   * Get team dashboard for a specific user
   */
  async getTeamDashboard(userId: number): Promise<TeamDashboard> {
    // Get initiatives owned by this user
    const myInitiatives = await prisma.initiative.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        milestones: true,
        risks: {
          where: {
            status: RiskStatus.OPEN,
          },
        },
        decisions: {
          where: {
            status: 'PENDING',
          },
        },
        adoptionSignals: {
          orderBy: {
            measuredAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const initiativeProgress: InitiativeProgress[] = myInitiatives.map((initiative) => {
      const totalMilestones = initiative.milestones.length;
      const completedMilestones = initiative.milestones.filter(
        (m) => m.status === MilestoneStatus.COMPLETED
      ).length;
      const milestoneCompletionPercent =
        totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

      return {
        initiativeId: initiative.id,
        initiativeName: initiative.name,
        milestoneCompletionPercent: Math.round(milestoneCompletionPercent),
        openRisksCount: initiative.risks.length,
        pendingDecisionsCount: initiative.decisions.length,
        adoptionAttainment: initiative.adoptionSignals[0]?.value || 0,
      };
    });

    const averageMilestoneCompletion =
      initiativeProgress.length > 0
        ? initiativeProgress.reduce((sum, i) => sum + i.milestoneCompletionPercent, 0) /
          initiativeProgress.length
        : 0;

    return {
      myInitiatives: initiativeProgress,
      totalInitiatives: myInitiatives.length,
      averageMilestoneCompletion: Math.round(averageMilestoneCompletion),
      totalOpenRisks: initiativeProgress.reduce((sum, i) => sum + i.openRisksCount, 0),
      totalPendingDecisions: initiativeProgress.reduce(
        (sum, i) => sum + i.pendingDecisionsCount,
        0
      ),
    };
  }

  /**
   * Get audit log with filters
   */
  async getAuditLog(filters: AuditLogFilters) {
    const {
      entityType,
      entityId,
      actorId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const where: Prisma.AuditLogWhereInput = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorId) where.actorId = actorId;
    if (action) where.action = action as any;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: auditLogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get executive summary export data
   */
  async getExecutiveSummaryExport() {
    const dashboard = await this.getExecutiveDashboard();
    const initiatives = await prisma.initiative.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        risks: true,
        milestones: true,
        benefits: true,
      },
    });

    const initiativeRows = initiatives.map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status,
      owner: `${i.owner.firstName} ${i.owner.lastName}`,
      budgetAllocated: i.budgetCents ? i.budgetCents / 100 : 0,
      openRisks: i.risks.filter((r) => r.status === RiskStatus.OPEN).length,
      milestoneCompletion: i.milestones.length
        ? Math.round(
            (i.milestones.filter((m) => m.status === MilestoneStatus.COMPLETED).length /
              i.milestones.length) *
              100
          )
        : 0,
      benefitsRealized: i.benefits.filter((b) => b.status === 'REALIZED').length,
    }));

    return {
      summary: dashboard,
      initiatives: initiativeRows,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get risk heatmap data
   */
  async getRiskHeatmap() {
    const risks = await prisma.risk.findMany({
      include: {
        initiative: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Create heatmap matrix: probability x impact
    const heatmap: Record<string, Record<string, number>> = {
      LOW: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      MEDIUM: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      HIGH: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
    };

    const riskItems = risks.map((risk) => {
      heatmap[risk.probability][risk.severity]++;
      return {
        id: risk.id,
        title: risk.title,
        probability: risk.probability,
        impact: risk.severity,
        score: risk.probability === 'LOW' ? 1 : risk.probability === 'MEDIUM' ? 2 : 3,
        initiativeId: risk.initiative.id,
        initiativeName: risk.initiative.name,
        status: risk.status,
      };
    });

    return {
      heatmap,
      risks: riskItems,
    };
  }

  /**
   * Get milestone timeline data
   */
  async getMilestoneTimeline() {
    const milestones = await prisma.milestone.findMany({
      include: {
        initiative: {
          select: {
            id: true,
            name: true,
            priority: true,
          },
        },
      },
      orderBy: {
        plannedDate: 'asc',
      },
    });

    return milestones.map((m) => ({
      id: m.id,
      title: m.title,
      initiativeId: m.initiative.id,
      initiativeName: m.initiative.name,
      priority: m.initiative.priority,
      plannedDate: m.plannedDate,
      actualDate: m.actualDate,
      status: m.status,
      health: m.health,
    }));
  }

  /**
   * Get budget utilization data
   */
  async getBudgetUtilization() {
    const initiatives = await prisma.initiative.findMany({
      select: {
        id: true,
        name: true,
        budgetCents: true,
        actualSpendCents: true,
        status: true,
      },
    });

    const totalBudget = initiatives.reduce((sum, i) => sum + (i.budgetCents || 0), 0);
    const totalSpend = initiatives.reduce((sum, i) => sum + (i.actualSpendCents || 0), 0);

    return {
      summary: {
        totalBudget,
        totalSpend,
        remaining: totalBudget - totalSpend,
        utilizationPercent: totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0,
      },
      initiatives: initiatives.map((i) => ({
        id: i.id,
        name: i.name,
        budget: i.budgetCents || 0,
        spend: i.actualSpendCents || 0,
        remaining: (i.budgetCents || 0) - (i.actualSpendCents || 0),
        utilizationPercent:
          i.budgetCents && i.budgetCents > 0
            ? ((i.actualSpendCents || 0) / i.budgetCents) * 100
            : 0,
        status: i.status,
      })),
    };
  }
}

export const reportingService = new ReportingService();
