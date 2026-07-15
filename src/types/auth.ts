export type UserRole = "user" | "admin" | "superadmin";

export type UserStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "deleted";

export interface LoginRequest {
  email: string;
  password: string;
  mfa_code?: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  mfa_setup_required: boolean;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface User {
  email: string;
  full_name: string | null;
  id: number;
  avatar_file_id: number | null;
  auth_provider: string;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
  is_verified: boolean;
  token_balance: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminSessionResponse {
  authenticated: boolean;
  user: User;
}

export interface AdminLoginResponse {
  success: boolean;
  mfa_setup_required: boolean;
  user: User;
}

export interface AdminMfaStatusResponse {
  user_id: number;
  required: boolean;
  configured: boolean;
  enabled: boolean;
  method: string | null;
  verified_at: string | null;
  last_used_at: string | null;
  recovery_codes_remaining: number;
}

export interface AdminMfaSetupResponse {
  success: boolean;
  secret: string;
  provisioning_uri: string;
  recovery_codes: string[];
  message: string;
}

export interface AdminMfaOperationResponse {
  success: boolean;
  message: string;
}

export interface ApiValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail?: string | ApiValidationError[];
  message?: string;
  code?: string;
}