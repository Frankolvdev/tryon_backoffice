export type TryOnJobStatus =
  | "queued"
  | "pending"
  | "processing"
  | "running"
  | "completed"
  | "failed"
  | "canceled"
  | "cancelled"
  | "retrying"
  | string;

export interface TryOnJobSummary {
  id: number | string;
  user_id?: number | null;
  workflow_id?: number | string | null;
  workflow_name?: string | null;
  status: TryOnJobStatus;
  tokens_consumed?: number | null;
  estimated_gpu_cost_cents?: number | null;
  actual_gpu_cost_cents?: number | null;
  created_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  [key: string]: unknown;
}

export interface TryOnJobListResponse {
  items?: TryOnJobSummary[];
  total?: number;
  skip?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface TryOnOverviewMetrics {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  canceled: number;
  tokensConsumed: number;
  estimatedGpuCostCents: number;
  actualGpuCostCents: number;
}

export interface TryOnModuleSection {
  key: "overview" | "jobs" | "workflows" | "integrations";
  label: string;
  description: string;
  href: string;
}
