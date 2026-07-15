export interface AuditExportRequest {
  actor_user_id?: number | null;
  actor_email?: string | null;
  actor_type?: string | null;
  action?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  success?: boolean | null;
  correlation_id?: string | null;
  request_id?: string | null;
  is_restorable?: boolean | null;
  search?: string | null;
  created_from?: string | null;
  created_to?: string | null;
  max_records: number;
}

export interface AuditRestorePreviewResponse {
  audit_entry_id: number;
  entity_type: string;
  entity_id: string;
  can_restore: boolean;
  reason: string | null;
  current_data: Record<string, unknown> | null;
  restore_data: Record<string, unknown> | null;
  changed_fields: string[];
  ignored_fields: string[];
  missing_fields: string[];
}

export interface AuditRestoreRequest {
  reason: string;
  expected_updated_at?: string | null;
  restore_null_values: boolean;
}

export interface AuditRestoreResponse {
  success: boolean;
  restored_entity_type: string;
  restored_entity_id: string;
  source_audit_entry_id: number;
  restoration_audit_entry_id: number | null;
  changed_fields: string[];
  ignored_fields: string[];
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  message: string;
}
