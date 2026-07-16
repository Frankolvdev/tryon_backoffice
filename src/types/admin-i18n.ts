export interface I18nLocale {
  code: string;
  name: string;
  native_name: string;
  fallback_locale_code: string | null;
  currency_code: string;
  timezone: string;
  date_format: string;
  time_format: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface I18nLocaleListResponse {
  items: I18nLocale[];
  total: number;
}

export interface I18nLocaleCreate {
  code: string;
  name: string;
  native_name: string;
  fallback_locale_code?: string | null;
  currency_code: string;
  timezone: string;
  date_format: string;
  time_format: string;
  is_active: boolean;
  is_default: boolean;
}

export interface I18nLocaleUpdate {
  name?: string;
  native_name?: string;
  fallback_locale_code?: string | null;
  currency_code?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface I18nSeedResponse {
  success: boolean;
  locales_processed: number;
  translations_processed: number;
  message: string;
}
export interface I18nTranslation {
  id: number;
  locale_code: string;
  namespace: string;
  translation_key: string;
  value: string;
  description: string | null;
  is_html: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface I18nTranslationListResponse {
  items: I18nTranslation[];
  total: number;
  skip: number;
  limit: number;
}

export interface I18nTranslationCreate {
  locale_code: string;
  translation_key: string;
  value: string;
  description?: string | null;
  is_html: boolean;
  is_active: boolean;
}

export interface I18nTranslationUpdate {
  value?: string;
  description?: string | null;
  is_html?: boolean;
  is_active?: boolean;
}
