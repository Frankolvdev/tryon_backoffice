export type BodySex = "woman" | "man";

export type WorkflowMapping = Record<string, { node_id: string; input_name: string }>;

export interface BodyProportionConfig {
  id: number | null;
  sex: BodySex;
  workflow: Record<string, unknown> | null;
  input_mapping: WorkflowMapping;
  limits: Record<string, number | null>;
  formula: Record<string, number>;
  fixed_values: Record<string, number>;
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
