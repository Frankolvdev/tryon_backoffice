export interface BackgroundJob {
  id: number;
  public_id: string;
  job_type: string;
  queue_name: string;
  execution_mode: string;
  status: string;
  priority: number;
  user_id: number | null;
  tryon_job_id: number | null;
  external_ai_job_id: number | null;
  idempotency_key: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  error_code: string | null;
  error_message: string | null;
  error_details: Record<string, unknown>;
  progress: number;
  progress_message: string | null;
  attempt_count: number;
  max_attempts: number;
  retry_backoff_seconds: number;
  retry_backoff_multiplier: number;
  timeout_seconds: number;
  scheduled_at: string | null;
  available_at: string;
  queued_at: string | null;
  claimed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  canceled_at: string | null;
  cancel_requested_at: string | null;
  last_heartbeat_at: string | null;
  lease_owner: string | null;
  lease_expires_at: string | null;
  provider_job_id: string | null;
  provider_endpoint_id: string | null;
  worker_name: string | null;
  worker_version: string | null;
  is_cancelable: boolean;
  retain_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackgroundJobListResponse {
  items: BackgroundJob[];
  total: number;
  skip: number;
  limit: number;
}

export interface BackgroundJobAttempt {
  id: number;
  background_job_id: number;
  attempt_number: number;
  status: string;
  worker_name: string | null;
  provider_job_id: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  error_code: string | null;
  error_message: string | null;
  error_details: Record<string, unknown>;
  result: Record<string, unknown> | null;
  metrics: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BackgroundJobDependency {
  id: number;
  background_job_id: number;
  depends_on_job_id: number;
  dependency_type: string;
  created_at: string;
}

export interface BackgroundJobDetailResponse {
  job: BackgroundJob;
  attempts: BackgroundJobAttempt[];
  dependencies: BackgroundJobDependency[];
  dependents: BackgroundJobDependency[];
}

export interface BackgroundJobMetrics {
  total_jobs: number;
  queued_jobs: number;
  running_jobs: number;
  succeeded_jobs: number;
  failed_jobs: number;
  retrying_jobs: number;
  dead_letter_jobs: number;
  canceled_jobs: number;
  expired_leases: number;
  average_duration_seconds: number | null;
  average_attempts: number | null;
  jobs_by_status: Array<{
    status: string;
    total: number;
  }>;
  jobs_by_queue: Array<{
    queue_name: string;
    total: number;
  }>;
  jobs_by_execution_mode: Array<{
    execution_mode: string;
    total: number;
  }>;
  period_start: string;
  period_end: string;
  generated_at: string;
}
export interface BackgroundJobCancelRequest {
  reason?: string | null;
}

export interface BackgroundJobCancelResponse {
  job: BackgroundJob;
  cancellation_requested: boolean;
  canceled_immediately: boolean;
  message: string;
}

export interface BackgroundJobRetryRequest {
  reset_attempt_count: boolean;
  priority?: number | null;
  scheduled_at?: string | null;
  reason?: string | null;
}

export interface BackgroundJobRetryResponse {
  job: BackgroundJob;
  retried: boolean;
  message: string;
}

export interface BackgroundJobMaintenanceRequest {
  recover_expired_leases: boolean;
  signal_ready_queues: boolean;
  max_items: number;
}

export interface BackgroundJobMaintenanceResponse {
  success: boolean;
  expired_leases_inspected: number;
  recovered_jobs: number;
  dead_lettered_jobs: number;
  signaled_queues: string[];
  errors: Array<Record<string, unknown>>;
  started_at: string;
  completed_at: string;
}
