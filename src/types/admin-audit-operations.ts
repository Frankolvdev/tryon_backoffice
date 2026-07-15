export interface AuditDailyMetric {
  day: string;
  total: number;
  successful: number;
  failed: number;
  restorable: number;
}

export interface AuditGroupMetric {
  key: string;
  total: number;
}

export interface AuditActorMetric {
  actor_user_id: number | null;
  actor_email: string | null;
  actor_type: string;
  total: number;
  successful: number;
  failed: number;
}

export interface AuditAdvancedStatisticsResponse {
  period_days: number;
  total_entries: number;
  successful_entries: number;
  failed_entries: number;
  restorable_entries: number;
  restoration_entries: number;
  success_rate: number;
  daily: AuditDailyMetric[];
  top_actions: AuditGroupMetric[];
  top_entity_types: AuditGroupMetric[];
  top_actor_types: AuditGroupMetric[];
  top_actors: AuditActorMetric[];
  generated_at: string;
}

export interface AuditRetentionRequest {
  delete_successful_older_than_days: number;
  delete_failed_older_than_days: number;
  delete_read_events_older_than_days: number;
  preserve_restorable_entries: boolean;
  preserve_restore_actions: boolean;
  preserve_failed_entries: boolean;
  batch_size: number;
}

export interface AuditRetentionResponse {
  success: boolean;
  successful_deleted: number;
  failed_deleted: number;
  read_events_deleted: number;
  total_deleted: number;
  started_at: string;
  completed_at: string;
  errors: string[];
}

export interface AuditSelfTestResponse {
  success: boolean;
  snapshot_test: boolean;
  redaction_test: boolean;
  diff_test: boolean;
  database_create_test: boolean;
  database_read_test: boolean;
  database_delete_test: boolean;
  temporary_audit_entry_id: number | null;
  details: Record<string, unknown>;
  checked_at: string;
}
