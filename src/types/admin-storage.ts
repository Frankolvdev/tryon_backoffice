export type StorageProvider =
  | "local"
  | "s3"
  | "amazon_s3"
  | "cloudflare_r2"
  | string;

export interface AdminStorageFile {
  id: number;
  user_id: number | null;
  user_email: string | null;
  user_full_name: string | null;
  user_role: string | null;
  provider: StorageProvider;
  bucket: string | null;
  object_key: string;
  public_url: string | null;
  original_filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface StorageSignedUrlResponse { url: string; }

export interface StorageProviderConfig {
  provider: "local" | "amazon_s3" | "cloudflare_r2";
  name: string;
  is_enabled: boolean;
  status: string;
  base_url?: string | null;
  api_key_configured?: boolean;
  api_secret_configured?: boolean;
  config?: Record<string, unknown>;
  local_storage_dir?: string;
  last_health_status?: string | null;
  last_health_message?: string | null;
  last_checked_at?: string | null;
}

export interface StorageProvidersResponse {
  active_provider: "local" | "amazon_s3" | "cloudflare_r2";
  local: StorageProviderConfig;
  amazon_s3: StorageProviderConfig;
  cloudflare_r2: StorageProviderConfig;
  providers: Array<{ key: string; label: string; active: boolean }>;
  note: string;
}

export interface StorageHealthResponse {
  provider: string;
  status: string;
  message: string;
  metadata?: Record<string, unknown>;
}
