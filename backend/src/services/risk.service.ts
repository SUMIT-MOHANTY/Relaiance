import { PrismaClient, Prisma, RiskStatus, Probability, Impact } from '@prisma/client';
import { prisma } from '../lib/prisma';

const prismaClient = prisma;

// Severity weights for impact score calculation
const IMPACT_WEIGHTS: Record<Impact, number> = {
  [Impact.LOW]: 1,
  [Impact.MEDIUM]: 2,
  [Impact.HIGH]: 3,
  [Impact.SEVERE]: 4,
};

const PROBABILITY_VALUES: Record<Probability, number> = {
  [Probability.LOW]: 1,
  [Probability.MEDIUM]: 2,
  [Probability.HIGH]: 3,
};

export interface RiskFilters {
  status?: RiskStatus;
  probability?: Probability;
  impact?: Impact;
  initiativeId?: number;
  minScore?: number;
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

export interface RiskWithScore extends Record<string, unknown> {
  id: number;
  impactScore: number;
}

export class RiskService {
  private static instance: RiskService;

  static getInstance(): RiskService {
    if (!RiskService.instance) {
      RiskService.instance = new RiskService();
    }
    return RiskService.instance;
  }

  async findAll(
    filters: RiskFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.RiskWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.probability) {
      where.probability = filters.probability;
    }

    if (filters.impact) {
      where.impact = filters.impact;
    }

    if (filters.initiativeId) {
      where.initiativeId = filters.initiativeId;
    }

    const [risks, total] = await Promise.all([
      prismaClient.risk.findMany({
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
      prismaClient.risk.count({ where }),
    ]);

    // Calculate impact score for each risk
    const risksWithScore = risks.map(risk => ({
      ...risk,
      impactScore: this.calculateImpactScore(risk.probability, risk.impact),
    }));

    // Filter by minScore if provided
    let filteredRisks = risksWithScore;
    if (filters.minScore !== undefined) {
      filteredRisks = risksWithScore.filter(r => r.impactScore >= filters.minScore!);
    }

    return {
      data: filteredRisks,
      meta: {
        page,
        limit,
        total: filters.minScore !== undefined ? filteredRisks.length : total,
        totalPages: Math.ceil((filters.minScore !== undefined ? filteredRisks.length : total) / limit),
      },
    };
  }

  async findById(id: number): Promise<any | null> {
    const risk = await prismaClient.risk.findUnique({
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

    if (!risk) return null;

    return {
      ...risk,
      impactScore: this.calculateImpactScore(risk.probability, risk.impact),
    };
  }

  async create(data: Prisma.RiskCreateInput): Promise<any> {
    // Calculate score automatically
    const probability = data.probability as Probability;
    const impact = data.impact as Impact;
    const score = this.calculateImpactScore(probability, impact);

    const risk = await prismaClient.risk.create({
      data: {
        ...data,
        score,
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
      ...risk,
      impactScore: score,
    };
  }

  async update(id: number, data: Prisma.RiskUpdateInput): Promise<any> {
    const existingRisk = await prismaClient.risk.findUnique({
      where: { id },
    });

    if (!existingRisk) {
      throw new Error('Risk not found');
    }

    // Recalculate score if probability or impact changed
    let score = existingRisk.score;
    if (data.probability || data.impact) {
      const probability = (data.probability as Probability) || existingRisk.probability;
      const impact = (data.impact as Impact) || existingRisk.impact;
      score = this.calculateImpactScore(probability, impact);
    }

    const risk = await prismaClient.risk.update({
      where: { id },
      data: {
        ...data,
        score,
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
      ...risk,
      impactScore: score,
    };
  }

  async delete(id: number): Promise<void> {
    await prismaClient.risk.delete({
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

  async getBlockedRisks(pagination: PaginationParams = {}): Promise<PaginatedResult<any>> {
    // Get critical and high impact risks that are not closed
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.RiskWhereInput = {
      status: { not: RiskStatus.CLOSED },
      OR: [
        { impact: Impact.SEVERE },
        { impact: Impact.HIGH, probability: Probability.HIGH },
      ],
    };

    const [risks, total] = await Promise.all([
      prismaClient.risk.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { impact: 'desc' },
          { probability: 'desc' },
          { createdAt: 'desc' },
        ],
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
      }),
      prismaClient.risk.count({ where }),
    ]);

    const risksWithScore = risks.map(risk => ({
      ...risk,
      impactScore: this.calculateImpactScore(risk.probability, risk.impact),
    }));

    return {
      data: risksWithScore,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async escalateRisk(id: number, escalatedTo: string): Promise<any> {
    const risk = await prismaClient.risk.update({
      where: { id },
      data: {
        status: RiskStatus.ESCALATED,
        escalatedTo,
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
      ...risk,
      impactScore: this.calculateImpactScore(risk.probability, risk.impact),
    };
  }

  private calculateImpactScore(probability: Probability, impact: Impact): number {
    const probabilityValue = PROBABILITY_VALUES[probability] || 1;
    const impactWeight = IMPACT_WEIGHTS[impact] || 1;
    return probabilityValue * impactWeight;
  }
}

export const riskService = RiskService.getInstance();
