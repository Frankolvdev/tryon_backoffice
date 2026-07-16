export interface AdminNotification {
  id: number;
  recipient_user_id: number | null;
  notification_type: string;
  priority: string;
  source: string;
  event_type: string | null;
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  entity_type: string | null;
  entity_id: string | null;
  correlation_id: string | null;
  metadata: Record<string, unknown>;
  is_global: boolean;
  is_read: boolean;
  is_archived: boolean;
  requires_action: boolean;
  read_at: string | null;
  archived_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminNotificationListResponse {
  items: AdminNotification[];
  total: number;
  unread: number;
  skip: number;
  limit: number;
}

export interface AdminNotificationCountResponse {
  total: number;
  unread: number;
  urgent: number;
  requires_action: number;
}

export interface AdminNotificationCreate {
  recipient_user_id?: number | null;
  notification_type: string;
  priority: string;
  source: string;
  event_type?: string | null;
  title: string;
  message: string;
  action_url?: string | null;
  action_label?: string | null;
  entity_type?: string | null;
  entity_id?: string | number | null;
  correlation_id?: string | null;
  metadata: Record<string, unknown>;
  is_global: boolean;
  requires_action: boolean;
  expires_at?: string | null;
}
