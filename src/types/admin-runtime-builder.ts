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

export type RuntimeBuildStatus =
  | "pending"
  | "building"
  | "validating"
  | "succeeded"
  | "failed"
  | "publishing"
  | "published"
  | "active"
  | "cancelled";

export interface RuntimeBuild {
  id: number;
  runtime_config_id: number;
  version: string;
  image_tag: string;
  status: RuntimeBuildStatus;
  phase: string;
  progress: number;
  logs: string;
  error_message: string | null;
  image_id: string | null;
  image_size_bytes: number | null;
  manifest: Record<string, unknown>;
  validation_result: Record<string, unknown>;
  published: boolean;
  active: boolean;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RuntimeBuildList {
  items: RuntimeBuild[];
  total: number;
}

export interface RuntimeDockerDiagnostic {
  docker_available: boolean;
  docker_version: string | null;
  buildx_available: boolean;
  registry_image: string;
  active_image: string | null;
  message: string;
}

export interface RuntimeImportReport {
  source_type: string; selected_path: string | null; comfyui_path: string | null;
  comfyui_repository: string; comfyui_commit: string | null; python_executable: string | null;
  python_version: string | null; torch_version: string | null; torch_cuda_version: string | null; gpu_name: string | null;
  custom_nodes: Array<RuntimeCustomNode & {source_path?: string}>;
  models: Array<RuntimeModelAsset & {size_bytes: number}>;
  python_dependencies: RuntimePythonDependency[]; environment_variables: RuntimeEnvironmentVariable[]; volumes: RuntimeVolume[];
  warnings: string[]; summary: {custom_nodes:number;models:number;model_size_bytes:number;python_dependencies:number;git_nodes:number};
}
export interface RuntimeWorkflowAnalysis {
  node_count:number; class_types:string[]; custom_node_classes:string[]; referenced_models:string[]; potentially_missing_nodes:string[];
  summary:{nodes:number;unique_classes:number;referenced_models:number};
}
