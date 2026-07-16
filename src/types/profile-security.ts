import type { User } from "@/types/auth";

export interface SelfProfileUpdate {
  email?: string | null;
  full_name?: string | null;
}

export interface SelfPasswordChange {
  current_password: string;
  new_password: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface AccountSecuritySettings {
  id: number;
  registration_enabled: boolean;
  verification_required: boolean;
  verification_method: string;
  allow_login_before_verification: boolean;
  otp_length: number;
  otp_expiration_minutes: number;
  otp_max_attempts: number;
  otp_resend_cooldown_seconds: number;
  otp_max_resends_per_hour: number;
  email_link_expiration_minutes: number;
  delete_unverified_accounts_after_days: number;
  turnstile_enabled: boolean;
  block_disposable_email: boolean;
  require_terms_acceptance: boolean;
  require_age_confirmation: boolean;
  minimum_age: number;
  max_accounts_per_ip_per_day: number;
  max_registrations_per_device_per_day: number;
  admin_mfa_required: boolean;
  admin_mfa_totp_enabled: boolean;
  admin_mfa_recovery_codes_enabled: boolean;
  user_mfa_available: boolean;
  user_mfa_required: boolean;
  user_mfa_totp_enabled: boolean;
  user_mfa_recovery_codes_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type ProfileUser = User;
