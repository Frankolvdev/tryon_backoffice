"use client";

import {
  CheckCircle2,
  CircleOff,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  LoaderCircle,
  Save,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import {
  getOAuthReadiness,
  remainingOAuthDefinitions,
  validateOAuthRedirectUri,
  type RemainingOAuthProvider,
} from "@/lib/integrations/oauth";

import type {
  IntegrationConfigResponse,
  IntegrationConfigUpdate,
} from "@/types/admin-integrations";

interface OAuthProviderFormProps {
  provider: RemainingOAuthProvider;
  integration: IntegrationConfigResponse;
  onSaved: (integration: IntegrationConfigResponse) => void;
}

async function copyValue(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado.`);
  } catch {
    toast.error("No fue posible copiar el valor.");
  }
}

export function OAuthProviderForm({
  provider,
  integration,
  onSaved,
}: OAuthProviderFormProps) {
  const definition = remainingOAuthDefinitions[provider];
  const [isEnabled, setIsEnabled] = useState(integration.is_enabled);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState(
    String(integration.config.redirect_uri ?? "") ||
      definition.redirectUri,
  );
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsEnabled(integration.is_enabled);
    setClientId("");
    setClientSecret("");
    setRedirectUri(
      String(integration.config.redirect_uri ?? "") ||
        definition.redirectUri,
    );
  }, [definition.redirectUri, integration]);

  const readiness = useMemo(
    () => getOAuthReadiness(integration, definition),
    [definition, integration],
  );

  const status = readiness.available
    ? {
        icon: ShieldCheck,
        title: "Disponible para el AppWeb",
        description: `${definition.label} está habilitado y tiene las credenciales requeridas.`,
        className:
          "border-emerald-500/20 bg-emerald-950/20 text-emerald-300",
      }
    : !readiness.configured
      ? {
          icon: TriangleAlert,
          title: "Configuración incompleta",
          description: `Falta: ${readiness.missing.join(", ")}.`,
          className:
            "border-amber-500/20 bg-amber-950/20 text-amber-300",
        }
      : !readiness.enabled
        ? {
            icon: CircleOff,
            title: "Configurado, pero deshabilitado",
            description:
              "Activa la integración para publicarla en la configuración OAuth.",
            className:
              "border-zinc-500/20 bg-zinc-950/30 text-zinc-300",
          }
        : {
            icon: CheckCircle2,
            title: "Configurado",
            description: "Las credenciales requeridas están completas.",
            className:
              "border-emerald-500/20 bg-emerald-950/20 text-emerald-300",
          };

  const StatusIcon = status.icon;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!integration.api_key_configured && !clientId.trim()) {
      toast.error(`${definition.clientIdLabel} es obligatorio.`);
      return;
    }

    if (!integration.api_secret_configured && !clientSecret.trim()) {
      toast.error(`${definition.clientSecretLabel} es obligatorio.`);
      return;
    }

    const redirectError = validateOAuthRedirectUri(redirectUri);
    if (redirectError) {
      toast.error(redirectError);
      return;
    }

    const payload: IntegrationConfigUpdate = {
      name: definition.label,
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
          `/api/admin/integrations/${provider}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );

      onSaved(response);
      setClientId("");
      setClientSecret("");
      toast.success(`${definition.label} actualizado correctamente.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `No fue posible guardar ${definition.label}.`,
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
            {definition.label}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {definition.help} Las credenciales se guardan en el backend y los
            secretos existentes nunca vuelven a mostrarse.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-white/7 bg-black/20 px-4 py-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(event) => setIsEnabled(event.target.checked)}
            className="size-4 accent-red-700"
          />
          Habilitar {definition.label}
        </label>
      </div>

      <div className={`mt-6 rounded-2xl border p-4 ${status.className}`}>
        <div className="flex items-start gap-3">
          <StatusIcon className="mt-0.5 shrink-0" size={19} />
          <div>
            <p className="text-sm font-semibold">{status.title}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">
              {status.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            {definition.clientIdLabel}
          </span>
          <input
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            placeholder={
              integration.api_key_configured
                ? "Configurado; déjalo vacío para conservarlo"
                : definition.clientIdPlaceholder
            }
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-400">
            {definition.clientSecretLabel}
          </span>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={clientSecret}
              onChange={(event) => setClientSecret(event.target.value)}
              placeholder={
                integration.api_secret_configured
                  ? "Configurado; déjalo vacío para conservarlo"
                  : definition.clientSecretPlaceholder
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
            El backend no devuelve el secreto una vez almacenado.
          </span>
        </label>

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm text-zinc-400">
            URI de redirección autorizada
          </span>
          <input
            value={redirectUri}
            onChange={(event) => setRedirectUri(event.target.value)}
            placeholder={definition.redirectUri}
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
          <span className="mt-2 block text-xs text-zinc-600">
            Debe coincidir exactamente con la URI registrada en el proveedor.
          </span>
        </label>
      </div>

      <section className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-red-400" size={18} />
          <div>
            <h3 className="font-medium text-white">
              Valores para el panel del proveedor
            </h3>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Copia estos valores sin cambiar host, puerto ni ruta.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {[
            {
              label: "URI de redirección autorizada",
              value: redirectUri || definition.redirectUri,
            },
            {
              label: "Scopes solicitados por el backend",
              value: definition.scopes,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/7 bg-black/25 p-4"
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
          href={definition.consoleUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300"
        >
          {definition.consoleLabel}
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
          Guardar {definition.label}
        </button>
      </div>
    </form>
  );
}
