import { PrismaClient, Prisma, DecisionStatus, DecisionType } from '@prisma/client';
import { prisma } from '../lib/prisma';

const prismaClient = prisma;

export interface DecisionFilters {
  status?: DecisionStatus;
  type?: DecisionType;
  initiativeId?: number;
  requestedBy?: number;
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

export class DecisionService {
  private static instance: DecisionService;

  static getInstance(): DecisionService {
    if (!DecisionService.instance) {
      DecisionService.instance = new DecisionService();
    }
    return DecisionService.instance;
  }

  async findAll(
    filters: DecisionFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.DecisionWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.initiativeId) {
      where.initiativeId = filters.initiativeId;
    }

    if (filters.requestedBy) {
      where.requestedById = filters.requestedBy;
    }

    const [decisions, total] = await Promise.all([
      prismaClient.decision.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
        include: {
          initiative: {
            select: {
              id: true,
              code: true,
              title: true,
              status: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prismaClient.decision.count({ where }),
    ]);

    return {
      data: decisions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<any | null> {
    return prismaClient.decision.findUnique({
      where: { id },
      include: {
        initiative: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        requestedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.DecisionCreateInput): Promise<any> {
    return prismaClient.decision.create({
      data: {
        ...data,
        status: DecisionStatus.PENDING,
      },
      include: {
        initiative: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.DecisionUpdateInput): Promise<any> {
    const existingDecision = await prismaClient.decision.findUnique({
      where: { id },
    });

    if (!existingDecision) {
      throw new Error('Decision not found');
    }

    // Validate status transition if status is being updated
    if (data.status) {
      const newStatus = data.status as DecisionStatus;
      this.validateStatusTransition(existingDecision.status, newStatus);
    }

    return prismaClient.decision.update({
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
        requestedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prismaClient.decision.delete({
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

  async approveDecision(
    id: number,
    approverId: number,
    rationale?: string
  ): Promise<any> {
    const decision = await prismaClient.decision.update({
      where: { id },
      data: {
        status: DecisionStatus.APPROVED,
        approvedById: approverId,
        approvedAt: new Date(),
        rationale: rationale || null,
      },
      include: {
        initiative: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return decision;
  }

  async rejectDecision(
    id: number,
    approverId: number,
    rationale?: string
  ): Promise<any> {
    const decision = await prismaClient.decision.update({
      where: { id },
      data: {
        status: DecisionStatus.REJECTED,
        approvedById: approverId,
        approvedAt: new Date(),
        rationale: rationale || null,
      },
      include: {
        initiative: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return decision;
  }

  async implementDecision(id: number): Promise<any> {
    const decision = await prismaClient.decision.update({
      where: { id },
      data: {
        status: DecisionStatus.IMPLEMENTED,
      },
      include: {
        initiative: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return decision;
  }

  private validateStatusTransition(
    currentStatus: DecisionStatus,
    newStatus: DecisionStatus
  ): void {
    const validTransitions: Record<DecisionStatus, DecisionStatus[]> = {
      [DecisionStatus.PENDING]: [DecisionStatus.APPROVED, DecisionStatus.REJECTED, DecisionStatus.DEFERRED],
      [DecisionStatus.APPROVED]: [DecisionStatus.IMPLEMENTED],
      [DecisionStatus.REJECTED]: [],
      [DecisionStatus.DEFERRED]: [DecisionStatus.PENDING],
      [DecisionStatus.IMPLEMENTED]: [],
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

export const decisionService = DecisionService.getInstance();
