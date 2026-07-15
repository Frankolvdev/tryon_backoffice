export interface AuditFieldChange {
  field: string;
  change_type: string;
  before: unknown;
  after: unknown;
}

export interface AuditEntryResponse {
  id: number;
  actor_user_id: number | null;
  actor_email: string | null;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  success: boolean;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  diff_data: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  correlation_id: string | null;
  request_id: string | null;
  error_type: string | null;
  error_message: string | null;
  is_restorable: boolean;
  restored_from_entry_id: number | null;
  created_at: string;
}

export interface AuditEntryListResponse {
  items: AuditEntryResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuditDiffResponse {
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  changes: AuditFieldChange[];
  added_fields: string[];
  removed_fields: string[];
  changed_fields: string[];
  total_changes: number;
}

export interface AuditEntityHistoryResponse {
  entity_type: string;
  entity_id: string;
  items: AuditEntryResponse[];
  total: number;
}

export interface AuditSummaryResponse {
  total_entries: number;
  successful_entries: number;
  failed_entries: number;
  restorable_entries: number;
  by_actor_type: Record<string, number>;
  by_action: Record<string, number>;
  by_entity_type: Record<string, number>;
  generated_at: string;
}
