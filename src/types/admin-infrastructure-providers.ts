export interface ModalProviderConfig {
  enabled:boolean; token_id:string; token_secret:string; token_secret_configured:boolean;
  environment:string; app_name:string; runtime_url:string; volume_name:string; gpu:string; timeout_seconds:number;
}

export interface RunPodProviderConfig {
  enabled:boolean; api_key:string; api_key_configured:boolean;
  endpoint_id:string; endpoint_name:string; template_id:string; template_name:string; registry_auth_id:string;
  network_volume_id:string; network_volume_name:string; network_volume_size_gb:number; data_center_id:string;
  gpu_type_ids:string[]; allowed_cuda_versions:string[]; workers_min:number; workers_max:number;
  idle_timeout_seconds:number; execution_timeout_seconds:number; scaler_type:"QUEUE_DELAY"|"REQUEST_COUNT";
  scaler_value:number; flashboot:boolean; container_disk_gb:number; timeout_seconds:number;
}

export interface BeamProviderConfig {
  enabled:boolean; api_key:string; api_key_configured:boolean; workspace:string; endpoint:string; deployment_name:string;
  volume_name:string; volume_mount_path:string; gpu:string; cpu:number; memory_mb:number; workers:number;
  min_containers:number; max_containers:number; tasks_per_container:number; keep_warm_seconds:number;
  max_pending_tasks:number; retries:number; checkpoint_enabled:boolean; timeout_seconds:number;
}

export interface ProviderActionResponse { success:boolean; message:string; details:Record<string,unknown>; }
