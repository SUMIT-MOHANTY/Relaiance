import { PrismaClient, Prisma, Trend } from '@prisma/client';
import { prisma } from '../lib/prisma';

const prismaClient = prisma;

export interface AdoptionSignalFilters {
  metric?: string;
  initiativeId?: number;
  trend?: Trend;
  startDate?: Date;
  endDate?: Date;
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

export interface AdoptionSignalWithAttainment extends Record<string, unknown> {
  id: number;
  attainmentRate: number;
}

export class AdoptionSignalService {
  private static instance: AdoptionSignalService;

  static getInstance(): AdoptionSignalService {
    if (!AdoptionSignalService.instance) {
      AdoptionSignalService.instance = new AdoptionSignalService();
    }
    return AdoptionSignalService.instance;
  }

  async findAll(
    filters: AdoptionSignalFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.AdoptionSignalWhereInput = {};

    if (filters.metric) {
      where.metric = filters.metric;
    }

    if (filters.initiativeId) {
      where.initiativeId = filters.initiativeId;
    }

    if (filters.trend) {
      where.trend = filters.trend;
    }

    if (filters.startDate || filters.endDate) {
      where.recordedAt = {};
      if (filters.startDate) {
        where.recordedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.recordedAt.lte = filters.endDate;
      }
    }

    const [signals, total] = await Promise.all([
      prismaClient.adoptionSignal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' },
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
      prismaClient.adoptionSignal.count({ where }),
    ]);

    // Calculate attainment rate for each signal
    const signalsWithAttainment = signals.map(signal => ({
      ...signal,
      attainmentRate: this.calculateAttainmentRate(
        signal.value,
        signal.targetValue
      ),
    }));

    return {
      data: signalsWithAttainment,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<any | null> {
    const signal = await prismaClient.adoptionSignal.findUnique({
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

    if (!signal) return null;

    return {
      ...signal,
      attainmentRate: this.calculateAttainmentRate(
        signal.value,
        signal.targetValue
      ),
    };
  }

  async create(data: Prisma.AdoptionSignalCreateInput): Promise<any> {
    // Calculate trend based on previous signals
    const trend = await this.calculateTrend(
      data.initiative.connect?.id || (data.initiative as any).id,
      data.metric as string,
      data.value as any
    );

    const signal = await prismaClient.adoptionSignal.create({
      data: {
        ...data,
        trend,
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
      ...signal,
      attainmentRate: this.calculateAttainmentRate(
        signal.value,
        signal.targetValue
      ),
    };
  }

  async update(id: number, data: Prisma.AdoptionSignalUpdateInput): Promise<any> {
    const existingSignal = await prismaClient.adoptionSignal.findUnique({
      where: { id },
    });

    if (!existingSignal) {
      throw new Error('Adoption signal not found');
    }

    // Recalculate trend if value changed
    let trend = existingSignal.trend;
    if (data.value !== undefined) {
      trend = await this.calculateTrend(
        existingSignal.initiativeId,
        existingSignal.metric,
        data.value as any
      );
    }

    const signal = await prismaClient.adoptionSignal.update({
      where: { id },
      data: {
        ...data,
        trend,
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
      ...signal,
      attainmentRate: this.calculateAttainmentRate(
        signal.value,
        signal.targetValue
      ),
    };
  }

  async delete(id: number): Promise<void> {
    await prismaClient.adoptionSignal.delete({
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

  async getSignalsByMetric(
    initiativeId: number,
    metric: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<any>> {
    return this.findAll(
      { initiativeId, metric },
      pagination
    );
  }

  async getAggregatedSignals(initiativeId: number): Promise<any> {
    const signals = await prismaClient.adoptionSignal.findMany({
      where: { initiativeId },
      orderBy: { recordedAt: 'desc' },
    });

    // Group by metric
    const byMetric = signals.reduce((acc, signal) => {
      if (!acc[signal.metric]) {
        acc[signal.metric] = [];
      }
      acc[signal.metric].push(signal);
      return acc;
    }, {} as Record<string, typeof signals>);

    // Calculate summary for each metric
    const summary = Object.entries(byMetric).map(([metric, metricSignals]) => {
      const latest = metricSignals[0];
      const values = metricSignals.map(s => Number(s.value));
      const average = values.reduce((a, b) => a + b, 0) / values.length;

      return {
        metric,
        latestValue: latest.value,
        targetValue: latest.targetValue,
        attainmentRate: this.calculateAttainmentRate(latest.value, latest.targetValue),
        trend: latest.trend,
        averageValue: Math.round(average * 100) / 100,
        dataPoints: metricSignals.length,
        lastRecorded: latest.recordedAt,
      };
    });

    return {
      totalSignals: signals.length,
      uniqueMetrics: Object.keys(byMetric).length,
      byMetric: summary,
    };
  }

  async getHealthScore(initiativeId: number): Promise<number> {
    const signals = await prismaClient.adoptionSignal.findMany({
      where: { initiativeId },
      orderBy: { recordedAt: 'desc' },
    });

    if (signals.length === 0) {
      return 50; // Default neutral score
    }

    // Get latest signal for each metric
    const latestByMetric = new Map<string, typeof signals[0]>();
    for (const signal of signals) {
      if (!latestByMetric.has(signal.metric)) {
        latestByMetric.set(signal.metric, signal);
      }
    }

    // Calculate average attainment rate
    let totalAttainment = 0;
    let count = 0;

    for (const signal of latestByMetric.values()) {
      if (signal.targetValue > 0) {
        const attainment = (Number(signal.value) / Number(signal.targetValue)) * 100;
        totalAttainment += Math.min(attainment, 100);
        count++;
      }
    }

    if (count === 0) return 50;

    return Math.round(totalAttainment / count);
  }

  private calculateAttainmentRate(value: any, targetValue: any): number {
    const val = Number(value) || 0;
    const target = Number(targetValue) || 0;

    if (target === 0) return 0;

    const rate = (val / target) * 100;
    return Math.round(rate * 100) / 100;
  }

  private async calculateTrend(
    initiativeId: number,
    metric: string,
    currentValue: number
  ): Promise<Trend> {
    const previousSignals = await prismaClient.adoptionSignal.findMany({
      where: {
        initiativeId,
        metric,
      },
      orderBy: { recordedAt: 'desc' },
      take: 3,
    });

    if (previousSignals.length < 2) {
      return Trend.STABLE;
    }

    const values = previousSignals.map(s => Number(s.value));
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    const threshold = average * 0.1; // 10% threshold

    if (currentValue > average + threshold) {
      return Trend.IMPROVING;
    } else if (currentValue < average - threshold) {
      return Trend.DECLINING;
    }

    return Trend.STABLE;
  }
}

export const adoptionSignalService = AdoptionSignalService.getInstance();
