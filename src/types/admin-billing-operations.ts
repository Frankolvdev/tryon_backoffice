export type BillingEventStatus =
  | "received"
  | "processing"
  | "processed"
  | "failed"
  | string;

export interface BillingEventResponse {
  id: number;
  provider: string;
  provider_event_id: string;
  event_type: string;
  status: BillingEventStatus;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  error_message: string | null;
  processing_attempts: number;
  received_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingEventListResponse {
  items: BillingEventResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface BillingEventRetryResponse {
  event: BillingEventResponse;
  retried: boolean;
  message: string;
}

export interface BillingValidationItem {
  key: string;
  valid: boolean;
  required: boolean;
  message: string;
  metadata: Record<string, unknown>;
}

export interface BillingValidationResponse {
  ready: boolean;
  stripe_enabled: boolean;
  checks: BillingValidationItem[];
  checked_at: string;
}

export interface BillingJobCatalogItem {
  name: string;
  description: string;
  recommended_schedule: string;
  enabled: boolean;
}

export interface BillingJobsCatalogResponse {
  jobs: BillingJobCatalogItem[];
}

export interface BillingJobRunRequest {
  max_items: number;
}

export interface BillingJobResult {
  job_name: string;
  started_at: string;
  completed_at: string;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  success: boolean;
  errors: Array<Record<string, unknown>>;
}
