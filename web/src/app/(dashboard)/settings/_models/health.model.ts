export interface HealthStats {
  users?: number;
  mcpServers?: number;
  pages?: number;
}

export interface HealthResponse {
  status?: string;
  statusCode?: number;
  error?: string;
  message?: string | string[];
  timestamp?: string;
  stats?: HealthStats;
}

export interface HealthCheckResult {
  data: HealthResponse | null;
  latencyMs: number | null;
  error: string | null;
}
