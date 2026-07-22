export interface RuntimeCustomNode { name: string; repository: string; commit: string | null; enabled: boolean; install_requirements: boolean; }
export interface RuntimePythonDependency { package: string; version: string | null; enabled: boolean; }
export interface RuntimeModelAsset { name: string; model_type: "checkpoint"|"vae"|"lora"|"controlnet"|"clip"|"upscaler"|"other"; source_url: string | null; target_path: string; sha256: string | null; strategy: "image"|"volume"|"startup-download"; enabled: boolean; }
export interface RuntimeEnvironmentVariable { key: string; value: string | null; secret: boolean; required: boolean; }
export interface RuntimeVolume { name: string; mount_path: string; read_only: boolean; }
export interface RuntimeBuilderConfig {
  id: number; name: string; runtime_version: string; python_version: string; cuda_version: string;
  pytorch_index_url: string; comfyui_repository: string; comfyui_commit: string | null;
  target_platform: string; registry_image: string; include_comfyui_manager: boolean;
  custom_nodes: RuntimeCustomNode[]; python_dependencies: RuntimePythonDependency[];
  models: RuntimeModelAsset[]; environment_variables: RuntimeEnvironmentVariable[];
  volumes: RuntimeVolume[]; notes: string | null; is_active: boolean; created_at: string; updated_at: string;
}
export interface RuntimeValidationIssue { level: "error"|"warning"|"info"; field: string; message: string; }
export interface RuntimeValidationResponse { valid: boolean; issues: RuntimeValidationIssue[]; summary: Record<string, string|number|boolean>; }
export interface RuntimeGeneratedFiles { dockerfile: string; entrypoint: string; runtime_manifest: Record<string, unknown>; custom_nodes_lock: Record<string, unknown>; models_manifest: Record<string, unknown>; env_example: string; }
