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


export interface BillingPolicyEntry {
  charge_infrastructure: boolean;
  apply_profit: boolean;
}

export interface ExecutionBillingPolicy {
  completed: BillingPolicyEntry;
  cancelled: BillingPolicyEntry;
  failed_workflow_or_user: BillingPolicyEntry;
  failed_platform_or_provider: BillingPolicyEntry;
}


export interface FinancialProtectionRuleDiagnostic {
  pricing_rule_id: number;
  generation_module_id: number;
  module_key: string;
  module_name: string;
  desired_profit_usd: number;
  desired_profit_per_token_usd: number;
  is_limiting: boolean;
}

export interface FinancialProtectionReport {
  safe_profit_usd: number | null;
  safe_profit_per_token_usd: number | null;
  maximum_allowed_discount_percent: number;
  highest_active_discount_percent: number;
  available_discount_percentage_points: number;
  status: string;
  limiting_pricing_rule_id: number | null;
  limiting_generation_module_id: number | null;
  limiting_module_key: string | null;
  limiting_module_name: string | null;
  diagnostics: FinancialProtectionRuleDiagnostic[];
  warnings: string[];
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
  desired_profit_per_token_usd: number;
  initial_estimated_duration_seconds: number;
  technical_margin_seconds: number;
  // Campos calculados legacy que el backend aún devuelve para compatibilidad.
  average_execution_cost_usd: number;
  desired_profit_percent: number;
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
  operation_type?: PricingOperationType;
  item_type?: TryOnItemType;
  quality_mode?: QualityMode;
  generation_module_id?: number | null;
  desired_profit_usd: number;
  desired_profit_per_token_usd: number;
  initial_estimated_duration_seconds: number;
  technical_margin_seconds: number;
  is_active: boolean;
}

export interface PricingRuleUpdate {
  title?: string | null;
  desired_profit_usd?: number | null;
  desired_profit_per_token_usd?: number | null;
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
  desired_profit_per_token_usd: number;
  estimated_final_price_usd: number | null;
  token_value_usd: number;
  estimated_tokens: number | null;
  configured: boolean;
  warnings: string[];
}

export type CouponDiscountType = "percentage";

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
  applies_to: ("token_packages" | "free_token_purchase")[];
  eligible_user_ids: number[];
  max_redemptions_per_user: number | null;
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
  percentage_off?: number | null;
  max_redemptions?: number | null;
  first_time_transaction_only: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
  applies_to: ("token_packages" | "free_token_purchase")[];
  eligible_user_ids: number[];
  max_redemptions_per_user: number | null;
  metadata: Record<string, unknown>;
}

export interface BillingCouponUpdate {
  name?: string | null;
  description?: string | null;
  max_redemptions?: number | null;
  first_time_transaction_only?: boolean | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean | null;
  applies_to?: ("token_packages" | "free_token_purchase")[] | null;
  eligible_user_ids?: number[] | null;
  max_redemptions_per_user?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface BillingCouponSyncResponse {
  coupon: BillingCouponResponse;
  stripe_coupon_id: string;
  stripe_promotion_code_id: string;
  message: string;
}

export interface PricingSimulatorScenario {
  label: string;
  discount_percent: number;
  tokens: number;
  customer_value_usd: number;
  infrastructure_cost_usd: number;
  normal_profit_usd: number;
  discount_given_usd: number;
  profit_after_discount_usd: number;
  rounding_surplus_usd: number;
  company_total_usd: number;
}

export interface PricingSimulatorRecommendation {
  token_value_usd: number;
  desired_profit_per_token_usd: number;
  tokens: number;
  worst_discount_percent: number;
  estimated_company_profit_usd: number;
  estimated_customer_value_usd: number;
  distance_from_target_usd: number;
}

export interface PricingSimulatorResponse {
  generation_module_id: number;
  module_key: string;
  module_name: string;
  pricing_rule_id: number;
  pricing_rule_title: string;
  provider: string;
  gpu_key: string | null;
  gpu_cost_usd_per_second: number;
  duration_seconds: number;
  duration_source: string;
  historical_samples_used: number;
  estimate_confidence: string;
  scaledown_seconds: number;
  technical_margin_seconds: number;
  billable_seconds: number;
  infrastructure_cost_usd: number;
  current_token_value_usd: number;
  current_profit_per_token_usd: number;
  simulated_token_value_usd: number;
  simulated_profit_per_token_usd: number;
  scenarios: PricingSimulatorScenario[];
  recommendations: PricingSimulatorRecommendation[];
  warnings: string[];
}
