export type BillingPaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled"
  | "refunded"
  | "partially_refunded"
  | string;

export interface BillingPaymentHistoryResponse {
  id: number;
  user_id: number;
  billing_customer_id: number | null;
  user_subscription_id: number | null;
  provider: string;
  payment_type: string;
  status: BillingPaymentStatus;
  currency: string;
  amount: string;
  refunded_amount: string;
  refundable_amount: string;
  provider_payment_intent_id: string | null;
  provider_charge_id: string | null;
  provider_checkout_session_id: string | null;
  failure_code: string | null;
  failure_message: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingPaymentHistoryListResponse {
  items: BillingPaymentHistoryResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface BillingPaymentReconcileResponse {
  payment: BillingPaymentHistoryResponse;
  reconciled: boolean;
  message: string;
}

export interface BillingPaymentRefundRequest {
  amount?: number | null;
  reason:
    | "duplicate"
    | "fraudulent"
    | "requested_by_customer";
}

export interface BillingPaymentRefundResponse {
  payment: BillingPaymentHistoryResponse;
  stripe_refund_id: string;
  refunded_amount: string;
  fully_refunded: boolean;
  message: string;
}
