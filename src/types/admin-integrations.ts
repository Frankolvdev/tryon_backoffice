export type IntegrationProvider =
  | "stripe"
  | "runpod"
  | "comfyui"
  | "s3"
  | "smtp"
  | "google_oauth"
  | "github_oauth"
  | "apple_oauth"
  | "facebook_oauth";

export type IntegrationStatus =
  | "enabled"
  | "disabled"
  | "error";

export type IntegrationHealthStatus =
  | "unknown"
  | "healthy"
  | "degraded"
  | "down";

export interface IntegrationConfigResponse {
  id: number;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  is_enabled: boolean;
  base_url: string | null;
  api_key_configured: boolean;
  api_secret_configured: boolean;
  webhook_secret_configured: boolean;
  config: Record<string, unknown>;
  last_health_status: IntegrationHealthStatus | null;
  last_health_message: string | null;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConfigUpdate {
  name?: string | null;
  status?: IntegrationStatus | null;
  is_enabled?: boolean | null;
  base_url?: string | null;
  api_key?: string | null;
  api_secret?: string | null;
  webhook_secret?: string | null;
  config?: Record<string, unknown> | null;
}

export interface IntegrationHealthResponse {
  provider: IntegrationProvider;
  status: IntegrationHealthStatus;
  message: string;
  metadata: Record<string, unknown>;
}

export interface IntegrationEventResponse {
  id: number;
  provider: IntegrationProvider;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  payload: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

export interface IntegrationSeedResponse {
  created: number;
  skipped: number;
  total: number;
}
