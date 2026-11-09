import { PrismaClient, Prisma, InitiativeStatus, Priority, UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma';

const prismaClient = prisma;

export interface InitiativeFilters {
  status?: InitiativeStatus;
  priority?: Priority;
  department?: string;
  ownerId?: number;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PortfolioSummary {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byDepartment: Record<string, number>;
  totalBudget: number;
  totalActualSpend: number;
  averageHealthScore: number;
  blockedCount: number;
}

export interface DependencyNode {
  id: number;
  code: string;
  title: string;
  status: InitiativeStatus;
}

export interface DependencyEdge {
  fromId: number;
  toId: number;
  status: string;
  type: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export class InitiativeService {
  private static instance: InitiativeService;

  static getInstance(): InitiativeService {
    if (!InitiativeService.instance) {
      InitiativeService.instance = new InitiativeService();
    }
    return InitiativeService.instance;
  }

  async findAll(
    filters: InitiativeFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.InitiativeWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [initiatives, total] = await Promise.all([
      prismaClient.initiative.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          _count: {
            select: {
              milestones: true,
              risks: true,
              benefits: true,
              adoptionSignals: true,
            },
          },
        },
      }),
      prismaClient.initiative.count({ where }),
    ]);

    // Calculate health score for each initiative
    const initiativesWithHealth = await Promise.all(
      initiatives.map(async (initiative) => {
        const healthScore = await this.calculateHealthScore(initiative.id);
        return {
          ...initiative,
          healthScore,
        };
      })
    );

    return {
      data: initiativesWithHealth,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<any | null> {
    const initiative = await prismaClient.initiative.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            department: true,
          },
        },
        milestones: {
          orderBy: { plannedDate: 'asc' },
        },
        risks: {
          orderBy: { createdAt: 'desc' },
        },
        decisions: {
          orderBy: { requestedAt: 'desc' },
          include: {
            requestedBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        benefits: {
          orderBy: { createdAt: 'desc' },
        },
        adoptionSignals: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        agentActions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
        },
        _count: {
          select: {
            milestones: true,
            risks: true,
            decisions: true,
            benefits: true,
            adoptionSignals: true,
            agentActions: true,
          },
        },
      },
    });

    if (!initiative) return null;

    const healthScore = await this.calculateHealthScore(initiative.id);

    return {
      ...initiative,
      healthScore,
    };
  }

  async create(data: Prisma.InitiativeCreateInput): Promise<any> {
    const initiative = await prismaClient.initiative.create({
      data,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return initiative;
  }

  async update(id: number, data: Prisma.InitiativeUpdateInput): Promise<any> {
    const initiative = await prismaClient.initiative.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return initiative;
  }

  async delete(id: number): Promise<void> {
    await prismaClient.initiative.delete({
      where: { id },
    });
  }

  async getSummary(): Promise<PortfolioSummary> {
    const [
      total,
      byStatus,
      byPriority,
      byDepartment,
      budgetAgg,
      blockedCount,
    ] = await Promise.all([
      prismaClient.initiative.count(),
      prismaClient.initiative.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prismaClient.initiative.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
      prismaClient.initiative.groupBy({
        by: ['department'],
        _count: { id: true },
      }),
      prismaClient.initiative.aggregate({
        _sum: {
          budgetCents: true,
          actualSpendCents: true,
        },
      }),
      prismaClient.initiative.count({
        where: { status: InitiativeStatus.AT_RISK },
      }),
    ]);

    // Calculate average health score
    const initiatives = await prismaClient.initiative.findMany({
      select: { id: true },
    });

    let totalHealthScore = 0;
    for (const initiative of initiatives) {
      totalHealthScore += await this.calculateHealthScore(initiative.id);
    }

    const averageHealthScore = initiatives.length > 0
      ? Math.round(totalHealthScore / initiatives.length)
      : 0;

    return {
      total,
      byStatus: byStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, curr) => {
        acc[curr.priority] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
      byDepartment: byDepartment.reduce((acc, curr) => {
        acc[curr.department || 'Unassigned'] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
      totalBudget: Number(budgetAgg._sum.budgetCents || 0) / 100,
      totalActualSpend: Number(budgetAgg._sum.actualSpendCents || 0) / 100,
      averageHealthScore,
      blockedCount,
    };
  }

  async getDependencyGraph(id: number): Promise<DependencyGraph> {
    const initiative = await prismaClient.initiative.findUnique({
      where: { id },
      include: {
        dependencies: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
          },
        },
        dependents: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!initiative) {
      throw new Error('Initiative not found');
    }

    const nodes: DependencyNode[] = [
      { id: initiative.id, code: initiative.code, title: initiative.title, status: initiative.status },
      ...initiative.dependencies.map(d => ({ id: d.id, code: d.code, title: d.title, status: d.status })),
      ...initiative.dependents.map(d => ({ id: d.id, code: d.code, title: d.title, status: d.status })),
    ];

    const edges: DependencyEdge[] = [
      ...initiative.dependencies.map(d => ({
        fromId: d.id,
        toId: initiative.id,
        status: 'DEPENDS_ON',
        type: 'BLOCKING',
      })),
      ...initiative.dependents.map(d => ({
        fromId: initiative.id,
        toId: d.id,
        status: 'BLOCKS',
        type: 'BLOCKING',
      })),
    ];

    return { nodes, edges };
  }

  async addDependency(initiativeId: number, dependencyId: number): Promise<void> {
    if (initiativeId === dependencyId) {
      throw new Error('An initiative cannot depend on itself');
    }

    await prismaClient.initiative.update({
      where: { id: initiativeId },
      data: {
        dependencies: {
          connect: { id: dependencyId },
        },
      },
    });
  }

  async removeDependency(initiativeId: number, dependencyId: number): Promise<void> {
    await prismaClient.initiative.update({
      where: { id: initiativeId },
      data: {
        dependencies: {
          disconnect: { id: dependencyId },
        },
      },
    });
  }

  private async calculateHealthScore(initiativeId: number): Promise<number> {
    // Get adoption signals for this initiative
    const signals = await prismaClient.adoptionSignal.findMany({
      where: { initiativeId },
      orderBy: { recordedAt: 'desc' },
    });

    if (signals.length === 0) {
      return 50; // Default neutral score
    }

    // Calculate average attainment rate
    let totalAttainment = 0;
    let count = 0;

    for (const signal of signals) {
      if (signal.targetValue > 0) {
        const attainment = (Number(signal.value) / Number(signal.targetValue)) * 100;
        totalAttainment += Math.min(attainment, 100); // Cap at 100%
        count++;
      }
    }

    if (count === 0) return 50;

    const averageAttainment = totalAttainment / count;

    // Get risk count for this initiative
    const riskCount = await prismaClient.risk.count({
      where: {
        initiativeId,
        status: { not: 'CLOSED' },
      },
    });

    // Adjust score based on risks
    const riskPenalty = riskCount * 5;

    // Final health score (0-100)
    const healthScore = Math.max(0, Math.min(100, averageAttainment - riskPenalty));

    return Math.round(healthScore);
  }

  async canModify(userId: number, initiativeId: number): Promise<boolean> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    // Admin and Finance can modify any initiative
    if (user.role === UserRole.ADMIN || user.role === UserRole.FINANCE) {
      return true;
    }

    // Team members can only modify their own initiatives
    const initiative = await prismaClient.initiative.findUnique({
      where: { id: initiativeId },
    });

    if (!initiative) return false;

    return initiative.ownerId === userId;
  }
}

export const initiativeService = InitiativeService.getInstance();
