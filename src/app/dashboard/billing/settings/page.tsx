"use client";

import {
  Building2,
  FileCheck2,
  LoaderCircle,
  PackageOpen,
  ReceiptText,
  Save,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  SystemSettingCreate,
  SystemSettingResponse,
} from "@/types/admin-system-settings";

const SETTING_DEFINITIONS = [
  {
    key: "billing_invoice_subscriptions_enabled",
    label: "Permitir facturas en suscripciones",
    description:
      "Muestra al cliente las facturas comerciales generadas por Stripe para altas y renovaciones de planes. Las suscripciones seguirán cobrando y renovándose aunque esta opción esté desactivada.",
    icon: ReceiptText,
    sortOrder: 610,
  },
  {
    key: "billing_invoice_token_packages_enabled",
    label: "Permitir facturas en paquetes de tokens",
    description:
      "Solicita a Stripe una factura comercial cuando el cliente compra uno de los paquetes de tokens configurados en el catálogo.",
    icon: PackageOpen,
    sortOrder: 620,
  },
  {
    key: "billing_invoice_custom_tokens_enabled",
    label: "Permitir facturas en compra directa",
    description:
      "Solicita a Stripe una factura comercial para las compras personalizadas de tokens, incluyendo cantidades elegidas directamente por el cliente.",
    icon: ShoppingCart,
    sortOrder: 630,
  },
] as const;

type InvoiceSettingKey = (typeof SETTING_DEFINITIONS)[number]["key"];

type SettingMap = Record<InvoiceSettingKey, SystemSettingResponse | null>;

const EMPTY_SETTINGS: SettingMap = {
  billing_invoice_subscriptions_enabled: null,
  billing_invoice_token_packages_enabled: null,
  billing_invoice_custom_tokens_enabled: null,
};

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
  }
  return Boolean(value);
}

function InvoiceSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition",
        checked
          ? "border-red-500/40 bg-red-700"
          : "border-white/10 bg-zinc-900",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "block size-6 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-7" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState<SettingMap>(EMPTY_SETTINGS);
  const [values, setValues] = useState<Record<InvoiceSettingKey, boolean>>({
    billing_invoice_subscriptions_enabled: false,
    billing_invoice_token_packages_enabled: false,
    billing_invoice_custom_tokens_enabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<InvoiceSettingKey | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const existing = await browserApiRequest<SystemSettingResponse[]>(
        "/api/admin/system-settings",
      );

      const nextSettings: SettingMap = { ...EMPTY_SETTINGS };

      for (const definition of SETTING_DEFINITIONS) {
        let setting = existing.find((item) => item.key === definition.key) ?? null;

        if (!setting) {
          const payload: SystemSettingCreate = {
            category: "billing",
            key: definition.key,
            label: definition.label,
            description: definition.description,
            value_type: "boolean",
            value: false,
            default_value: false,
            is_public: false,
            is_editable: true,
            is_sensitive: false,
            requires_restart: false,
            sort_order: definition.sortOrder,
          };

          setting = await browserApiRequest<SystemSettingResponse>(
            "/api/admin/system-settings",
            {
              method: "POST",
              body: JSON.stringify(payload),
            },
          );
        }

        nextSettings[definition.key] = setting;
      }

      setSettings(nextSettings);
      setValues({
        billing_invoice_subscriptions_enabled: toBoolean(
          nextSettings.billing_invoice_subscriptions_enabled?.value,
        ),
        billing_invoice_token_packages_enabled: toBoolean(
          nextSettings.billing_invoice_token_packages_enabled?.value,
        ),
        billing_invoice_custom_tokens_enabled: toBoolean(
          nextSettings.billing_invoice_custom_tokens_enabled?.value,
        ),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la configuración de facturación.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const enabledCount = useMemo(
    () => Object.values(values).filter(Boolean).length,
    [values],
  );

  const saveSetting = async (key: InvoiceSettingKey) => {
    const setting = settings[key];

    if (!setting) {
      toast.error("La configuración todavía no está disponible.");
      return;
    }

    setSavingKey(key);

    try {
      const updated = await browserApiRequest<SystemSettingResponse>(
        `/api/admin/system-settings/${setting.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ value: values[key] }),
        },
      );

      setSettings((current) => ({ ...current, [key]: updated }));
      setValues((current) => ({
        ...current,
        [key]: toBoolean(updated.value),
      }));
      toast.success(`${updated.label} actualizado.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la configuración.",
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <FileCheck2 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Comercial
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Configuración de facturación
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Decide qué operaciones pueden generar y mostrar facturas comerciales. Los pagos continúan funcionando aunque todas las opciones estén desactivadas.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/7 bg-black/20 px-5 py-4 text-right">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600 uppercase">
                Categorías activas
              </p>
              <strong className="mt-1 block text-2xl text-white">{enabledCount}/3</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-amber-500/15 bg-amber-950/10 p-5">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 shrink-0 text-amber-400" size={20} />
          <div>
            <h2 className="font-semibold text-amber-100">Configuración inicial segura</h2>
            <p className="mt-2 text-sm leading-6 text-amber-200/60">
              Las tres opciones se crean desactivadas. Una factura comercial de Stripe no equivale por sí sola a un CFDI válido ante el SAT. La integración fiscal mexicana podrá añadirse después sin modificar estos controles.
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="luxia-panel mt-5 flex h-56 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" size={28} />
        </section>
      ) : errorMessage ? (
        <section className="mt-5 rounded-3xl border border-red-500/15 bg-red-950/10 p-6">
          <p className="text-sm text-red-300">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadSettings()}
            className="mt-4 rounded-xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-200"
          >
            Reintentar
          </button>
        </section>
      ) : (
        <section className="mt-5 grid gap-4 xl:grid-cols-3">
          {SETTING_DEFINITIONS.map((definition) => {
            const Icon = definition.icon;
            const checked = values[definition.key];
            const isSaving = savingKey === definition.key;

            return (
              <article
                key={definition.key}
                className="luxia-panel flex min-h-[310px] flex-col rounded-3xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400">
                    <Icon size={21} />
                  </div>
                  <InvoiceSwitch
                    checked={checked}
                    disabled={Boolean(savingKey)}
                    onChange={(value) =>
                      setValues((current) => ({
                        ...current,
                        [definition.key]: value,
                      }))
                    }
                  />
                </div>

                <div className="mt-6 flex-1">
                  <h2 className="text-lg font-semibold text-white">{definition.label}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{definition.description}</p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/6 pt-5">
                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-[10px] font-semibold tracking-wider uppercase",
                      checked
                        ? "border-emerald-500/20 bg-emerald-950/15 text-emerald-400"
                        : "border-zinc-500/15 bg-zinc-950/20 text-zinc-500",
                    ].join(" ")}
                  >
                    {checked ? "Habilitada" : "Deshabilitada"}
                  </span>

                  <button
                    type="button"
                    onClick={() => void saveSetting(definition.key)}
                    disabled={Boolean(savingKey)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isSaving ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Guardar
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="luxia-panel mt-5 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-sky-500/15 bg-sky-950/10 text-sky-400">
            <Building2 size={21} />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-sky-500 uppercase">
              Preparación futura
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">Integración fiscal mexicana</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
              Estos controles separan la política comercial del proveedor fiscal. Cuando la empresa esté constituida, podrá conectarse un PAC para emitir CFDI usando RFC, razón social, régimen fiscal, código postal y uso de CFDI, sin rediseñar los flujos de pago existentes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
