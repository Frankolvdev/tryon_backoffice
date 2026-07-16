export interface AdminFeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type FeatureFlagStatusFilter = "all" | "enabled" | "disabled";
export type FeatureFlagVisibilityFilter = "all" | "public" | "private";
