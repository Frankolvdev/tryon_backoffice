"use client";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  Save,
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
  getIntegrationCatalogItem,
} from "@/lib/integrations/catalog";

import type {
  IntegrationConfigResponse,
  IntegrationConfigUpdate,
  IntegrationProvider,
  IntegrationStatus,
} from "@/types/admin-integrations";

interface IntegrationEditorProps {
  integration: IntegrationConfigResponse;
  onSaved: (
    integration: IntegrationConfigResponse,
  ) => void;
}

interface ConfigField {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "boolean";
}

const providerFields: Partial<
  Record<IntegrationProvider, ConfigField[]>
> = {
  comfyui: [
    {
      key: "mode",
      label: "Modo",
      placeholder: "local",
    },
    {
      key: "workflows_dir",
      label: "Directorio de workflows",
      placeholder: "workflows",
    },
    {
      key: "poll_timeout_seconds",
      label: "Timeout de polling (segundos)",
      type: "number",
    },
    {
      key: "poll_interval_seconds",
      label: "Intervalo de polling (segundos)",
      type: "number",
    },
    {
      key: "person_image_node_id",
      label: "Nodo de imagen de persona",
    },
    {
      key: "item_image_node_id",
      label: "Nodo de imagen de artículo",
    },
    {
      key: "prompt_node_id",
      label: "Nodo de prompt",
    },
  ],
  runpod: [
    {
      key: "mode",
      label: "Modo",
      placeholder: "serverless",
    },
    {
      key: "default_timeout_seconds",
      label: "Timeout predeterminado (segundos)",
      type: "number",
    },
  ],
  s3: [
    {
      key: "bucket",
      label: "Bucket",
    },
    {
      key: "region",
      label: "Región",
      placeholder: "us-east-1 o auto",
    },
    {
      key: "endpoint_url",
      label: "Endpoint URL",
      placeholder:
        "Vacío para Amazon S3",
    },
    {
      key: "cdn_base_url",
      label: "CDN Base URL",
      placeholder: "Opcional",
    },
  ],
};

function stringifyValue(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return JSON.stringify(value);
  }

  return String(value);
}

export function IntegrationEditor({
  integration,
  onSaved,
}: IntegrationEditorProps) {
  const catalog =
    getIntegrationCatalogItem(
      integration.provider,
    );

  const fields = useMemo(
    () =>
      providerFields[
        integration.provider
      ] ?? [],
    [integration.provider],
  );

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

  const [baseUrl, setBaseUrl] =
    useState(
      integration.base_url ?? "",
    );

  const [apiKey, setApiKey] =
    useState("");

  const [apiSecret, setApiSecret] =
    useState("");

  const [
    webhookSecret,
    setWebhookSecret,
  ] = useState("");

  const [
    showSecrets,
    setShowSecrets,
  ] = useState(false);

  const [config, setConfig] =
    useState<Record<string, string>>(
      {},
    );

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setName(integration.name);
    setStatus(integration.status);
    setIsEnabled(
      integration.is_enabled,
    );
    setBaseUrl(
      integration.base_url ?? "",
    );
    setApiKey("");
    setApiSecret("");
    setWebhookSecret("");

    const nextConfig:
      Record<string, string> = {};

    for (const field of fields) {
      nextConfig[field.key] =
        stringifyValue(
          integration.config[
            field.key
          ],
        );
    }

    setConfig(nextConfig);
  }, [fields, integration]);

  const updateConfigValue = (
    key: string,
    value: string,
  ) => {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const buildConfig =
    (): Record<string, unknown> => {
      const next = {
        ...integration.config,
      };

      for (const field of fields) {
        const raw =
          config[field.key] ?? "";

        if (field.type === "number") {
          const numeric =
            Number(raw);

          next[field.key] =
            raw.trim() &&
            Number.isFinite(numeric)
              ? numeric
              : 0;
          continue;
        }

        if (field.type === "boolean") {
          next[field.key] =
            raw === "true";
          continue;
        }

        next[field.key] =
          raw.trim();
      }

      return next;
    };

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    const payload:
      IntegrationConfigUpdate = {
        name: name.trim(),
        status,
        is_enabled: isEnabled,
        base_url:
          baseUrl.trim() || null,
        config: buildConfig(),
      };

    if (apiKey.trim()) {
      payload.api_key =
        apiKey.trim();
    }

    if (apiSecret.trim()) {
      payload.api_secret =
        apiSecret.trim();
    }

    if (webhookSecret.trim()) {
      payload.webhook_secret =
        webhookSecret.trim();
    }

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<IntegrationConfigResponse>(
          `/api/admin/integrations/${integration.provider}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      toast.success(
        `${catalog.label} actualizado.`,
      );

      onSaved(response);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la integración.",
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Configuración global
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            {catalog.label}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            {catalog.description}
          </p>
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
          Habilitada
        </label>
      </div>

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
            URL base
          </span>

          <input
            value={baseUrl}
            onChange={(event) =>
              setBaseUrl(
                event.target.value,
              )
            }
            placeholder="https://..."
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        {fields.map((field) => (
          <label key={field.key}>
            <span className="mb-2 block text-sm text-zinc-500">
              {field.label}
            </span>

            <input
              type={
                field.type === "number"
                  ? "number"
                  : "text"
              }
              value={
                config[field.key] ?? ""
              }
              onChange={(event) =>
                updateConfigValue(
                  field.key,
                  event.target.value,
                )
              }
              placeholder={
                field.placeholder
              }
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
            />
          </label>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-white">
              Credenciales
            </h3>

            <p className="mt-1 text-xs text-zinc-600">
              Los secretos existentes nunca son
              devueltos por el backend.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowSecrets(
                (current) => !current,
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

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            {
              label: "API Key",
              value: apiKey,
              setValue: setApiKey,
              configured:
                integration.api_key_configured,
            },
            {
              label: "API Secret",
              value: apiSecret,
              setValue: setApiSecret,
              configured:
                integration.api_secret_configured,
            },
            {
              label: "Webhook Secret",
              value: webhookSecret,
              setValue:
                setWebhookSecret,
              configured:
                integration.webhook_secret_configured,
            },
          ].map((field) => (
            <label key={field.label}>
              <span className="mb-2 block text-sm text-zinc-500">
                {field.label}
              </span>

              <input
                type={
                  showSecrets
                    ? "text"
                    : "password"
                }
                value={field.value}
                onChange={(event) =>
                  field.setValue(
                    event.target.value,
                  )
                }
                placeholder={
                  field.configured
                    ? "Configurado; déjalo vacío para conservarlo"
                    : "Sin configurar"
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="mt-6 flex justify-end border-t border-white/6 pt-5">
        <button
          type="submit"
          disabled={isSaving}
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

          Guardar integración
        </button>
      </div>
    </form>
  );
}
