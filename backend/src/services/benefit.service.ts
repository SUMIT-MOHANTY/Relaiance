import { PrismaClient, Prisma, BenefitType } from '@prisma/client';
import { prisma } from '../lib/prisma';

const prismaClient = prisma;

export interface BenefitFilters {
  type?: BenefitType;
  initiativeId?: number;
  isRealized?: boolean;
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

export interface BenefitWithRealization extends Record<string, unknown> {
  id: number;
  realizationRate: number;
  variancePercent: number;
}

export class BenefitService {
  private static instance: BenefitService;

  static getInstance(): BenefitService {
    if (!BenefitService.instance) {
      BenefitService.instance = new BenefitService();
    }
    return BenefitService.instance;
  }

  async findAll(
    filters: BenefitFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.BenefitWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.initiativeId) {
      where.initiativeId = filters.initiativeId;
    }

    if (filters.isRealized !== undefined) {
      if (filters.isRealized) {
        where.actualValue = { not: null };
      } else {
        where.actualValue = null;
      }
    }

    const [benefits, total] = await Promise.all([
      prismaClient.benefit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          initiative: {
            select: {
              id: true,
              code: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      prismaClient.benefit.count({ where }),
    ]);

    // Calculate realization rate for each benefit
    const benefitsWithRealization = benefits.map(benefit => ({
      ...benefit,
      realizationRate: this.calculateRealizationRate(
        benefit.actualValue,
        benefit.targetValue
      ),
    }));

    return {
      data: benefitsWithRealization,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<any | null> {
    const benefit = await prismaClient.benefit.findUnique({
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
      },
    });

    if (!benefit) return null;

    return {
      ...benefit,
      realizationRate: this.calculateRealizationRate(
        benefit.actualValue,
        benefit.targetValue
      ),
    };
  }

  async create(data: Prisma.BenefitCreateInput): Promise<any> {
    const benefit = await prismaClient.benefit.create({
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

    return {
      ...benefit,
      realizationRate: this.calculateRealizationRate(
        benefit.actualValue,
        benefit.targetValue
      ),
    };
  }

  async update(id: number, data: Prisma.BenefitUpdateInput): Promise<any> {
    const existingBenefit = await prismaClient.benefit.findUnique({
      where: { id },
    });

    if (!existingBenefit) {
      throw new Error('Benefit not found');
    }

    // Calculate variance percent if actual value is being updated
    let variancePercent = existingBenefit.variancePercent;
    if (data.actualValue !== undefined) {
      const targetValue = existingBenefit.targetValue;
      const actualValue = data.actualValue as any;
      variancePercent = this.calculateVariancePercent(actualValue, targetValue);
    }

    const benefit = await prismaClient.benefit.update({
      where: { id },
      data: {
        ...data,
        variancePercent,
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

    return {
      ...benefit,
      realizationRate: this.calculateRealizationRate(
        benefit.actualValue,
        benefit.targetValue
      ),
    };
  }

  async delete(id: number): Promise<void> {
    await prismaClient.benefit.delete({
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

  async getBenefitsSummary(initiativeId: number): Promise<any> {
    const benefits = await prismaClient.benefit.findMany({
      where: { initiativeId },
    });

    const totalTarget = benefits.reduce(
      (sum, b) => sum + Number(b.targetValue || 0),
      0
    );
    const totalActual = benefits.reduce(
      (sum, b) => sum + Number(b.actualValue || 0),
      0
    );

    const byType = benefits.reduce((acc, benefit) => {
      if (!acc[benefit.type]) {
        acc[benefit.type] = { count: 0, target: 0, actual: 0 };
      }
      acc[benefit.type].count++;
      acc[benefit.type].target += Number(benefit.targetValue || 0);
      acc[benefit.type].actual += Number(benefit.actualValue || 0);
      return acc;
    }, {} as Record<string, { count: number; target: number; actual: number }>);

    return {
      totalBenefits: benefits.length,
      totalTarget,
      totalActual,
      overallRealizationRate: this.calculateRealizationRate(totalActual, totalTarget),
      byType,
    };
  }

  private calculateRealizationRate(
    actualValue: any,
    targetValue: any
  ): number {
    const actual = Number(actualValue) || 0;
    const target = Number(targetValue) || 0;

    if (target === 0) return 0;

    const rate = (actual / target) * 100;
    return Math.round(rate * 100) / 100; // Round to 2 decimal places
  }

  private calculateVariancePercent(
    actualValue: any,
    targetValue: any
  ): any {
    const actual = Number(actualValue) || 0;
    const target = Number(targetValue) || 0;

    if (target === 0) return null;

    const variance = ((actual - target) / target) * 100;
    return Math.round(variance * 100) / 100;
  }
}

export const benefitService = BenefitService.getInstance();
