export type AiExecutionMode =
  | "simulated"
  | "comfyui_local"
  | "runpod_serverless"
  | "auto";

export interface AiProviderHealth {
  provider: string;
  enabled: boolean;
  available: boolean;
  configured: boolean;
  message: string | null;
  details: Record<string, unknown>;
}

export interface AiProvidersOverview {
  execution_mode: AiExecutionMode;
  selected_provider: string;
  fallback_order: string[];
  providers: AiProviderHealth[];
}
