"use client";

import { LoaderCircle, Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";
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

type LocalePreset = {
  code: string;
  name: string;
  nativeName: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
};

const LOCALE_PRESETS: LocalePreset[] = [
  {
    code: "es-MX",
    name: "Spanish (Mexico)",
    nativeName: "Español (México)",
    currency: "MXN",
    timezone: "America/Mexico_City",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
  },
  {
    code: "es-ES",
    name: "Spanish (Spain)",
    nativeName: "Español (España)",
    currency: "EUR",
    timezone: "Europe/Madrid",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
  },
  {
    code: "en-US",
    name: "English (United States)",
    nativeName: "English (United States)",
    currency: "USD",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "hh:mm A",
  },
  {
    code: "en-GB",
    name: "English (United Kingdom)",
    nativeName: "English (United Kingdom)",
    currency: "GBP",
    timezone: "Europe/London",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
  },
  {
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    nativeName: "Português (Brasil)",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
  },
  {
    code: "fr-FR",
    name: "French (France)",
    nativeName: "Français (France)",
    currency: "EUR",
    timezone: "Europe/Paris",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
  },
  {
    code: "de-DE",
    name: "German (Germany)",
    nativeName: "Deutsch (Deutschland)",
    currency: "EUR",
    timezone: "Europe/Berlin",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "HH:mm",
  },
  {
    code: "it-IT",
    name: "Italian (Italy)",
    nativeName: "Italiano (Italia)",
    currency: "EUR",
    timezone: "Europe/Rome",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
  },
  {
    code: "ja-JP",
    name: "Japanese (Japan)",
    nativeName: "日本語（日本）",
    currency: "JPY",
    timezone: "Asia/Tokyo",
    dateFormat: "YYYY/MM/DD",
    timeFormat: "HH:mm",
  },
  {
    code: "ko-KR",
    name: "Korean (South Korea)",
    nativeName: "한국어 (대한민국)",
    currency: "KRW",
    timezone: "Asia/Seoul",
    dateFormat: "YYYY.MM.DD",
    timeFormat: "HH:mm",
  },
];

const CURRENCY_OPTIONS = [
  ["MXN", "Peso mexicano"],
  ["USD", "Dólar estadounidense"],
  ["EUR", "Euro"],
  ["GBP", "Libra esterlina"],
  ["BRL", "Real brasileño"],
  ["CAD", "Dólar canadiense"],
  ["JPY", "Yen japonés"],
  ["KRW", "Won surcoreano"],
  ["ARS", "Peso argentino"],
  ["COP", "Peso colombiano"],
] as const;

const TIMEZONE_OPTIONS = [
  ["UTC", "UTC"],
  ["America/Mexico_City", "Ciudad de México"],
  ["America/Cancun", "Cancún"],
  ["America/Tijuana", "Tijuana"],
  ["America/Chihuahua", "Chihuahua"],
  ["America/New_York", "Nueva York"],
  ["America/Chicago", "Chicago"],
  ["America/Denver", "Denver"],
  ["America/Los_Angeles", "Los Ángeles"],
  ["America/Toronto", "Toronto"],
  ["America/Bogota", "Bogotá"],
  ["America/Lima", "Lima"],
  ["America/Argentina/Buenos_Aires", "Buenos Aires"],
  ["America/Sao_Paulo", "São Paulo"],
  ["Europe/London", "Londres"],
  ["Europe/Madrid", "Madrid"],
  ["Europe/Paris", "París"],
  ["Europe/Berlin", "Berlín"],
  ["Europe/Rome", "Roma"],
  ["Asia/Tokyo", "Tokio"],
  ["Asia/Seoul", "Seúl"],
  ["Asia/Shanghai", "Shanghái"],
  ["Asia/Dubai", "Dubái"],
  ["Australia/Sydney", "Sídney"],
] as const;

const DATE_FORMAT_OPTIONS = [
  ["DD/MM/YYYY", "Día/mes/año · 31/12/2026"],
  ["MM/DD/YYYY", "Mes/día/año · 12/31/2026"],
  ["YYYY-MM-DD", "ISO · 2026-12-31"],
  ["YYYY/MM/DD", "Año/mes/día · 2026/12/31"],
  ["DD.MM.YYYY", "Día.mes.año · 31.12.2026"],
  ["YYYY.MM.DD", "Año.mes.día · 2026.12.31"],
] as const;

const TIME_FORMAT_OPTIONS = [
  ["HH:mm", "24 horas · 18:30"],
  ["hh:mm A", "12 horas · 06:30 PM"],
] as const;

const selectClassName =
  "h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300";
const inputClassName =
  "h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white";

export function LocaleEditorDialog({
  locale,
  locales,
  onClose,
  onSaved,
}: Props) {
  const editing = locale !== null;
  const [code, setCode] = useState(locale?.code ?? "");
  const [name, setName] = useState(locale?.name ?? "");
  const [nativeName, setNativeName] = useState(locale?.native_name ?? "");
  const [fallback, setFallback] = useState(
    locale?.fallback_locale_code ?? "",
  );
  const [currency, setCurrency] = useState(
    locale?.currency_code ?? "USD",
  );
  const [timezone, setTimezone] = useState(locale?.timezone ?? "UTC");
  const [dateFormat, setDateFormat] = useState(
    locale?.date_format ?? "YYYY-MM-DD",
  );
  const [timeFormat, setTimeFormat] = useState(
    locale?.time_format ?? "HH:mm",
  );
  const [isActive, setIsActive] = useState(locale?.is_active ?? true);
  const [isDefault, setIsDefault] = useState(locale?.is_default ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const applyPreset = (nextCode: string) => {
    setCode(nextCode);
    const preset = LOCALE_PRESETS.find((item) => item.code === nextCode);
    if (!preset) return;

    setName(preset.name);
    setNativeName(preset.nativeName);
    setCurrency(preset.currency);
    setTimezone(preset.timezone);
    setDateFormat(preset.dateFormat);
    setTimeFormat(preset.timeFormat);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (code.trim().length < 2 || !name.trim() || !nativeName.trim()) {
      toast.error("Código, nombre y nombre nativo son obligatorios.");
      return;
    }

    const shared = {
      name: name.trim(),
      native_name: nativeName.trim(),
      fallback_locale_code: fallback || null,
      currency_code: currency,
      timezone,
      date_format: dateFormat,
      time_format: timeFormat,
      is_active: isActive,
      is_default: isDefault,
    };

    const payload: I18nLocaleCreate | I18nLocaleUpdate = editing
      ? shared
      : {
          code: code.trim(),
          ...shared,
        };

    setIsSaving(true);
    try {
      const saved = await browserApiRequest<I18nLocale>(
        editing
          ? `/api/admin/i18n/locales/${encodeURIComponent(locale.code)}`
          : "/api/admin/i18n/locales",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      onSaved(saved);
      toast.success(editing ? "Idioma actualizado." : "Idioma creado.");
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
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-white/6 bg-[#09090a]/95 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Internacionalización
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {editing ? `Editar ${locale.code}` : "Nuevo idioma"}
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
              Idioma y región
            </span>
            {editing ? (
              <input
                value={code}
                disabled
                className={`${inputClassName} font-mono disabled:opacity-50`}
              />
            ) : (
              <select
                value={code}
                onChange={(event) => applyPreset(event.target.value)}
                className={selectClassName}
                required
              >
                <option value="">Selecciona un idioma</option>
                {LOCALE_PRESETS.map((preset) => (
                  <option key={preset.code} value={preset.code}>
                    {preset.code} · {preset.nativeName}
                  </option>
                ))}
              </select>
            )}
            <span className="mt-2 block text-xs leading-5 text-zinc-700">
              Al seleccionarlo se completan automáticamente sus valores regionales.
            </span>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Idioma de respaldo
            </span>
            <select
              value={fallback}
              onChange={(event) => setFallback(event.target.value)}
              className={selectClassName}
            >
              <option value="">Sin respaldo</option>
              {locales
                .filter((item) => item.code !== locale?.code)
                .map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} · {item.name}
                  </option>
                ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">Nombre</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Spanish (Mexico)"
              className={inputClassName}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Nombre nativo
            </span>
            <input
              value={nativeName}
              onChange={(event) => setNativeName(event.target.value)}
              placeholder="Español (México)"
              className={inputClassName}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">Moneda</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className={`${selectClassName} font-mono`}
            >
              {CURRENCY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {value} · {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Zona horaria
            </span>
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className={selectClassName}
            >
              {!TIMEZONE_OPTIONS.some(([value]) => value === timezone) && (
                <option value={timezone}>{timezone}</option>
              )}
              {TIMEZONE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label} · {value}
                </option>
              ))}
            </select>
            <span className="mt-2 block text-xs leading-5 text-zinc-700">
              Solo se envían identificadores IANA válidos al backend.
            </span>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Formato de fecha
            </span>
            <select
              value={dateFormat}
              onChange={(event) => setDateFormat(event.target.value)}
              className={`${selectClassName} font-mono`}
            >
              {!DATE_FORMAT_OPTIONS.some(([value]) => value === dateFormat) && (
                <option value={dateFormat}>{dateFormat}</option>
              )}
              {DATE_FORMAT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Formato de hora
            </span>
            <select
              value={timeFormat}
              onChange={(event) => setTimeFormat(event.target.value)}
              className={`${selectClassName} font-mono`}
            >
              {!TIME_FORMAT_OPTIONS.some(([value]) => value === timeFormat) && (
                <option value={timeFormat}>{timeFormat}</option>
              )}
              {TIME_FORMAT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 px-6 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Idioma activo
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="accent-red-700"
            />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Idioma predeterminado
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
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
              <LoaderCircle size={16} className="animate-spin" />
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
