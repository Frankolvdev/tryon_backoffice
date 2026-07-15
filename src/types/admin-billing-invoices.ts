export type BillingInvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible"
  | string;

export interface BillingInvoiceHistoryResponse {
  id: number;
  user_id: number;
  billing_customer_id: number | null;
  user_subscription_id: number | null;
  billing_payment_id: number | null;
  provider: string;
  provider_invoice_id: string;
  invoice_number: string | null;
  status: BillingInvoiceStatus;
  currency: string;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  total: string;
  amount_paid: string;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  period_start: string | null;
  period_end: string | null;
  due_at: string | null;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BillingInvoiceHistoryListResponse {
  items: BillingInvoiceHistoryResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface BillingInvoiceDocumentResponse {
  invoice_id: number;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  available: boolean;
  message: string;
}
