export type PricingOperationType =
  | "tryon"
  | string;

export type TryOnItemType =
  | "clothing"
  | "footwear";

export type QualityMode =
  | "standard"
  | "high"
  | string;

export interface CommercialSettingsResponse {
  token_value_usd: number;
  currency: string;
}

export interface CommercialPricePreviewResponse {
  average_execution_cost_usd: number;
  desired_profit_percent: number;
  desired_profit_usd: number;
  token_value_usd: number;
  currency: string;
  final_price_usd: number;
  required_tokens: number;
  effective_margin_percent: number;
}

export interface PricingRuleResponse {
  id: number;
  title: string;
  operation_type: PricingOperationType;
  item_type: TryOnItemType;
  quality_mode: QualityMode;
  generation_module_id?: number | null;
  desired_profit_usd: number;
  initial_estimated_duration_seconds: number;
  technical_margin_seconds: number;
  average_execution_cost_usd: number;
  desired_profit_percent: number;
  desired_profit_usd: number;
  final_price_usd: number;
  required_tokens: number;
  effective_margin_percent: number;
  token_value_usd: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingRuleCreate {
  title: string;
  average_execution_cost_usd: number;
  desired_profit_percent: number;
  desired_profit_usd: number;
  is_active: boolean;
}

export interface PricingRuleUpdate {
  title?: string | null;
  desired_profit_usd?: number | null;
  initial_estimated_duration_seconds?: number | null;
  technical_margin_seconds?: number | null;
  is_active?: boolean | null;
}


export interface ProviderGpuPriceResponse {
  id: number;
  provider: string;
  gpu_key: string;
  cost_usd_per_second: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppliedPricingRuleResponse {
  rule_id: number;
  rule_title: string;
  generation_module_id: number;
  module_key: string;
  module_name: string;
  provider: string;
  gpu_key: string | null;
  gpu_cost_usd_per_second: number | null;
  estimated_duration_seconds: number;
  estimate_source: string;
  scaledown_seconds: number;
  technical_margin_seconds: number;
  estimated_billable_seconds: number;
  estimated_infrastructure_cost_usd: number | null;
  desired_profit_usd: number;
  estimated_final_price_usd: number | null;
  token_value_usd: number;
  estimated_tokens: number | null;
  configured: boolean;
  warnings: string[];
}

export type CouponDiscountType =
  | "percentage"
  | "fixed_amount";

export type CouponDuration =
  | "once"
  | "forever"
  | "repeating";

export interface BillingCouponResponse {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discount_type: CouponDiscountType;
  duration: CouponDuration;
  duration_in_months: number | null;
  percentage_off: string | null;
  amount_off: string | null;
  currency: string | null;
  stripe_coupon_id: string | null;
  stripe_promotion_code_id: string | null;
  stripe_configured: boolean;
  max_redemptions: number | null;
  redemption_count: number;
  first_time_transaction_only: boolean;
  minimum_amount: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  applies_to: "all" | "plans" | "token_packages";
  eligible_item_ids: number[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BillingCouponListResponse {
  items: BillingCouponResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface BillingCouponCreate {
  code: string;
  name: string;
  description?: string | null;
  discount_type: CouponDiscountType;
  duration: CouponDuration;
  duration_in_months?: number | null;
  percentage_off?: number | null;
  amount_off?: number | null;
  currency?: string | null;
  max_redemptions?: number | null;
  first_time_transaction_only: boolean;
  minimum_amount?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
  applies_to: "all" | "plans" | "token_packages";
  eligible_item_ids: number[];
  metadata: Record<string, unknown>;
}

export interface BillingCouponUpdate {
  name?: string | null;
  description?: string | null;
  max_redemptions?: number | null;
  first_time_transaction_only?: boolean | null;
  minimum_amount?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean | null;
  applies_to?: "all" | "plans" | "token_packages" | null;
  eligible_item_ids?: number[] | null;
  metadata?: Record<string, unknown> | null;
}

export interface BillingCouponSyncResponse {
  coupon: BillingCouponResponse;
  stripe_coupon_id: string;
  stripe_promotion_code_id: string;
  message: string;
}
