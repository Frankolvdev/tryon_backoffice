export type StorageProvider =
  | "local"
  | "s3"
  | "minio"
  | "r2"
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

export interface StorageSignedUrlResponse {
  url: string;
}
