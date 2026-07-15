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

export interface WorkflowDefinitionCreate {
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
}

export interface WorkflowDefinitionUpdate {
  name?: string | null;
  description?: string | null;
  category?: string | null;
  workflow?: Record<string, unknown> | null;
  parameter_schema?: Record<string, unknown> | null;
  execution_modes?: WorkflowExecutionMode[] | null;
  metadata?: Record<string, unknown> | null;
  is_active?: boolean | null;
  is_default?: boolean | null;
}

export interface WorkflowVersionCreate {
  name: string | null;
  description: string | null;
  workflow: Record<string, unknown>;
  parameter_schema: Record<string, unknown>;
  execution_modes: WorkflowExecutionMode[];
  metadata: Record<string, unknown>;
  activate_new_version: boolean;
  make_default: boolean;
}
