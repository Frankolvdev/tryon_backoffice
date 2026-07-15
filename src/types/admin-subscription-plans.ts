export type BillingInterval =
  | "month"
  | "year";

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
  features: string[];
  metadata: Record<string, unknown>;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanListResponse {
  items: SubscriptionPlanResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface SubscriptionPlanCreate {
  key: string;
  name: string;
  description?: string | null;
  billing_interval: BillingInterval;
  currency: string;
  price_amount: number;
  tokens_per_period: number;
  max_generations_per_period?: number | null;
  priority: number;
  features: string[];
  metadata: Record<string, unknown>;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface SubscriptionPlanUpdate {
  name?: string | null;
  description?: string | null;
  billing_interval?: BillingInterval | null;
  currency?: string | null;
  price_amount?: number | null;
  tokens_per_period?: number | null;
  max_generations_per_period?: number | null;
  priority?: number | null;
  features?: string[] | null;
  metadata?: Record<string, unknown> | null;
  is_public?: boolean | null;
  is_active?: boolean | null;
  sort_order?: number | null;
}

export interface SubscriptionPlanSyncResponse {
  plan: SubscriptionPlanResponse;
  stripe_product_id: string;
  stripe_price_id: string;
  price_replaced: boolean;
  message: string;
}

export interface SubscriptionPlanSeedResponse {
  created: number;
  skipped: number;
  total: number;
}
