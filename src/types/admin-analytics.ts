export interface DailyMetricPoint {
  date: string;
  value: number;
}

export interface DailyCostPoint {
  date: string;
  estimated_gpu_cost_cents: number;
  actual_gpu_cost_cents: number;
}

export interface AnalyticsSummary {
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

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  users_by_day: DailyMetricPoint[];
  tryon_jobs_by_day: DailyMetricPoint[];
  tokens_issued_by_day: DailyMetricPoint[];
  tokens_consumed_by_day: DailyMetricPoint[];
  gpu_costs_by_day: DailyCostPoint[];
}
