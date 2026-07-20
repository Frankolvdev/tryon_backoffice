"use client";

import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { OAuthStatus } from "@/components/backoffice/integrations/oauth/oauth-status";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  GOOGLE_OAUTH_DEFAULT_REDIRECT_URI,
  GOOGLE_OAUTH_JAVASCRIPT_ORIGIN,
  GOOGLE_OAUTH_SCOPES,
  validateGoogleClientId,
  validateGoogleRedirectUri,
} from "@/lib/integrations/google";

import type {
  IntegrationConfigResponse,
  IntegrationConfigUpdate,
} from "@/types/admin-integrations";

interface GoogleOAuthFormProps {
  integration: IntegrationConfigResponse;
  onSaved: (integration: IntegrationConfigResponse) => void;
}

async function copyValue(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado.`);
  } catch {
    toast.error(`No fue posible copiar ${label.toLowerCase()}.`);
  }
}

export function GoogleOAuthForm({
  integration,
  onSaved,
}: GoogleOAuthFormProps) {
  const [isEnabled, setIsEnabled] = useState(integration.is_enabled);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState(
    String(integration.config.redirect_uri ?? "") ||
      GOOGLE_OAUTH_DEFAULT_REDIRECT_URI,
  );
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsEnabled(integration.is_enabled);
    setClientId("");
    setClientSecret("");
    setRedirectUri(
      String(integration.config.redirect_uri ?? "") ||
        GOOGLE_OAUTH_DEFAULT_REDIRECT_URI,
    );
  }, [integration]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!integration.api_key_configured || clientId.trim()) {
      const clientIdError = validateGoogleClientId(clientId);
      if (clientIdError) {
        toast.error(clientIdError);
        return;
      }
    }

    if (!integration.api_secret_configured && !clientSecret.trim()) {
      toast.error(
        "El Client Secret es obligatorio cuando todavía no está configurado.",
      );
      return;
    }

    const redirectError = validateGoogleRedirectUri(redirectUri);
    if (redirectError) {
      toast.error(redirectError);
      return;
    }

    const payload: IntegrationConfigUpdate = {
      name: "Google OAuth",
      status: isEnabled ? "enabled" : "disabled",
      is_enabled: isEnabled,
      base_url: null,
      config: {
        ...integration.config,
        redirect_uri: redirectUri.trim(),
      },
    };

    if (clientId.trim()) {
      payload.api_key = clientId.trim();
    }

    if (clientSecret.trim()) {
      payload.api_secret = clientSecret.trim();
    }

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<IntegrationConfigResponse>(
          "/api/admin/integrations/google_oauth",
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );

      onSaved(response);
      setClientId("");
      setClientSecret("");
      toast.success("Google OAuth actualizado correctamente.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar Google OAuth.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="luxia-panel rounded-3xl p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Autenticación social
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Google OAuth
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Configura el inicio de sesión con Google que utilizará el AppWeb.
            Las credenciales se almacenan cifradas y no vuelven a mostrarse.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-white/7 bg-black/20 px-4 py-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(event) => setIsEnabled(event.target.checked)}
            className="size-4 accent-red-700"
          />
          Habilitar Google OAuth
        </label>
      </div>

      <div className="mt-6">
        <OAuthStatus integration={integration} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm text-zinc-400">Client ID</span>
          <input
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            placeholder={
              integration.api_key_configured
                ? "Configurado; déjalo vacío para conservarlo"
                : "123456789.apps.googleusercontent.com"
            }
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
          <span className="mt-2 block text-xs text-zinc-600">
            Debe terminar en .apps.googleusercontent.com.
          </span>
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            Client Secret
          </span>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={clientSecret}
              onChange={(event) => setClientSecret(event.target.value)}
              placeholder={
                integration.api_secret_configured
                  ? "Configurado; déjalo vacío para conservarlo"
                  : "GOCSPX-..."
              }
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 pr-12 text-sm text-white outline-none focus:border-red-500/50"
            />
            <button
              type="button"
              onClick={() => setShowSecret((current) => !current)}
              aria-label={showSecret ? "Ocultar secreto" : "Mostrar secreto"}
              className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 hover:text-white"
            >
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span className="mt-2 block text-xs text-zinc-600">
            Por seguridad, el backend nunca devuelve el secreto guardado.
          </span>
        </label>

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm text-zinc-400">
            URI de redirección autorizada
          </span>
          <input
            value={redirectUri}
            onChange={(event) => setRedirectUri(event.target.value)}
            placeholder={GOOGLE_OAUTH_DEFAULT_REDIRECT_URI}
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
          <span className="mt-2 block text-xs text-zinc-600">
            Debe coincidir exactamente con la URI registrada en Google Cloud.
          </span>
        </label>
      </div>

      <section className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-red-400" size={18} />
          <div>
            <h3 className="font-medium text-white">Configuración en Google Cloud</h3>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Copia estos valores en tu cliente OAuth 2.0 de tipo Aplicación web.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {[
            {
              label: "URI de redirección autorizada",
              value: redirectUri || GOOGLE_OAUTH_DEFAULT_REDIRECT_URI,
            },
            {
              label: "Origen de JavaScript autorizado",
              value: GOOGLE_OAUTH_JAVASCRIPT_ORIGIN,
            },
            {
              label: "Scopes utilizados por el backend",
              value: GOOGLE_OAUTH_SCOPES,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/7 bg-black/25 p-4 last:lg:col-span-2"
            >
              <p className="text-xs text-zinc-600">{item.label}</p>
              <div className="mt-2 flex items-center gap-3">
                <code className="min-w-0 flex-1 break-all text-xs text-zinc-300">
                  {item.value}
                </code>
                <button
                  type="button"
                  onClick={() => void copyValue(item.value, item.label)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/8 text-zinc-500 hover:text-white"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300"
        >
          Abrir credenciales de Google Cloud
          <ExternalLink size={14} />
        </a>
      </section>

      <div className="mt-6 flex justify-end border-t border-white/6 pt-5">
        <button
          type="submit"
          disabled={isSaving}
          className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
        >
          {isSaving ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Guardar Google OAuth
        </button>
      </div>
    </form>
  );
}
