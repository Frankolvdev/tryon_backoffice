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

export type TryOnItemType =
  | "clothing"
  | "shoes"
  | "garment"
  | "footwear"
  | string;

export type TryOnQualityMode =
  | "standard"
  | "high"
  | "premium"
  | "fast"
  | string;

export interface TryOnJobSummary {
  id: number;
  user_id: number;
  person_image_file_id: number;
  item_image_file_id: number;
  result_file_id: number | null;
  pricing_rule_id: number | null;
  runpod_config_id: number | null;
  item_type: TryOnItemType;
  quality_mode: TryOnQualityMode;
  status: TryOnJobStatus;
  tokens_cost: number;
  estimated_gpu_seconds: number | null;
  estimated_gpu_cost_cents: number | null;
  actual_gpu_seconds: number | null;
  actual_gpu_cost_cents: number | null;
  prompt: string | null;
  error_message: string | null;
  runpod_job_id: string | null;
  comfy_workflow_name: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TryOnJobAdminUpdate {
  status?: TryOnJobStatus | null;
  error_message?: string | null;
  runpod_job_id?: string | null;
  comfy_workflow_name?: string | null;
  actual_gpu_seconds?: number | null;
  actual_gpu_cost_cents?: number | null;
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
