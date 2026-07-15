"use client";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
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

interface SmtpIntegrationEditorProps {
  integration: IntegrationConfigResponse;
  onSaved: (
    integration: IntegrationConfigResponse,
  ) => void;
}

function readString(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string"
    ? value
    : fallback;
}

function readNumber(
  value: unknown,
  fallback: number,
): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

function readBoolean(
  value: unknown,
  fallback: boolean,
): boolean {
  return typeof value === "boolean"
    ? value
    : fallback;
}

export function SmtpIntegrationEditor({
  integration,
  onSaved,
}: SmtpIntegrationEditorProps) {
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

  const [host, setHost] =
    useState(
      readString(
        integration.config.host,
      ),
    );

  const [port, setPort] =
    useState(
      String(
        readNumber(
          integration.config.port,
          587,
        ),
      ),
    );

  const [useTls, setUseTls] =
    useState(
      readBoolean(
        integration.config.use_tls,
        true,
      ),
    );

  const [fromEmail, setFromEmail] =
    useState(
      readString(
        integration.config.from_email,
      ),
    );

  const [fromName, setFromName] =
    useState(
      readString(
        integration.config.from_name,
        "AI Try-On Platform",
      ),
    );

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showSecrets, setShowSecrets] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setName(integration.name);
    setStatus(integration.status);
    setIsEnabled(
      integration.is_enabled,
    );
    setHost(
      readString(
        integration.config.host,
      ),
    );
    setPort(
      String(
        readNumber(
          integration.config.port,
          587,
        ),
      ),
    );
    setUseTls(
      readBoolean(
        integration.config.use_tls,
        true,
      ),
    );
    setFromEmail(
      readString(
        integration.config.from_email,
      ),
    );
    setFromName(
      readString(
        integration.config.from_name,
        "AI Try-On Platform",
      ),
    );
    setUsername("");
    setPassword("");
  }, [integration]);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const parsedPort =
      Number.parseInt(port, 10);

    if (name.trim().length < 2) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    if (!host.trim()) {
      toast.error(
        "Ingresa el host SMTP.",
      );
      return;
    }

    if (
      !Number.isInteger(parsedPort) ||
      parsedPort < 1 ||
      parsedPort > 65535
    ) {
      toast.error(
        "El puerto SMTP debe estar entre 1 y 65535.",
      );
      return;
    }

    if (
      !fromEmail.trim() ||
      !fromEmail.includes("@")
    ) {
      toast.error(
        "Ingresa un correo remitente válido.",
      );
      return;
    }

    if (!fromName.trim()) {
      toast.error(
        "Ingresa el nombre del remitente.",
      );
      return;
    }

    const payload:
      IntegrationConfigUpdate = {
        name: name.trim(),
        status,
        is_enabled: isEnabled,
        base_url: null,
        config: {
          ...integration.config,
          host: host.trim(),
          port: parsedPort,
          use_tls: useTls,
          from_email:
            fromEmail.trim(),
          from_name:
            fromName.trim(),
        },
      };

    if (username.trim()) {
      payload.api_key =
        username.trim();
    }

    if (password.trim()) {
      payload.api_secret =
        password;
    }

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<IntegrationConfigResponse>(
          "/api/admin/integrations/smtp",
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      toast.success(
        "Integración SMTP actualizada.",
      );

      onSaved(response);
      setUsername("");
      setPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar SMTP.",
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
            <Mail size={21} />
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Comunicaciones
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Configuración SMTP
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              El backend utiliza esta integración para
              conectarse al servidor SMTP y enviar correos
              transaccionales.
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
            Host SMTP
          </span>

          <input
            value={host}
            onChange={(event) =>
              setHost(
                event.target.value,
              )
            }
            placeholder="smtp.example.com"
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Puerto
          </span>

          <input
            type="number"
            min={1}
            max={65535}
            value={port}
            onChange={(event) =>
              setPort(
                event.target.value,
              )
            }
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Correo remitente
          </span>

          <input
            type="email"
            value={fromEmail}
            onChange={(event) =>
              setFromEmail(
                event.target.value,
              )
            }
            placeholder="no-reply@example.com"
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Nombre remitente
          </span>

          <input
            value={fromName}
            onChange={(event) =>
              setFromName(
                event.target.value,
              )
            }
            placeholder="AI Try-On Platform"
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={useTls}
          onChange={(event) =>
            setUseTls(
              event.target.checked,
            )
          }
          className="size-4 accent-red-700"
        />

        Usar STARTTLS
      </label>

      <section className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-white">
              Credenciales SMTP
            </h3>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              El username se guarda como API Key y la
              contraseña como API Secret. Los valores
              existentes nunca son devueltos.
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

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Username
            </span>

            <input
              type={
                showSecrets
                  ? "text"
                  : "password"
              }
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value,
                )
              }
              placeholder={
                integration.api_key_configured
                  ? "Configurado; vacío para conservar"
                  : "Usuario SMTP"
              }
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Contraseña
            </span>

            <input
              type={
                showSecrets
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder={
                integration.api_secret_configured
                  ? "Configurada; vacío para conservar"
                  : "Contraseña SMTP"
              }
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
            />
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-blue-500/10 bg-blue-950/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-blue-400"
          />

          <p className="text-xs leading-6 text-blue-300/80">
            El health check SMTP sí realiza una conexión
            real al servidor, inicia STARTTLS cuando está
            habilitado e intenta autenticar con el username
            y la contraseña configurados.
          </p>
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

          Guardar SMTP
        </button>
      </div>
    </form>
  );
}
