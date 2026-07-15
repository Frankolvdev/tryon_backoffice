export type WorkflowExecutionMode =
  | "comfyui_local"
  | "runpod_serverless";

export interface WorkflowDefinitionResponse {
  id: number;
  key: string;
  name: string;
  description: string | null;
  version: number;
  category: string;
  workflow: Record<string, unknown>;
  parameter_schema: Record<string, unknown>;
  execution_modes: WorkflowExecutionMode[];
  metadata: Record<string, unknown>;
  is_active: boolean;
  is_default: boolean;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowDefinitionListResponse {
  items: WorkflowDefinitionResponse[];
  total: number;
  skip: number;
  limit: number;
}
