export type SubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused"
  | string;

export type BillingProvider =
  | "stripe"
  | string;

export type BillingInterval =
  | "month"
  | "year"
  | string;

export type ProrationBehavior =
  | "always_invoice"
  | "create_prorations"
  | "none";

export interface UserSubscriptionResponse {
  id: number;
  user_id: number;
  subscription_plan_id: number;
  billing_customer_id: number | null;
  provider: BillingProvider;
  provider_subscription_id: string | null;
  status: SubscriptionStatus;
  plan_key: string;
  plan_name: string;
  billing_interval: BillingInterval;
  currency: string;
  price_amount: string;
  tokens_per_period: number;
  priority: number;
  features: string[];
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  ended_at: string | null;
  cancel_at_period_end: boolean;
  last_tokens_granted_at: string | null;
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

export interface SubscriptionActionResponse {
  subscription: UserSubscriptionResponse;
  message: string;
}

export interface SubscriptionSyncResponse {
  subscription: UserSubscriptionResponse;
  synchronized: boolean;
  message: string;
}

export interface SubscriptionChangePlanRequest {
  new_plan_key: string;
  proration_behavior: ProrationBehavior;
}
