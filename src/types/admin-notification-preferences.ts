export interface AdminNotificationPreference {
  id: number;
  user_id: number;
  is_enabled: boolean;
  minimum_priority: string;
  digest_mode: string;
  enabled_sources: string[];
  enabled_types: string[];
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
  allow_urgent_during_quiet_hours: boolean;
  allow_critical_during_quiet_hours: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminNotificationChannel {
  id: number;
  user_id: number;
  channel_type: string;
  is_enabled: boolean;
  status: string;
  destination: string | null;
  display_name: string | null;
  integration_provider: string | null;
  configuration: Record<string, unknown>;
  minimum_priority: string;
  send_success_notifications: boolean;
  send_info_notifications: boolean;
  send_warning_notifications: boolean;
  send_error_notifications: boolean;
  send_critical_notifications: boolean;
  last_tested_at: string | null;
  last_test_success: boolean | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminNotificationSettings {
  preference: AdminNotificationPreference;
  channels: AdminNotificationChannel[];
}

export interface AdminNotificationChannelTestResponse {
  success: boolean;
  channel_id: number;
  channel_type: string;
  delivery: Record<string, unknown> | null;
  message: string;
}
