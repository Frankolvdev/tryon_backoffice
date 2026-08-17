export type ModelGenerationToolKey = "eyebrows" | "lips" | "hairstyle";
export type ModelGenerationStorageMode = "auto" | "local" | "amazon_s3" | "cloudflare_r2";

export interface ModelGenerationAsset {
  id: number;
  tool_key: ModelGenerationToolKey;
  asset_key: string;
  title: string;
  value: string;
  sort_order: number;
  storage_mode: ModelGenerationStorageMode;
  poster_url?: string | null;
  video_url?: string | null;
  is_active: boolean;
  notes?: string | null;
  metadata: Record<string, unknown>;
}
export interface ModelGenerationAssetList { items: ModelGenerationAsset[]; total: number; }
export interface ModelGenerationStorageOptions { active_provider: string; modes: ModelGenerationStorageMode[]; }
