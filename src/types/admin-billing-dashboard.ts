export interface BillingRevenueMetrics {
  currency: string;
  gross_revenue: string;
  refunded_revenue: string;
  net_revenue: string;
  subscription_revenue: string;
  token_purchase_revenue: string;
  other_revenue: string;
  successful_payments: number;
  failed_payments: number;
  refunded_payments: number;
  partially_refunded_payments: number;
  period_start: string;
  period_end: string;
}

export interface BillingSubscriptionMetrics {
  currency: string;
  monthly_recurring_revenue: string;
  annual_recurring_revenue: string;
  active_subscriptions: number;
  trialing_subscriptions: number;
  past_due_subscriptions: number;
  canceled_subscriptions: number;
  unpaid_subscriptions: number;
  new_subscriptions: number;
  canceled_during_period: number;
  subscriber_churn_rate: string;
  period_start: string;
  period_end: string;
}

export interface BillingTokenMetrics {
  completed_purchases: number;
  pending_purchases: number;
  failed_purchases: number;
  refunded_purchases: number;
  tokens_sold: number;
  bonus_tokens_granted: number;
  total_tokens_granted: number;
  period_start: string;
  period_end: string;
}

export interface BillingDashboardResponse {
  revenue: BillingRevenueMetrics;
  subscriptions: BillingSubscriptionMetrics;
  tokens: BillingTokenMetrics;
  generated_at: string;
}
