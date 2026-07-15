export type ProbeState = "healthy" | "degraded" | "unavailable";

export interface MonitoringProbe {
  key: string;
  label: string;
  path: string;
  state: ProbeState;
  statusCode: number | null;
  latencyMs: number | null;
  detail: string;
  payload: unknown;
}

export interface MonitoringMetric {
  name: string;
  labels: Record<string, string>;
  value: number;
}

export interface TryonMonitoringSnapshot {
  checkedAt: string;
  backendBaseUrl: string;
  overallState: ProbeState;
  probes: MonitoringProbe[];
  metrics: MonitoringMetric[];
  metricsAvailable: boolean;
}
