export type BodySex = "woman" | "man";
export type BodyProportionStorageMode = "auto" | "local" | "amazon_s3" | "cloudflare_r2";

export type WorkflowMapping = Record<string, { node_id: string; input_name: string }>;

export interface BodyProportionConfig {
  id: number | null;
  sex: BodySex;
  workflow: Record<string, unknown> | null;
  input_mapping: WorkflowMapping;
  limits: Record<string, number | null>;
  formula: {
    fat_levels: Record<string, { label: string; fat_thin: number; hips_compensation: number; breasts_compensation: number }>;
    ass_levels: Record<string, { label: string; hips_size: number }>;
    breast_levels: Record<string, { label: string; base: number }>;
    ass_breast_compensation: Record<string, Record<string, number>>;
    [key: string]: unknown;
  };
  fixed_values: Record<string, number>;
  storage_mode: BodyProportionStorageMode;
  is_enabled: boolean;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BodyProportionPreset {
  id: number;
  sex: BodySex;
  sort_order: number;
  profile_key: string;
  display_name: string;
  category_slug: string;
  fat_band: string | null;
  ass_band: string | null;
  breast_band: string | null;
  is_base_category: boolean;
  base_category_key: string | null;
  hips_size: number;
  fat_thin: number;
  breasts_size: number;
  skin_tone: number;
  hair_length: number;
  image_storage_file_id: number | null;
  image_url: string | null;
  local_mirror_path: string | null;
  status: string;
  last_error: string | null;
  generation_metadata: Record<string, unknown>;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BodyProportionPresetList { items: BodyProportionPreset[]; total: number; }
export interface BodyProportionGeneration { preset: BodyProportionPreset; prompt_id: string; storage_provider: string; overwritten: boolean; }
export interface BodyProportionStorageOptions { active_provider: string; modes: BodyProportionStorageMode[]; }
