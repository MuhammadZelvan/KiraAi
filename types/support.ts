// types/support.ts — shared types untuk support ticket system (frontend)
// Field names pakai snake_case sesuai response dari Drizzle/Postgres

export type TicketStatus   = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface SupportTicket {
  id:           string;
  user_id:      string;
  user_email:   string;
  user_name:    string | null;
  subject:      string;
  message:      string;
  priority:     TicketPriority;
  status:       TicketStatus;
  assigned_to:  string | null;
  admin_notes:  string | null;
  created_at:   string;
  updated_at:   string;
  resolved_at:  string | null;
}

export interface TicketAttachment {
  id:           string;
  ticket_id:    string;
  file_name:    string;
  file_size:    number;
  file_type:    string;
  storage_path: string;
  signedUrl:    string | null;  // ditambah backend, valid 1hr
  uploaded_at:  string;
}

export interface TicketReply {
  id:          string;
  ticket_id:   string;
  sender_id:   string;
  sender_role: "user" | "admin";
  message:     string;
  created_at:  string;
}

export interface TicketDetail extends SupportTicket {
  attachments: TicketAttachment[];
  replies:     TicketReply[];
}