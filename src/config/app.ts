export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "LUXIA",
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
    "AI Virtual Try-On Administration",
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "es",
  supportedLocales: (
    process.env.NEXT_PUBLIC_SUPPORTED_LOCALES ?? "es,en"
  ).split(","),
} as const;