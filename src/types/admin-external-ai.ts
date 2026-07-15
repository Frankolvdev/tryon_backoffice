export interface ExternalAiJobResponse {
  id: number;
  provider: string;
  provider_job_id: string | null;
  internal_job_type: string;
  internal_job_id: number | null;
  status: string;
  request: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunPodConfigResponse {
  id: number;
  name: string;
  mode: string;
  endpoint_id: string | null;
  endpoint_url: string | null;
  gpu_type: string | null;
  docker_image: string | null;
  comfy_workflow_name: string | null;
  min_workers: number;
  max_workers: number;
  estimated_cost_per_second_cents: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RunPodStatusResponse {
  external_ai_job_id: number;
  provider_job_id: string | null;
  status: string;
  raw_response: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error_message: string | null;
}

export interface RunPodCancelRequest {
  endpoint_id: string;
}

export interface RunPodCancelResponse {
  external_ai_job_id: number;
  provider_job_id: string | null;
  status: string;
  raw_response: Record<string, unknown> | null;
}
