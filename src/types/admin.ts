export interface AdminNotificationCountResponse {
  total: number;
  unread: number;
  urgent: number;
  requires_action: number;
}

export interface AdminDashboardResponse {
  total_users: number;
  active_users: number;
  suspended_users: number;
  deleted_users: number;

  total_tryon_jobs: number;
  completed_tryon_jobs: number;
  failed_tryon_jobs: number;
  queued_tryon_jobs: number;

  total_tokens_issued: number;
  total_tokens_consumed: number;

  estimated_gpu_cost_cents: number;
  actual_gpu_cost_cents: number;

  total_storage_files: number;
}

export interface AnalyticsSummaryResponse {
  total_users: number;
  active_users: number;

  total_tryon_jobs: number;
  completed_tryon_jobs: number;
  failed_tryon_jobs: number;

  total_tokens_issued: number;
  total_tokens_consumed: number;

  estimated_gpu_cost_cents: number;
  actual_gpu_cost_cents: number;

  total_storage_files: number;
}

export interface DailyMetricPoint {
  date: string;
  value: number;
}

export interface DailyCostPoint {
  date: string;
  estimated_cost_cents: number;
  actual_cost_cents: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummaryResponse;
  users_by_day: DailyMetricPoint[];
  tryon_jobs_by_day: DailyMetricPoint[];
  tokens_issued_by_day: DailyMetricPoint[];
  tokens_consumed_by_day: DailyMetricPoint[];
  gpu_costs_by_day: DailyCostPoint[];
}

export interface ServiceHealthResponse {
  service: string;
  status: string;
  details?: Record<string, unknown> | null;
}

export interface SystemResourcesResponse {
  [key: string]: unknown;
}

export interface MonitoringResponse {
  api: ServiceHealthResponse;
  database: ServiceHealthResponse;
  redis: ServiceHealthResponse;
  storage: ServiceHealthResponse;
  resources: SystemResourcesResponse;
}