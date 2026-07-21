export type TokenPurchaseStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "canceled"
  | "refunded"
  | string;

export interface TokenPackageResponse {
  id: number;
  name: string;
  description: string | null;
  tokens_amount: number;
  price_cents: number;
  calculated_price_cents: number;
  commercial_token_value: number;
  price_is_automatic: boolean;
  currency: string;
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenPackageCreate {
  name: string;
  description?: string | null;
  tokens_amount: number;
  price_cents?: number | null;
  currency?: string | null;
  stripe_price_id?: string | null;
  is_active: boolean;
}

export interface TokenPackageUpdate {
  name?: string | null;
  description?: string | null;
  tokens_amount?: number | null;
  price_cents?: number | null;
  currency?: string | null;
  stripe_price_id?: string | null;
  is_active?: boolean | null;
}

export interface TokenPurchaseResponse {
  id: number;
  user_id: number;
  token_package_id: number;
  billing_payment_id: number | null;
  status: TokenPurchaseStatus;
  tokens_amount: number;
  bonus_tokens: number;
  total_tokens: number;
  currency: string;
  amount: string;
  provider_checkout_session_id: string | null;
  provider_payment_intent_id: string | null;
  token_transaction_id: number | null;
  metadata: Record<string, unknown>;
  paid_at: string | null;
  credited_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingPaymentResponse {
  id: number;
  user_id: number;
  billing_customer_id: number | null;
  user_subscription_id: number | null;
  provider: string;
  payment_type: string;
  status: string;
  currency: string;
  amount: string;
  refunded_amount: string;
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

export interface TokenPurchaseListResponse {
  items: TokenPurchaseResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface TokenPurchaseDetailResponse {
  purchase: TokenPurchaseResponse;
  payment: BillingPaymentResponse | null;
}

export interface TokenPurchaseReconcileResponse {
  purchase: TokenPurchaseResponse;
  payment: BillingPaymentResponse | null;
  reconciled: boolean;
  message: string;
}

export interface TokenPurchaseRefundRequest {
  amount?: number | null;
  reason:
    | "duplicate"
    | "fraudulent"
    | "requested_by_customer";
  remove_tokens: boolean;
}

export interface TokenPurchaseRefundResponse {
  purchase: TokenPurchaseResponse;
  payment: BillingPaymentResponse;
  stripe_refund_id: string;
  refunded_amount: string;
  removed_tokens: number;
  message: string;
}
