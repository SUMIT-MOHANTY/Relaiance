import { PrismaClient, Prisma, MilestoneStatus, Health } from '@prisma/client';
import { prisma } from '../lib/prisma';

const prismaClient = prisma;

export interface MilestoneFilters {
  status?: MilestoneStatus;
  health?: Health;
  initiativeId?: number;
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

export class MilestoneService {
  private static instance: MilestoneService;

  static getInstance(): MilestoneService {
    if (!MilestoneService.instance) {
      MilestoneService.instance = new MilestoneService();
    }
    return MilestoneService.instance;
  }

  async findAll(
    filters: MilestoneFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.MilestoneWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.health) {
      where.health = filters.health;
    }

    if (filters.initiativeId) {
      where.initiativeId = filters.initiativeId;
    }

    const [milestones, total] = await Promise.all([
      prismaClient.milestone.findMany({
        where,
        skip,
        take: limit,
        orderBy: { plannedDate: 'asc' },
        include: {
          initiative: {
            select: {
              id: true,
              code: true,
              title: true,
            },
          },
          dependencies: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          dependents: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      prismaClient.milestone.count({ where }),
    ]);

    return {
      data: milestones,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<any | null> {
    return prismaClient.milestone.findUnique({
      where: { id },
      include: {
        initiative: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
          },
        },
        dependencies: {
          select: {
            id: true,
            title: true,
            status: true,
            plannedDate: true,
          },
        },
        dependents: {
          select: {
            id: true,
            title: true,
            status: true,
            plannedDate: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.MilestoneCreateInput): Promise<any> {
    // Validate status transition (default to DRAFT if not provided)
    const status = (data.status as MilestoneStatus) || MilestoneStatus.DRAFT;
    
    return prismaClient.milestone.create({
      data: {
        ...data,
        status,
      },
      include: {
        initiative: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.MilestoneUpdateInput): Promise<any> {
    const existingMilestone = await prismaClient.milestone.findUnique({
      where: { id },
    });

    if (!existingMilestone) {
      throw new Error('Milestone not found');
    }

    // Validate status transition if status is being updated
    if (data.status) {
      const newStatus = data.status as MilestoneStatus;
      this.validateStatusTransition(existingMilestone.status, newStatus);
    }

    return prismaClient.milestone.update({
      where: { id },
      data,
      include: {
        initiative: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prismaClient.milestone.delete({
      where: { id },
    });
  }

  async findByInitiativeId(
    initiativeId: number,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<any>> {
    return this.findAll(
      { initiativeId },
      pagination
    );
  }

  async addDependency(milestoneId: number, dependencyId: number): Promise<void> {
    if (milestoneId === dependencyId) {
      throw new Error('A milestone cannot depend on itself');
    }

    await prismaClient.milestone.update({
      where: { id: milestoneId },
      data: {
        dependencies: {
          connect: { id: dependencyId },
        },
      },
    });
  }

  async removeDependency(milestoneId: number, dependencyId: number): Promise<void> {
    await prismaClient.milestone.update({
      where: { id: milestoneId },
      data: {
        dependencies: {
          disconnect: { id: dependencyId },
        },
      },
    });
  }

  private validateStatusTransition(
    currentStatus: MilestoneStatus,
    newStatus: MilestoneStatus
  ): void {
    const validTransitions: Record<MilestoneStatus, MilestoneStatus[]> = {
      [MilestoneStatus.DRAFT]: [MilestoneStatus.IN_PROGRESS, MilestoneStatus.CANCELLED],
      [MilestoneStatus.IN_PROGRESS]: [MilestoneStatus.COMPLETED, MilestoneStatus.BLOCKED, MilestoneStatus.CANCELLED],
      [MilestoneStatus.BLOCKED]: [MilestoneStatus.IN_PROGRESS, MilestoneStatus.CANCELLED],
      [MilestoneStatus.COMPLETED]: [],
      [MilestoneStatus.CANCELLED]: [],
    };

    if (currentStatus === newStatus) return;

    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`
      );
    }
  }
}

export const milestoneService = MilestoneService.getInstance();
