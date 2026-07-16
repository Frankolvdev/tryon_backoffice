"use client";

import {
  KeyRound,
  Link2,
  LoaderCircle,
  MailCheck,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { AccountSecuritySettings } from "@/types/profile-security";

type VerificationMethod =
  | "disabled"
  | "otp"
  | "email_link"
  | "otp_and_email_link";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-5 rounded-2xl border border-white/7 bg-black/20 p-5">
      <div>
        <p className="text-sm font-medium text-white">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-600">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="size-5 shrink-0 accent-red-700"
      />
    </label>
  );
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] =
    useState<AccountSecuritySettings | null>(
      null,
    );
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSaving, setIsSaving] =
    useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const response =
        await browserApiRequest<AccountSecuritySettings>(
          "/api/admin/account-security/settings",
        );

      setSettings(response);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la configuración de seguridad.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!settings) return;

    const verificationMethod =
      settings.verification_required
        ? settings.verification_method
        : "disabled";

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<AccountSecuritySettings>(
          "/api/admin/account-security/settings",
          {
            method: "PUT",
            body: JSON.stringify({
              ...settings,
              verification_method:
                verificationMethod,
            }),
          },
        );

      setSettings(response);
      toast.success(
        "Configuración de seguridad guardada.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la configuración.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="luxia-panel flex min-h-72 items-center justify-center rounded-3xl">
        <LoaderCircle className="animate-spin text-red-500" />
      </div>
    );
  }

  const updateBoolean = (
    key: keyof AccountSecuritySettings,
    value: boolean,
  ) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  };

  const setVerificationRequired = (
    enabled: boolean,
  ) => {
    setSettings((current) => {
      if (!current) return current;

      return {
        ...current,
        verification_required: enabled,
        verification_method: enabled
          ? current.verification_method ===
            "disabled"
            ? "otp_and_email_link"
            : current.verification_method
          : "disabled",
      };
    });
  };

  const setVerificationMethod = (
    method: VerificationMethod,
  ) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            verification_required:
              method !== "disabled",
            verification_method: method,
          }
        : current,
    );
  };

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
            <ShieldCheck size={24} />
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Seguridad
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-white">
              Métodos de autenticación
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
              Configura por separado la protección del
              BackOffice y la verificación de cuentas del
              futuro frontend de usuarios.
            </p>
          </div>
        </div>
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <KeyRound
            size={20}
            className="mt-0.5 text-red-400"
          />

          <div>
            <h2 className="font-semibold text-white">
              Administradores y trabajadores
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Controla el código MFA solicitado al iniciar
              sesión en el BackOffice. Usa la aplicación
              autenticadora que ya funcionaba antes.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Toggle
            label="Exigir MFA en el BackOffice"
            description="Activado: después de correo y contraseña se solicita el código de la aplicación autenticadora. Desactivado: se entra únicamente con correo y contraseña."
            checked={
              settings.admin_mfa_required
            }
            onChange={(value) =>
              updateBoolean(
                "admin_mfa_required",
                value,
              )
            }
          />
        </div>

        <div className="mt-4 rounded-2xl border border-blue-500/10 bg-blue-950/10 p-4">
          <p className="text-xs leading-6 text-blue-300/75">
            Desactivar esta opción no elimina el secreto MFA
            ya configurado. Al volver a activarla, el
            administrador podrá usar nuevamente su código
            actual.
          </p>
        </div>
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <MailCheck
            size={20}
            className="mt-0.5 text-red-400"
          />

          <div>
            <h2 className="font-semibold text-white">
              Usuarios finales
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Define cómo verificarán su cuenta al
              registrarse en el futuro frontend. Esto es
              independiente del MFA del BackOffice.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Toggle
            label="Exigir verificación de cuenta"
            description="Obliga al usuario a verificar su correo mediante el método seleccionado."
            checked={
              settings.verification_required
            }
            onChange={
              setVerificationRequired
            }
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            {
              value: "otp" as const,
              title: "Código OTP",
              description:
                "Envía un código numérico al correo del usuario.",
              icon: KeyRound,
            },
            {
              value: "email_link" as const,
              title: "Enlace por email",
              description:
                "Envía un enlace de verificación al correo.",
              icon: Link2,
            },
            {
              value:
                "otp_and_email_link" as const,
              title: "OTP y enlace",
              description:
                "El mensaje contiene ambos métodos y el usuario puede usar cualquiera.",
              icon: MailCheck,
            },
            {
              value: "disabled" as const,
              title: "Deshabilitada",
              description:
                "Permite crear la cuenta sin verificación de correo.",
              icon: ShieldCheck,
            },
          ].map((option) => {
            const Icon = option.icon;
            const selected =
              settings.verification_method ===
              option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setVerificationMethod(
                    option.value,
                  )
                }
                className={
                  selected
                    ? "rounded-2xl border border-red-500/25 bg-red-950/20 p-5 text-left"
                    : "rounded-2xl border border-white/7 bg-black/20 p-5 text-left hover:border-white/12"
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={
                      selected
                        ? "text-red-400"
                        : "text-zinc-600"
                    }
                  />

                  <p
                    className={
                      selected
                        ? "text-sm font-semibold text-red-300"
                        : "text-sm font-semibold text-white"
                    }
                  >
                    {option.title}
                  </p>
                </div>

                <p className="mt-3 text-xs leading-5 text-zinc-600">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        {settings.verification_required && (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label>
              <span className="mb-2 block text-xs text-zinc-600">
                Expiración OTP (minutos)
              </span>

              <input
                type="number"
                min={1}
                max={1440}
                value={
                  settings.otp_expiration_minutes
                }
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    otp_expiration_minutes:
                      Number(
                        event.target.value,
                      ),
                  })
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs text-zinc-600">
                Intentos máximos
              </span>

              <input
                type="number"
                min={1}
                max={50}
                value={
                  settings.otp_max_attempts
                }
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    otp_max_attempts:
                      Number(
                        event.target.value,
                      ),
                  })
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs text-zinc-600">
                Expiración del enlace (minutos)
              </span>

              <input
                type="number"
                min={1}
                max={10080}
                value={
                  settings.email_link_expiration_minutes
                }
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    email_link_expiration_minutes:
                      Number(
                        event.target.value,
                      ),
                  })
                }
                className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
              />
            </label>
          </div>
        )}
      </section>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving}
          className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}

          Guardar configuración
        </button>
      </div>
    </div>
  );
}
