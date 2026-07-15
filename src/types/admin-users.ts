import type {
  User,
  UserRole,
  UserStatus,
} from "@/types/auth";

export type TokenTransactionType =
  | "credit"
  | "debit"
  | "refund"
  | "adjustment";

export type ApiKeyType =
  | "internal"
  | "user"
  | "admin"
  | "integration"
  | "webhook";

export type ApiKeyStatus =
  | "active"
  | "revoked"
  | "expired";

export type BillingInterval =
  | "day"
  | "week"
  | "month"
  | "year";

export type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "unpaid"
  | "paused"
  | "canceled";

export type TokenPurchaseStatus =
  | "pending"
  | "paid"
  | "credited"
  | "failed"
  | "canceled"
  | "refunded";

export interface AdminUserCreateRequest {
  email: string;
  password: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
  is_verified: boolean;
  token_balance: number;
}

export interface AdminUserUpdateRequest {
  email?: string | null;
  full_name?: string | null;
  role?: UserRole | null;
  status?: UserStatus | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
  token_balance?: number | null;
}

export interface AdminUserPasswordResetRequest {
  new_password: string;
}

export interface AdminUserTokenAdjustmentRequest {
  amount: number;
  reason: string | null;
}

export interface AdminUserSession {
  id: number;
  user_agent: string | null;
  ip_address: string | null;
  is_revoked: boolean;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
  is_expired: boolean;
  is_current: boolean;
  device_name: string | null;
  browser_name: string | null;
  operating_system: string | null;
}

export interface AdminUserTokenTransaction {
  id: number;
  user_id: number;
  transaction_type: TokenTransactionType;
  amount: number;
  balance_after: number;
  source: string | null;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface AdminUserApiKey {
  id: number;
  name: string;
  key_prefix: string;
  api_key_type: ApiKeyType;
  status: ApiKeyStatus;
  user_id: number | null;
  created_by_user_id: number | null;
  scopes: string[];
  allowed_ips: string[];
  description: string | null;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface UserRbacResponse {
  user_id: number;
  role_keys: string[];
  permission_keys: string[];
}

export interface RbacRole {
  id: number;
  key: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AssignRoleToUserRequest {
  role_id: number;
}

export interface SubscriptionPlanResponse {
  id: number;
  key: string;
  name: string;
  description: string | null;
  billing_interval: BillingInterval;
  currency: string;
  price_amount: string;
  tokens_per_period: number;
  max_generations_per_period: number | null;
  priority: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  stripe_configured: boolean;
  features: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface SubscriptionPlanListResponse {
  items: SubscriptionPlanResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserSubscriptionResponse {
  id: number;
  user_id: number;
  subscription_plan_id: number;
  billing_customer_id: number | null;
  provider: string;
  provider_subscription_id: string | null;
  status: SubscriptionStatus;
  plan_key: string;
  plan_name: string;
  billing_interval: BillingInterval;
  currency: string;
  price_amount: string;
  tokens_per_period: number;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  ended_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdminSubscriptionListResponse {
  items: UserSubscriptionResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface SubscriptionChangePlanRequest {
  new_plan_key: string;
  proration_behavior:
    | "always_invoice"
    | "create_prorations"
    | "none";
}

export interface SubscriptionActionResponse {
  subscription: UserSubscriptionResponse;
  message: string;
}

export interface SubscriptionSyncResponse {
  subscription: UserSubscriptionResponse;
  synchronized: boolean;
  message: string;
}

export interface BillingPaymentResponse {
  id: number;
  user_id: number | null;
  provider: string;
  provider_payment_id: string | null;
  status: string;
  currency: string;
  amount: string;
  refunded_amount?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
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

export interface TokenPurchaseReconcileRequest {
  force: boolean;
}

export interface TokenPurchaseReconcileResponse {
  purchase: TokenPurchaseResponse;
  payment: BillingPaymentResponse | null;
  reconciled: boolean;
  message: string;
}

export interface TokenPurchaseRefundRequest {
  amount: number | string | null;
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

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export type AdminUser = User;