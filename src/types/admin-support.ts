export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | string;

export type SupportTicketPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent"
  | string;

export interface SupportTicket {
  id: number;
  user_id: number | null;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  admin_notes: string | null;
  assigned_admin_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketUpdate {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  admin_notes?: string | null;
  assigned_admin_user_id?: number | null;
}
