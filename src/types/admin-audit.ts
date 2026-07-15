export interface AuditLogResponse {
  id: number;
  actor_user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
