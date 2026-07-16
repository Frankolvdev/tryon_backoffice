"use client";

import { LoaderCircle, Save, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type { AccountSecuritySettings } from "@/types/profile-security";

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
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-600">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-red-700"
      />
    </label>
  );
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<AccountSecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setSettings(
        await browserApiRequest<AccountSecuritySettings>(
          "/api/admin/account-security/settings",
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible cargar seguridad.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!settings) return;

    if (settings.admin_mfa_required && !settings.admin_mfa_totp_enabled) {
      toast.error("No puedes exigir MFA administrativo sin habilitar TOTP.");
      return;
    }

    if (
      settings.user_mfa_required &&
      (!settings.user_mfa_available || !settings.user_mfa_totp_enabled)
    ) {
      toast.error("Para exigir MFA a usuarios debes habilitarlo y permitir TOTP.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await browserApiRequest<AccountSecuritySettings>(
        "/api/admin/account-security/settings",
        {
          method: "PUT",
          body: JSON.stringify(settings),
        },
      );
      setSettings(updated);
      toast.success("Configuración de seguridad guardada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible guardar seguridad.");
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

  const update = (key: keyof AccountSecuritySettings, value: boolean) =>
    setSettings((current) => (current ? { ...current, [key]: value } : current));

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="luxia-red-glow flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Sistema
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Autenticación multifactor
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
              Configura por separado el BackOffice y las cuentas de usuarios finales.
            </p>
          </div>
        </div>
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <h2 className="font-semibold text-white">BackOffice</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Se aplica a administradores y trabajadores con acceso administrativo.
        </p>

        <div className="mt-5 grid gap-3">
          <Toggle
            label="Exigir MFA"
            description="Obliga a configurar y usar MFA para acceder al BackOffice."
            checked={settings.admin_mfa_required}
            onChange={(value) => update("admin_mfa_required", value)}
          />
          <Toggle
            label="Permitir TOTP"
            description="Aplicaciones como Google Authenticator, Microsoft Authenticator o Authy."
            checked={settings.admin_mfa_totp_enabled}
            onChange={(value) => update("admin_mfa_totp_enabled", value)}
          />
          <Toggle
            label="Códigos de recuperación"
            description="Permite códigos de emergencia de un solo uso."
            checked={settings.admin_mfa_recovery_codes_enabled}
            onChange={(value) => update("admin_mfa_recovery_codes_enabled", value)}
          />
        </div>
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <h2 className="font-semibold text-white">Usuarios finales</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Se aplicará al frontend de clientes cuando se integre el flujo de MFA.
        </p>

        <div className="mt-5 grid gap-3">
          <Toggle
            label="MFA disponible"
            description="Permite que los usuarios finales activen MFA voluntariamente."
            checked={settings.user_mfa_available}
            onChange={(value) => update("user_mfa_available", value)}
          />
          <Toggle
            label="Exigir MFA"
            description="Obliga a todos los usuarios finales a configurar MFA."
            checked={settings.user_mfa_required}
            onChange={(value) => update("user_mfa_required", value)}
          />
          <Toggle
            label="Permitir TOTP"
            description="Habilita aplicaciones autenticadoras para usuarios finales."
            checked={settings.user_mfa_totp_enabled}
            onChange={(value) => update("user_mfa_totp_enabled", value)}
          />
          <Toggle
            label="Códigos de recuperación"
            description="Permite códigos de emergencia de un solo uso."
            checked={settings.user_mfa_recovery_codes_enabled}
            onChange={(value) => update("user_mfa_recovery_codes_enabled", value)}
          />
        </div>
      </section>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving}
          className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
