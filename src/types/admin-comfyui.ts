export interface ComfyUIWorkflowPatch {
  node_id: string;
  path: Array<string | number>;
  value: unknown;
}

export interface ComfyUIWorkflowListResponse {
  workflows: string[];
}

export interface ComfyUIWorkflowValidateRequest {
  workflow_name: string;
  required_nodes: string[];
}

export interface ComfyUIWorkflowValidateResponse {
  workflow_name: string;
  exists: boolean;
  valid: boolean;
  missing_nodes: string[];
  available_nodes_count: number;
}

export interface ComfyUIRunWorkflowRequest {
  workflow_name: string;
  patches: ComfyUIWorkflowPatch[];
  client_id: string | null;
  wait_for_result: boolean;
}

export interface ComfyUIRunWorkflowResponse {
  prompt_id: string | null;
  status: string;
  images: Array<Record<string, unknown>>;
  raw_queue_response: Record<string, unknown>;
  raw_history: Record<string, unknown> | null;
}

export interface ComfyUITryOnTestRequest {
  tryon_job_id: number;
}

export interface ComfyUITryOnTestResponse {
  tryon_job_id: number;
  status: string;
  result_file_id: number | null;
  error_message: string | null;
}
