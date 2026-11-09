/**
 * Adoption Metrics Adapter
 * Provides mock adoption signal data for initiatives
 */

export interface AdoptionMetric {
  initiativeId: string;
  metricName: string;
  currentValue: number;
  targetValue: number;
  measuredAt: string;
}

/**
 * Generate mock adoption metrics for an initiative
 */
export async function fetchAdoptionMetrics(initiativeId: string): Promise<AdoptionMetric[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const now = new Date().toISOString();
  
  // Return 3 mock metrics per initiative
  return [
    {
      initiativeId,
      metricName: 'training_completion',
      currentValue: 75.5,
      targetValue: 100.0,
      measuredAt: now,
    },
    {
      initiativeId,
      metricName: 'tool_usage',
      currentValue: 62.3,
      targetValue: 80.0,
      measuredAt: now,
    },
    {
      initiativeId,
      metricName: 'process_adoption',
      currentValue: 88.0,
      targetValue: 90.0,
      measuredAt: now,
    },
  ];
}

/**
 * Fetch a specific metric by name for an initiative
 */
export async function fetchAdoptionMetricByName(
  initiativeId: string,
  metricName: string
): Promise<AdoptionMetric | null> {
  const metrics = await fetchAdoptionMetrics(initiativeId);
  return metrics.find(m => m.metricName === metricName) || null;
}

/**
 * Calculate adoption trend (IMPROVING, STABLE, DECLINING)
 */
export function calculateAdoptionTrend(
  currentValue: number,
  previousValue: number,
  threshold: number = 5.0
): 'IMPROVING' | 'STABLE' | 'DECLINING' {
  const change = ((currentValue - previousValue) / previousValue) * 100;
  
  if (change > threshold) return 'IMPROVING';
  if (change < -threshold) return 'DECLINING';
  return 'STABLE';
}
