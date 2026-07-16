"use client";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  SystemSettingResponse,
  SystemSettingUpdate,
} from "@/types/admin-system-settings";

interface SystemSettingCardProps {
  setting: SystemSettingResponse;
  onSaved: (setting: SystemSettingResponse) => void;
}

function serializeValue(
  value: unknown,
  valueType: string,
): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    valueType === "json" ||
    typeof value === "object"
  ) {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function parseValue(
  value: string,
  valueType: string,
): unknown {
  if (valueType === "boolean") {
    return value === "true";
  }

  if (valueType === "integer") {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed)) {
      throw new Error(
        "El valor debe ser un número entero.",
      );
    }

    return parsed;
  }

  if (valueType === "float") {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw new Error(
        "El valor debe ser numérico.",
      );
    }

    return parsed;
  }

  if (valueType === "json") {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(
        "El contenido JSON no tiene un formato válido.",
      );
    }
  }

  return value;
}

function SettingSwitch({
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
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition",
        checked
          ? "border-red-500/30 bg-red-700"
          : "border-white/10 bg-zinc-900",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked
            ? "translate-x-6"
            : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export function SystemSettingCard({
  setting,
  onSaved,
}: SystemSettingCardProps) {
  const [value, setValue] = useState(
    serializeValue(
      setting.value,
      setting.value_type,
    ),
  );
  const [showSensitive, setShowSensitive] =
    useState(false);
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setValue(
      serializeValue(
        setting.value,
        setting.value_type,
      ),
    );
  }, [setting]);

  const defaultSerialized = useMemo(
    () =>
      serializeValue(
        setting.default_value,
        setting.value_type,
      ),
    [
      setting.default_value,
      setting.value_type,
    ],
  );

  const isBoolean =
    setting.value_type === "boolean";
  const isNumeric =
    setting.value_type === "integer" ||
    setting.value_type === "float";
  const booleanValue = value === "true";

  const resetToDefault = () => {
    setValue(defaultSerialized);
  };

  const save = async () => {
    if (!setting.is_editable) {
      toast.error(
        "Esta configuración no es editable.",
      );
      return;
    }

    let parsedValue: unknown;

    try {
      parsedValue = parseValue(
        value,
        setting.value_type,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "El valor no es válido.",
      );
      return;
    }

    const payload: SystemSettingUpdate = {
      value: parsedValue,
    };

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<SystemSettingResponse>(
          `/api/admin/system-settings/${setting.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );

      toast.success(
        `${setting.label} actualizado.`,
      );
      onSaved(response);
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

  const inputType =
    setting.is_sensitive && !showSensitive
      ? "password"
      : isNumeric
        ? "number"
        : "text";

  return (
    <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-white">
            {setting.label}
          </p>

          <p className="mt-1 break-all font-mono text-[11px] text-zinc-700">
            {setting.key}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {setting.is_public && (
            <span className="rounded-full border border-sky-500/15 bg-sky-950/10 px-2 py-1 text-[9px] font-semibold tracking-wider text-sky-400">
              PÚBLICA
            </span>
          )}

          {setting.requires_restart && (
            <span className="rounded-full border border-amber-500/15 bg-amber-950/10 px-2 py-1 text-[9px] font-semibold tracking-wider text-amber-400">
              REINICIO
            </span>
          )}

          {!setting.is_editable && (
            <span className="rounded-full border border-white/8 px-2 py-1 text-[9px] font-semibold tracking-wider text-zinc-600">
              SOLO LECTURA
            </span>
          )}
        </div>
      </div>

      {setting.description && (
        <p className="mt-3 text-xs leading-5 text-zinc-600">
          {setting.description}
        </p>
      )}

      <div className="mt-4">
        {isBoolean ? (
          <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-white/8 bg-[#09090a] px-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {booleanValue
                  ? "Habilitado"
                  : "Deshabilitado"}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-700">
                Usa el interruptor para cambiar este valor.
              </p>
            </div>

            <SettingSwitch
              checked={booleanValue}
              disabled={!setting.is_editable}
              onChange={(checked) =>
                setValue(String(checked))
              }
            />
          </div>
        ) : setting.value_type === "json" ? (
          <textarea
            value={value}
            disabled={!setting.is_editable}
            onChange={(event) =>
              setValue(event.target.value)
            }
            spellCheck={false}
            className="min-h-40 w-full rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 outline-none focus:border-red-500/50 disabled:opacity-50"
          />
        ) : (
          <div className="relative">
            <input
              type={inputType}
              value={value}
              step={
                setting.value_type === "float"
                  ? "any"
                  : undefined
              }
              disabled={!setting.is_editable}
              onChange={(event) =>
                setValue(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 pr-12 text-sm text-white outline-none focus:border-red-500/50 disabled:opacity-50"
            />

            {setting.is_sensitive && (
              <button
                type="button"
                onClick={() =>
                  setShowSensitive(
                    (current) => !current,
                  )
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-600 hover:text-white"
                aria-label={
                  showSensitive
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
              >
                {showSensitive ? (
                  <EyeOff size={15} />
                ) : (
                  <Eye size={15} />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          disabled={!setting.is_editable}
          onClick={resetToDefault}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-500 transition hover:border-white/15 hover:text-white disabled:opacity-30"
        >
          <RotateCcw size={14} />
          Usar default
        </button>

        <button
          type="button"
          disabled={
            isSaving || !setting.is_editable
          }
          onClick={() => void save()}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-3 text-xs text-red-300 transition hover:border-red-500/30 hover:text-red-200 disabled:opacity-30"
        >
          {isSaving ? (
            <LoaderCircle
              size={14}
              className="animate-spin"
            />
          ) : (
            <Save size={14} />
          )}
          Guardar
        </button>
      </div>
    </article>
  );
}
