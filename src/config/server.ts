function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsedValue = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

export const serverConfig = {
  backendApiUrl:
    process.env.BACKEND_API_URL ?? "http://127.0.0.1:8001",

  accessCookieName:
    process.env.AUTH_ACCESS_COOKIE_NAME ??
    "luxia_admin_access",

  refreshCookieName:
    process.env.AUTH_REFRESH_COOKIE_NAME ??
    "luxia_admin_refresh",

  accessCookieMaxAge: parsePositiveInteger(
    process.env.AUTH_ACCESS_COOKIE_MAX_AGE,
    1_800,
  ),

  refreshCookieMaxAge: parsePositiveInteger(
    process.env.AUTH_REFRESH_COOKIE_MAX_AGE,
    2_592_000,
  ),
} as const;