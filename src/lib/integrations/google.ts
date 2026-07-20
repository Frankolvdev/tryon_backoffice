import type { IntegrationConfigResponse } from "@/types/admin-integrations";

export const GOOGLE_OAUTH_DEFAULT_REDIRECT_URI =
  "http://127.0.0.1:8001/api/v1/oauth/google/callback";

export const GOOGLE_OAUTH_JAVASCRIPT_ORIGIN =
  "http://localhost:3003";

export const GOOGLE_OAUTH_SCOPES = "openid email profile";

export interface GoogleOAuthReadiness {
  configured: boolean;
  enabled: boolean;
  available: boolean;
  missing: string[];
}

export function getGoogleOAuthReadiness(
  integration: IntegrationConfigResponse,
): GoogleOAuthReadiness {
  const redirectUri = String(
    integration.config.redirect_uri ?? "",
  ).trim();

  const missing: string[] = [];

  if (!integration.api_key_configured) {
    missing.push("Client ID");
  }

  if (!integration.api_secret_configured) {
    missing.push("Client Secret");
  }

  if (!redirectUri) {
    missing.push("URI de redirección");
  }

  const configured = missing.length === 0;
  const enabled = integration.is_enabled;

  return {
    configured,
    enabled,
    available: configured && enabled,
    missing,
  };
}

export function validateGoogleClientId(value: string): string | null {
  const candidate = value.trim();

  if (!candidate) {
    return "El Client ID es obligatorio cuando todavía no está configurado.";
  }

  if (!candidate.endsWith(".apps.googleusercontent.com")) {
    return "El Client ID debe terminar en .apps.googleusercontent.com.";
  }

  return null;
}

export function validateGoogleRedirectUri(value: string): string | null {
  const candidate = value.trim();

  if (!candidate) {
    return "La URI de redirección es obligatoria.";
  }

  if (/\s/.test(candidate)) {
    return "La URI de redirección no puede contener espacios.";
  }

  try {
    const parsed = new URL(candidate);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "La URI debe usar HTTP o HTTPS.";
    }
  } catch {
    return "La URI de redirección no es válida.";
  }

  return null;
}
