// Simple performance monitoring

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  record(name: string, value: number): void {
    if (this.metrics.length >= this.maxMetrics) {
      this.metrics.shift();
    }

    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });
  }

  getMetrics(name?: string, since?: number): PerformanceMetric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter((m) => m.name === name);
    }

    if (since) {
      filtered = filtered.filter((m) => m.timestamp >= since);
    }

    return filtered;
  }

  getAverages(since?: number): Record<string, number> {
    const metrics = this.getMetrics(undefined, since);
    const sums: Record<string, { total: number; count: number }> = {};

    for (const metric of metrics) {
      if (!sums[metric.name]) {
        sums[metric.name] = { total: 0, count: 0 };
      }
      sums[metric.name].total += metric.value;
      sums[metric.name].count++;
    }

    const averages: Record<string, number> = {};
    for (const [name, { total, count }] of Object.entries(sums)) {
      averages[name] = Math.round(total / count);
    }

    return averages;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

// Timer helper
export function timeAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    metrics.record(name, duration);
  });
}

// Health check data
export async function getHealthStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  metrics: Record<string, number>;
}> {
  const uptimeSeconds = process.uptime();
  const recentAverages = metrics.getAverages(Date.now() - 5 * 60 * 1000);

  // Determine health based on response times
  const avgResponseTime = recentAverages['api_response_time'] || 0;
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  if (avgResponseTime > 5000) {
    status = 'unhealthy';
  } else if (avgResponseTime > 1000) {
    status = 'degraded';
  }

  return {
    status,
    uptime: uptimeSeconds,
    metrics: recentAverages,
  };
}
