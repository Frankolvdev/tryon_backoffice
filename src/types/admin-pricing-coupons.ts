export type PricingOperationType =
  | "tryon"
  | string;

export type TryOnItemType =
  | "clothing"
  | "shoes"
  | string;

export type QualityMode =
  | "standard"
  | "high"
  | string;

export interface PricingRuleResponse {
  id: number;
  operation_type: PricingOperationType;
  item_type: TryOnItemType;
  quality_mode: QualityMode;
  tokens_cost: number;
  estimated_gpu_seconds: number;
  estimated_gpu_cost_cents: number;
  margin_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingRuleCreate {
  operation_type: PricingOperationType;
  item_type: TryOnItemType;
  quality_mode: QualityMode;
  tokens_cost: number;
  estimated_gpu_seconds: number;
  estimated_gpu_cost_cents: number;
  margin_percent: number;
  is_active: boolean;
}

export interface PricingRuleUpdate {
  tokens_cost?: number | null;
  estimated_gpu_seconds?: number | null;
  estimated_gpu_cost_cents?: number | null;
  margin_percent?: number | null;
  is_active?: boolean | null;
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
  metadata?: Record<string, unknown> | null;
}

export interface BillingCouponSyncResponse {
  coupon: BillingCouponResponse;
  stripe_coupon_id: string;
  stripe_promotion_code_id: string;
  message: string;
}
