export interface ModalProviderConfig {
  enabled: boolean;
  token_id: string;
  token_secret: string;
  token_secret_configured: boolean;
  environment: string;
  app_name: string;
  runtime_url: string;
  volume_name: string;
  gpu: string;
  timeout_seconds: number;
}

export interface ProviderActionResponse {
  success: boolean;
  message: string;
  details: Record<string, unknown>;
}
