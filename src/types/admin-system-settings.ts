export type SystemSettingCategory =
  | "system"
  | "general"
  | "authentication"
  | "billing"
  | "tryon"
  | "storage"
  | "notifications"
  | "security"
  | "frontend"
  | string;

export type SystemSettingValueType =
  | "string"
  | "integer"
  | "float"
  | "boolean"
  | "json"
  | string;

export interface SystemSettingCreate {
  category: SystemSettingCategory;
  key: string;
  label: string;
  description?: string | null;
  value_type: SystemSettingValueType;
  value?: unknown;
  default_value?: unknown;
  is_public?: boolean;
  is_editable?: boolean;
  is_sensitive?: boolean;
  requires_restart?: boolean;
  sort_order?: number;
}

export interface SystemSettingResponse {
  id: number;
  category: SystemSettingCategory;
  key: string;
  label: string;
  description: string | null;
  value_type: SystemSettingValueType;
  value: unknown;
  default_value: unknown;
  is_public: boolean;
  is_editable: boolean;
  is_sensitive: boolean;
  requires_restart: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SystemSettingsGroupedResponse {
  categories: Record<string, SystemSettingResponse[]>;
}

export interface SystemSettingUpdate {
  label?: string | null;
  description?: string | null;
  value?: unknown;
  default_value?: unknown;
  is_public?: boolean | null;
  is_editable?: boolean | null;
  is_sensitive?: boolean | null;
  requires_restart?: boolean | null;
  sort_order?: number | null;
}

export interface SystemStatusResponse {
  id: number;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  tryon_enabled: boolean;
  public_message: string | null;
  internal_message: string | null;
  updated_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface SystemStatusUpdate {
  maintenance_mode?: boolean | null;
  registration_enabled?: boolean | null;
  tryon_enabled?: boolean | null;
  public_message?: string | null;
  internal_message?: string | null;
}

export interface SeedDefaultSettingsResponse {
  message: string;
  created?: number;
  skipped?: number;
  updated?: number;
  total?: number;
  [key: string]: unknown;
}

export type ConfigurationValidationResponse =
  Record<string, unknown>;
