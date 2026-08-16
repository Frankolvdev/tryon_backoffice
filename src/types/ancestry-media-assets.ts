export type AncestryStorageMode = "auto" | "local" | "amazon_s3" | "cloudflare_r2";

export interface AncestryMediaAsset {
  id: number;
  ancestry_key: string;
  display_name: string;
  country_code: string | null;
  flag_emoji: string | null;
  latitude: number | null;
  longitude: number | null;
  sort_order: number;
  storage_mode: AncestryStorageMode;
  poster_storage_file_id: number | null;
  video_storage_file_id: number | null;
  poster_url: string | null;
  video_url: string | null;
  is_active: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
export interface AncestryMediaAssetList { items: AncestryMediaAsset[]; total: number }
export interface AncestryStorageOptions { active_provider: string; modes: AncestryStorageMode[] }
