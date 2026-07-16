export interface ServiceHealth {
  service: string;
  status: string;
  details: Record<string, unknown> | null;
}

export interface SystemResources {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
}

export interface SystemMonitoringResponse {
  api: ServiceHealth;
  database: ServiceHealth;
  redis: ServiceHealth;
  storage: ServiceHealth;
  resources: SystemResources;
}

export interface OperationalEvent {
  id: number;
  event_type: string;
  source: string;
  severity: "info" | "warning" | "error" | "critical" | string;
  message: string;
  correlation_id: string | null;
  user_id: number | null;
  background_job_id: number | null;
  tryon_job_id: number | null;
  provider_job_id: string | null;
  exception_type: string | null;
  exception_message: string | null;
  details: Record<string, unknown>;
  is_resolved: boolean;
  resolved_by_user_id: number | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
}

export interface OperationalEventListResponse {
  items: OperationalEvent[];
  total: number;
  skip: number;
  limit: number;
}

export interface OperationalEventSummary {
  total: number;
  unresolved: number;
  info: number;
  warnings: number;
  errors: number;
  critical: number;
  by_source: Record<string, number>;
  generated_at: string;
}
export interface OperationalEventResolveRequest {
  resolution_note: string;
}

export interface OperationalEventResolveResponse {
  event: OperationalEvent;
  resolved: boolean;
  message: string;
}
