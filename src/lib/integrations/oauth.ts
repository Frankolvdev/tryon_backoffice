import type {
  IntegrationConfigResponse,
  IntegrationProvider,
} from "@/types/admin-integrations";

export type RemainingOAuthProvider =
  | "github_oauth"
  | "facebook_oauth"
  | "apple_oauth";

export interface OAuthProviderDefinition {
  provider: RemainingOAuthProvider;
  label: string;
  clientIdLabel: string;
  clientSecretLabel: string;
  clientIdPlaceholder: string;
  clientSecretPlaceholder: string;
  redirectUri: string;
  scopes: string;
  consoleUrl: string;
  consoleLabel: string;
  help: string;
}

export const remainingOAuthDefinitions: Record<
  RemainingOAuthProvider,
  OAuthProviderDefinition
> = {
  github_oauth: {
    provider: "github_oauth",
    label: "GitHub OAuth",
    clientIdLabel: "Client ID",
    clientSecretLabel: "Client Secret",
    clientIdPlaceholder: "Ov23li...",
    clientSecretPlaceholder: "Tu Client Secret de GitHub",
    redirectUri:
      "http://127.0.0.1:8001/api/v1/oauth/github/callback",
    scopes: "read:user user:email",
    consoleUrl: "https://github.com/settings/developers",
    consoleLabel: "Abrir GitHub Developer Settings",
    help:
      "Crea una OAuth App y registra exactamente la URI de redirección indicada.",
  },
  facebook_oauth: {
    provider: "facebook_oauth",
    label: "Facebook OAuth",
    clientIdLabel: "App ID",
    clientSecretLabel: "App Secret",
    clientIdPlaceholder: "123456789012345",
    clientSecretPlaceholder: "Tu App Secret de Meta",
    redirectUri:
      "http://127.0.0.1:8001/api/v1/oauth/facebook/callback",
    scopes: "email,public_profile",
    consoleUrl: "https://developers.facebook.com/apps/",
    consoleLabel: "Abrir Meta for Developers",
    help:
      "Configura Facebook Login y agrega la URI como OAuth Redirect URI válida.",
  },
  apple_oauth: {
    provider: "apple_oauth",
    label: "Apple OAuth",
    clientIdLabel: "Services ID",
    clientSecretLabel: "Client Secret",
    clientIdPlaceholder: "com.example.web",
    clientSecretPlaceholder: "Client Secret firmado para Apple",
    redirectUri:
      "http://127.0.0.1:8001/api/v1/oauth/apple/callback",
    scopes: "name email",
    consoleUrl: "https://developer.apple.com/account/resources/identifiers/list/serviceId",
    consoleLabel: "Abrir Apple Developer",
    help:
      "El backend actual almacena el Services ID como api_key y el Client Secret firmado como api_secret.",
  },
};

export interface OAuthReadiness {
  configured: boolean;
  enabled: boolean;
  available: boolean;
  missing: string[];
}

export function isRemainingOAuthProvider(
  provider: IntegrationProvider,
): provider is RemainingOAuthProvider {
  return provider in remainingOAuthDefinitions;
}

export function getOAuthReadiness(
  integration: IntegrationConfigResponse,
  definition: OAuthProviderDefinition,
): OAuthReadiness {
  const redirectUri = String(
    integration.config.redirect_uri ?? "",
  ).trim();

  const missing: string[] = [];

  if (!integration.api_key_configured) {
    missing.push(definition.clientIdLabel);
  }

  if (!integration.api_secret_configured) {
    missing.push(definition.clientSecretLabel);
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

export function validateOAuthRedirectUri(value: string): string | null {
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
