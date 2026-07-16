export interface AdminNotificationDelivery {
  id: number;
  notification_id: number;
  channel_id: number | null;
  recipient_user_id: number | null;
  channel_type: string;
  destination: string | null;
  status: string;
  attempt_count: number;
  max_attempts: number;
  provider_message_id: string | null;
  provider_status_code: number | null;
  error_type: string | null;
  error_message: string | null;
  provider_response: Record<string, unknown>;
  scheduled_at: string | null;
  processing_started_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  next_retry_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminNotificationDeliveryListResponse {
  items: AdminNotificationDelivery[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminNotificationRetryResponse {
  success: boolean;
  delivery_id: number;
  status: string;
  attempt_count: number;
  message: string;
}
