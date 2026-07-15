"use client";

import {
  AlertTriangle,
  BadgeDollarSign,
  Eye,
  EyeOff,
  LoaderCircle,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  IntegrationConfigResponse,
  IntegrationConfigUpdate,
  IntegrationStatus,
} from "@/types/admin-integrations";

interface StripeIntegrationEditorProps {
  integration: IntegrationConfigResponse;
  onSaved: (
    integration: IntegrationConfigResponse,
  ) => void;
}

type StripeDetectedMode =
  | "test"
  | "live"
  | "unknown"
  | "saved";

function detectStripeMode(
  secretKey: string,
): StripeDetectedMode {
  const normalized =
    secretKey.trim();

  if (!normalized) {
    return "saved";
  }

  if (
    normalized.startsWith("sk_test_")
  ) {
    return "test";
  }

  if (
    normalized.startsWith("sk_live_")
  ) {
    return "live";
  }

  return "unknown";
}

function modeLabel(
  mode: StripeDetectedMode,
  configuredMode: unknown,
): string {
  if (mode === "test") {
    return "Modo de prueba";
  }

  if (mode === "live") {
    return "Modo de producción";
  }

  if (mode === "unknown") {
    return "Formato de clave no reconocido";
  }

  if (configuredMode === "live") {
    return "Producción guardada";
  }

  if (configuredMode === "test") {
    return "Prueba guardada";
  }

  return "Modo no identificado";
}

export function StripeIntegrationEditor({
  integration,
  onSaved,
}: StripeIntegrationEditorProps) {
  const [name, setName] =
    useState(integration.name);

  const [status, setStatus] =
    useState<IntegrationStatus>(
      integration.status,
    );

  const [isEnabled, setIsEnabled] =
    useState(
      integration.is_enabled,
    );

  const [currency, setCurrency] =
    useState(
      typeof integration.config
        .currency === "string"
        ? integration.config.currency
        : "usd",
    );

  const [
    publishableKey,
    setPublishableKey,
  ] = useState(
    typeof integration.config
      .publishable_key === "string"
      ? integration.config
          .publishable_key
      : "",
  );

  const [secretKey, setSecretKey] =
    useState("");

  const [
    webhookSecret,
    setWebhookSecret,
  ] = useState("");

  const [
    showSecrets,
    setShowSecrets,
  ] = useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setName(integration.name);
    setStatus(integration.status);
    setIsEnabled(
      integration.is_enabled,
    );
    setCurrency(
      typeof integration.config
        .currency === "string"
        ? integration.config.currency
        : "usd",
    );
    setPublishableKey(
      typeof integration.config
        .publishable_key ===
        "string"
        ? integration.config
            .publishable_key
        : "",
    );
    setSecretKey("");
    setWebhookSecret("");
  }, [integration]);

  const detectedMode = useMemo(
    () =>
      detectStripeMode(
        secretKey,
      ),
    [secretKey],
  );

  const storedMode =
    integration.config.mode;

  const effectiveMode =
    detectedMode === "test" ||
    detectedMode === "live"
      ? detectedMode
      : storedMode === "live"
        ? "live"
        : "test";

  const hasInvalidSecret =
    secretKey.trim().length > 0 &&
    detectedMode === "unknown";

  const hasPublishableMismatch =
    publishableKey.trim().length >
      0 &&
    (
      effectiveMode === "test"
        ? !publishableKey
            .trim()
            .startsWith(
              "pk_test_",
            )
        : !publishableKey
            .trim()
            .startsWith(
              "pk_live_",
            )
    );

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      name.trim().length < 2
    ) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    if (
      currency.trim().length !== 3
    ) {
      toast.error(
        "La moneda debe usar un código ISO de 3 letras, por ejemplo USD.",
      );
      return;
    }

    if (hasInvalidSecret) {
      toast.error(
        "La Secret Key debe comenzar con sk_test_ o sk_live_.",
      );
      return;
    }

    if (hasPublishableMismatch) {
      toast.error(
        `La Publishable Key no corresponde al modo ${effectiveMode}.`,
      );
      return;
    }

    if (
      secretKey.trim() &&
      effectiveMode === "live"
    ) {
      const confirmed =
        window.confirm(
          "Estás guardando una Secret Key de producción. Stripe podrá realizar operaciones reales. ¿Deseas continuar?",
        );

      if (!confirmed) {
        return;
      }
    }

    const nextConfig = {
      ...integration.config,
      mode: effectiveMode,
      currency:
        currency
          .trim()
          .toLowerCase(),
      publishable_key:
        publishableKey.trim(),
    };

    const payload:
      IntegrationConfigUpdate = {
        name: name.trim(),
        status,
        is_enabled: isEnabled,
        base_url:
          integration.base_url ??
          "https://api.stripe.com",
        config: nextConfig,
      };

    if (secretKey.trim()) {
      payload.api_key =
        secretKey.trim();
    }

    if (
      webhookSecret.trim()
    ) {
      payload.webhook_secret =
        webhookSecret.trim();
    }

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<IntegrationConfigResponse>(
          "/api/admin/integrations/stripe",
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      toast.success(
        "Integración Stripe actualizada.",
      );

      onSaved(response);
      setSecretKey("");
      setWebhookSecret("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar Stripe.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="luxia-panel rounded-3xl p-6"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
            <BadgeDollarSign
              size={21}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Pagos
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Configuración Stripe
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              La Secret Key controla realmente si Stripe
              opera en pruebas o producción. El modo
              informativo se sincroniza automáticamente
              con el prefijo de la clave.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-white/7 bg-black/20 px-4 py-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(event) =>
              setIsEnabled(
                event.target.checked,
              )
            }
            className="size-4 accent-red-700"
          />

          Integración habilitada
        </label>
      </div>

      <section
        className={
          effectiveMode === "live"
            ? "mt-6 rounded-2xl border border-red-500/20 bg-red-950/15 p-5"
            : "mt-6 rounded-2xl border border-blue-500/15 bg-blue-950/10 p-5"
        }
      >
        <div className="flex items-start gap-3">
          {effectiveMode ===
          "live" ? (
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0 text-red-400"
            />
          ) : (
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-blue-400"
            />
          )}

          <div>
            <p
              className={
                effectiveMode ===
                "live"
                  ? "font-semibold text-red-300"
                  : "font-semibold text-blue-300"
              }
            >
              {modeLabel(
                detectedMode,
                storedMode,
              )}
            </p>

            <p
              className={
                effectiveMode ===
                "live"
                  ? "mt-2 text-xs leading-6 text-red-300/75"
                  : "mt-2 text-xs leading-6 text-blue-300/75"
              }
            >
              {effectiveMode ===
              "live"
                ? "Las operaciones usarán credenciales reales cuando guardes una clave sk_live_."
                : "Las operaciones permanecerán en el entorno de pruebas con una clave sk_test_."}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Nombre
          </span>

          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Estado
          </span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as IntegrationStatus,
              )
            }
            className="h-12 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white"
          >
            <option value="enabled">
              enabled
            </option>
            <option value="disabled">
              disabled
            </option>
            <option value="error">
              error
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Moneda predeterminada
          </span>

          <input
            value={currency}
            maxLength={3}
            onChange={(event) =>
              setCurrency(
                event.target.value
                  .toLowerCase(),
              )
            }
            placeholder="usd"
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm uppercase text-white outline-none focus:border-red-500/50"
          />
        </label>
      </div>

      <section className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-white">
              Credenciales Stripe
            </h3>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Los secretos guardados no son devueltos por
              el backend. Deja los campos vacíos para
              conservarlos.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowSecrets(
                (current) =>
                  !current,
              )
            }
            className="flex size-9 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
          >
            {showSecrets ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}
          </button>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Secret Key
            </span>

            <input
              type={
                showSecrets
                  ? "text"
                  : "password"
              }
              value={secretKey}
              onChange={(event) =>
                setSecretKey(
                  event.target.value,
                )
              }
              placeholder={
                integration.api_key_configured
                  ? "Configurada; vacío para conservar"
                  : "sk_test_... o sk_live_..."
              }
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white outline-none focus:border-red-500/50"
            />

            {hasInvalidSecret && (
              <p className="mt-2 text-xs text-red-400">
                Prefijo no reconocido.
              </p>
            )}
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Publishable Key
            </span>

            <input
              type={
                showSecrets
                  ? "text"
                  : "password"
              }
              value={publishableKey}
              onChange={(event) =>
                setPublishableKey(
                  event.target.value,
                )
              }
              placeholder={
                effectiveMode ===
                "live"
                  ? "pk_live_..."
                  : "pk_test_..."
              }
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white outline-none focus:border-red-500/50"
            />

            {hasPublishableMismatch && (
              <p className="mt-2 text-xs text-red-400">
                No coincide con el modo detectado.
              </p>
            )}
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Webhook Secret
            </span>

            <input
              type={
                showSecrets
                  ? "text"
                  : "password"
              }
              value={webhookSecret}
              onChange={(event) =>
                setWebhookSecret(
                  event.target.value,
                )
              }
              placeholder={
                integration.webhook_secret_configured
                  ? "Configurado; vacío para conservar"
                  : "whsec_..."
              }
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white outline-none focus:border-red-500/50"
            />
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4 text-xs leading-6 text-amber-300/80">
        El health check actual del backend para Stripe
        valida que la configuración esté habilitada y que
        existan credenciales; no realiza una llamada real
        a la API de Stripe.
      </section>

      <div className="mt-6 flex justify-end border-t border-white/6 pt-5">
        <button
          type="submit"
          disabled={
            isSaving ||
            hasInvalidSecret ||
            hasPublishableMismatch
          }
          className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
        >
          {isSaving ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}

          Guardar Stripe
        </button>
      </div>
    </form>
  );
}
