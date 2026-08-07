export interface InfrastructureProviderBalance {
  provider:string;
  funded_usd:number;
  infrastructure_cost_usd:number;
  credit_available_usd:number;
  unfunded_cost_usd:number;
  released_credit_usd:number;
}

export interface CashboxSummary {
  collected_usd:number;
  available_usd:number;
  protected_infrastructure_usd:number;
  blocked_profit_usd:number;
  released_commercial_profit_usd:number;
  rounding_and_operational_surplus_usd:number;
  expiration_releases_usd:number;
  withdrawals_usd:number;
  infrastructure_cash_available_usd:number;
  infrastructure_funded_usd:number;
  provider_credit_available_usd:number;
  provider_cost_unfunded_usd:number;
  provider_credit_released_usd:number;
  provider_balances:InfrastructureProviderBalance[];
  pending_recovery_generations:number;
  pending_recovery_tokens:number;
  pending_recovery_infrastructure_usd:number;
  pending_recovery_profit_estimated_usd:number;
  pending_recovery_economic_estimated_usd:number;
  active_bags:number;
  new_bags:number;
  expired_bags:number;
}

export interface TokenBag {
  id:number;
  user_id:number;
  user_email?:string|null;
  source:string;
  source_label:string;
  reference_id?:string|null;
  status:string;
  original_tokens:number;
  remaining_tokens:number;
  consumed_tokens:number;
  amount_paid_usd:number;
  effective_token_value_usd:number;
  normal_profit_per_token_usd:number;
  effective_profit_per_token_usd:number;
  infrastructure_capacity_per_token_usd:number;
  operational_reserve_per_token_usd:number;
  operational_reserve_total_usd:number;
  operational_reserve_released_usd:number;
  commercial_profit_total_usd:number;
  commercial_profit_released_usd:number;
  realized_extra_profit_usd:number;
  total_available_from_bag_usd:number;
  protected_infrastructure_remaining_usd:number;
  infrastructure_used_usd:number;
  infrastructure_funded_usd:number;
  infrastructure_unfunded_usd:number;
  provider_credit_released_usd:number;
  rounding_surplus_usd:number;
  rounding_surplus_total_usd:number;
  provider_rounding_credit_usd:number;
  expiration_release_usd:number;
  coupon_code?:string|null;
  plan_name?:string|null;
  package_name?:string|null;
  benefit_source?:string|null;
  benefit_label?:string|null;
  profit_discount_percent:number;
  snapshot_version?:number|null;
  snapshot_source?:string|null;
  payment_status?:string|null;
  refundable:boolean;
  refund_reason:string;
  activated_at?:string|null;
  expires_at?:string|null;
  expired_at?:string|null;
  created_at:string;
}

export interface TokenBagList {items:TokenBag[];total:number}
export interface BagGeneration {execution_id:string;tokens_used:number;created_at:string;infrastructure_cost_usd:number;company_profit_usd:number;rounding_surplus_usd:number;status?:string|null}
export interface BagDetail {bag:TokenBag;generations:BagGeneration[];timeline:{type:string;at:string;label:string}[];purchase_id?:number|null}
export interface Withdrawal {id:number;amount_usd:number;currency:string;beneficiary?:string|null;concept:string;method?:string|null;proof_url?:string|null;notes?:string|null;created_by_user_id?:number|null;withdrawn_at:string;created_at:string}
export interface ExpirationSettings {enabled:boolean;days:number;simulation_enabled:boolean}

export interface ExpirationSimulationResult {
  bag_id:number;
  previous_status:string;
  current_status:string;
  expired_tokens:number;
  commercial_profit_released_usd:number;
  infrastructure_reserve_released_usd:number;
  infrastructure_cash_released_usd:number;
  provider_credit_released_usd:number;
  provider_credit_released_by_provider:Record<string,number>;
  promotional_credit_returned_usd:number;
  total_available_from_bag_usd:number;
  expires_at:string;
  expired_at:string;
}

export interface InfrastructureFundingAllocation {
  id:number;
  lot_id:number;
  amount_usd:number;
}

export interface InfrastructureFunding {
  id:number;
  amount_usd:number;
  currency:string;
  provider:string;
  beneficiary?:string|null;
  concept:string;
  method?:string|null;
  proof_url?:string|null;
  notes?:string|null;
  created_by_user_id?:number|null;
  funded_at:string;
  created_at:string;
  allocations:InfrastructureFundingAllocation[];
}

export interface PendingRecoveryItem {
  execution_id:string;
  module_key:string;
  user_id?:number|null;
  user_email?:string|null;
  provider?:string|null;
  status:string;
  billing_access_status:string;
  tokens_charged:number;
  pending_tokens:number;
  estimated_final_tokens:number;
  infrastructure_cost_usd:number;
  infrastructure_covered_usd:number;
  infrastructure_pending_usd:number;
  profit_realized_usd:number;
  profit_pending_estimated_usd:number;
  economic_pending_estimated_usd:number;
  created_at:string;
}

export interface PendingRecoverySummary {
  pending_generations:number;
  pending_tokens:number;
  infrastructure_pending_usd:number;
  profit_pending_estimated_usd:number;
  economic_pending_estimated_usd:number;
}

export interface PendingRecoveryList {
  items:PendingRecoveryItem[];
  summary:PendingRecoverySummary;
}

export interface PromotionalCreditSettings {
  signup_enabled:boolean;
  signup_tokens:number;
  signup_provider:string;
  allow_pending_settlement:boolean;
}

export interface PromotionalProviderBalance {
  provider:string;
  funded_usd:number;
  available_usd:number;
  available_tokens:number;
}

export interface PromotionalFund {
  id:number;
  provider:string;
  original_usd:number;
  remaining_usd:number;
  reference?:string|null;
  description?:string|null;
  created_at:string;
}

export interface PromotionalGrantHistory {
  id:number;
  fund_id:number;
  lot_id:number;
  user_id:number;
  user_email?:string|null;
  tokens_granted:number;
  reserve_per_token_usd:number;
  amount_reserved_usd:number;
  grant_type:string;
  created_at:string;
}

export interface PromotionalCreditSummary {
  reserve_per_token_usd:number;
  generation_infrastructure_reserve_per_token_usd:number;
  total_funded_usd:number;
  total_available_usd:number;
  provider_balances:PromotionalProviderBalance[];
  settings:PromotionalCreditSettings;
  funds:PromotionalFund[];
  grants:PromotionalGrantHistory[];
}

export interface PromotionalGrantResult {
  requested_tokens:number;
  granted_tokens:number;
  provider:string;
  amount_reserved_usd:number;
  user_balance?:number|null;
  grant_ids:number[];
}

export interface PromotionalRevokeResult {
  requested_tokens:number;
  revoked_tokens:number;
  amount_returned_usd:number;
  user_balance:number;
  affected_lot_ids:number[];
}


export interface OperationalCashboxSummary {
  operational_reserve_per_token_usd:number;
  commercial_sale_value_per_token_usd:number;
  lifetime_operational_funds_usd:number;
  released_operational_funds_usd:number;
  blocked_operational_funds_usd:number;
  spent_operational_funds_usd:number;
  available_operational_funds_usd:number;
  contributing_bags:number;
}

export interface OperationalExpense {
  id:number;
  amount_usd:number;
  currency:string;
  category:string;
  beneficiary?:string|null;
  concept:string;
  method?:string|null;
  proof_url?:string|null;
  notes?:string|null;
  created_by_user_id?:number|null;
  spent_at:string;
  created_at:string;
}
