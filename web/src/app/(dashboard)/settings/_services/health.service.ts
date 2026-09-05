import { HealthCheckResult, HealthResponse } from '../_models/health.model';

export async function checkServerHealth(): Promise<HealthCheckResult> {
  const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const startTime = performance.now();

  try {
    const response = await fetch(`${serverUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    let rawData: Record<string, unknown> = {};
    try {
      rawData = await response.json();
    } catch {
      rawData = {
        message: response.statusText || `HTTP status ${response.status}`,
      };
    }

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (!response.ok) {
      const errorMsg =
        (Array.isArray(rawData.message) ? rawData.message.join(', ') : (rawData.message as string)) ||
        (rawData.error as string) ||
        `Server returned error HTTP ${response.status} (${response.statusText})`;

      return {
        data: {
          status: 'error',
          statusCode: response.status,
          error: (rawData.error as string) || response.statusText,
          message: errorMsg,
          timestamp: (rawData.timestamp as string) || new Date().toISOString(),
          stats: rawData.stats as HealthResponse['stats'],
        },
        latencyMs,
        error: errorMsg,
      };
    }

    const status = (rawData.status as string) || 'ok';

    return {
      data: {
        ...rawData,
        status,
        timestamp: (rawData.timestamp as string) || new Date().toISOString(),
      } as HealthResponse,
      latencyMs,
      error: null,
    };
  } catch (err: unknown) {
    const endTime = performance.now();
    const errorMessage = err instanceof Error ? err.message : 'Unable to connect to backend server';

    return {
      data: {
        status: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      latencyMs: Math.round(endTime - startTime),
      error: errorMessage,
    };
  }
}
