"use client";

import {
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  I18nLocale,
  I18nLocaleCreate,
  I18nLocaleUpdate,
} from "@/types/admin-i18n";

interface Props {
  locale: I18nLocale | null;
  locales: I18nLocale[];
  onClose: () => void;
  onSaved: (locale: I18nLocale) => void;
}

export function LocaleEditorDialog({
  locale,
  locales,
  onClose,
  onSaved,
}: Props) {
  const editing = locale !== null;

  const [code, setCode] =
    useState(locale?.code ?? "");
  const [name, setName] =
    useState(locale?.name ?? "");
  const [nativeName, setNativeName] =
    useState(locale?.native_name ?? "");
  const [fallback, setFallback] =
    useState(
      locale?.fallback_locale_code ?? "",
    );
  const [currency, setCurrency] =
    useState(
      locale?.currency_code ?? "USD",
    );
  const [timezone, setTimezone] =
    useState(locale?.timezone ?? "UTC");
  const [dateFormat, setDateFormat] =
    useState(
      locale?.date_format ??
        "YYYY-MM-DD",
    );
  const [timeFormat, setTimeFormat] =
    useState(
      locale?.time_format ?? "HH:mm",
    );
  const [isActive, setIsActive] =
    useState(locale?.is_active ?? true);
  const [isDefault, setIsDefault] =
    useState(locale?.is_default ?? false);
  const [isSaving, setIsSaving] =
    useState(false);

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (
      code.trim().length < 2 ||
      !name.trim() ||
      !nativeName.trim()
    ) {
      toast.error(
        "Código, nombre y nombre nativo son obligatorios.",
      );
      return;
    }

    const shared = {
      name: name.trim(),
      native_name:
        nativeName.trim(),
      fallback_locale_code:
        fallback || null,
      currency_code:
        currency.trim().toUpperCase(),
      timezone: timezone.trim(),
      date_format:
        dateFormat.trim(),
      time_format:
        timeFormat.trim(),
      is_active: isActive,
      is_default: isDefault,
    };

    const payload:
      | I18nLocaleCreate
      | I18nLocaleUpdate = editing
      ? shared
      : {
          code: code.trim(),
          ...shared,
        };

    setIsSaving(true);

    try {
      const saved =
        await browserApiRequest<I18nLocale>(
          editing
            ? `/api/admin/i18n/locales/${encodeURIComponent(
                locale.code,
              )}`
            : "/api/admin/i18n/locales",
          {
            method: editing
              ? "PUT"
              : "POST",
            body: JSON.stringify(
              payload,
            ),
          },
        );

      onSaved(saved);
      toast.success(
        editing
          ? "Idioma actualizado."
          : "Idioma creado.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el idioma.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="luxia-panel max-h-[94vh] w-full max-w-4xl overflow-auto rounded-3xl"
      >
        <header className="sticky top-0 flex items-start justify-between border-b border-white/6 bg-[#09090a]/95 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Internacionalización
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {editing
                ? `Editar ${locale.code}`
                : "Nuevo idioma"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500"
          >
            <X size={17} />
          </button>
        </header>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Código
            </span>
            <input
              value={code}
              disabled={editing}
              onChange={(event) =>
                setCode(event.target.value)
              }
              placeholder="es-MX"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white disabled:opacity-50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Idioma de respaldo
            </span>
            <select
              value={fallback}
              onChange={(event) =>
                setFallback(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              <option value="">
                Sin respaldo
              </option>
              {locales
                .filter(
                  (item) =>
                    item.code !==
                    locale?.code,
                )
                .map((item) => (
                  <option
                    key={item.code}
                    value={item.code}
                  >
                    {item.code} ·{" "}
                    {item.name}
                  </option>
                ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Nombre
            </span>
            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Spanish (Mexico)"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Nombre nativo
            </span>
            <input
              value={nativeName}
              onChange={(event) =>
                setNativeName(
                  event.target.value,
                )
              }
              placeholder="Español (México)"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Moneda
            </span>
            <input
              value={currency}
              onChange={(event) =>
                setCurrency(
                  event.target.value,
                )
              }
              maxLength={10}
              placeholder="MXN"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Zona horaria
            </span>
            <input
              value={timezone}
              onChange={(event) =>
                setTimezone(
                  event.target.value,
                )
              }
              placeholder="America/Mexico_City"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Formato de fecha
            </span>
            <input
              value={dateFormat}
              onChange={(event) =>
                setDateFormat(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Formato de hora
            </span>
            <input
              value={timeFormat}
              onChange={(event) =>
                setTimeFormat(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white"
            />
          </label>
        </div>

        <div className="grid gap-4 px-6 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Idioma activo
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target.checked,
                )
              }
              className="accent-red-700"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Idioma predeterminado
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(event) =>
                setIsDefault(
                  event.target.checked,
                )
              }
              className="accent-red-700"
            />
          </label>
        </div>

        <footer className="sticky bottom-0 mt-6 flex justify-end border-t border-white/6 bg-[#09090a]/95 p-5">
          <button
            type="submit"
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
            Guardar idioma
          </button>
        </footer>
      </form>
    </div>
  );
}
