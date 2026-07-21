export type AiExecutionMode =
  | "simulated"
  | "comfyui_local"
  | "runpod_serverless"
  | "auto";

export interface SimulatedEngineSettingsResponse {
  enabled: boolean;
  execution_mode: AiExecutionMode;
  delay_seconds: number;
  failure_rate_percent: number;
  copy_person_image_as_result: boolean;
}

export interface SimulatedEngineSettingsUpdate extends SimulatedEngineSettingsResponse {}

export interface SimulatedEngineTestResponse {
  available: boolean;
  provider: string;
  status: string;
  delay_seconds: number;
  failure_rate_percent: number;
}

export interface CommercialRepriceResponse {
  plans_updated: number;
  packages_updated: number;
  currency: string;
  token_value_usd: number;
  message: string;
}
