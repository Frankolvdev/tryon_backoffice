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


export interface RunPodProviderConfig { enabled:boolean; api_key:string; api_key_configured:boolean; endpoint_id:string; network_volume_id:string; network_volume_name:string; data_center_id:string; timeout_seconds:number; }
export interface BeamProviderConfig { enabled:boolean; api_key:string; api_key_configured:boolean; workspace:string; endpoint:string; volume_name:string; timeout_seconds:number; }
