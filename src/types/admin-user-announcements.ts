export interface UserAnnouncementCreate {
  notification_type: string;
  priority: string;
  title: string;
  message: string;
  action_url?: string | null;
  action_label?: string | null;
  image_url?: string | null;
  requires_action: boolean;
  published_at?: string | null;
  expires_at?: string | null;
  metadata: Record<string, unknown>;
}

export interface UserAnnouncementResponse {
  id: number;
  notification_type: string;
  priority: string;
  source: string;
  event_type: string | null;
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  image_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  is_global: boolean;
  requires_action: boolean;
  is_read: boolean;
  is_archived: boolean;
  read_at: string | null;
  archived_at: string | null;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
}
