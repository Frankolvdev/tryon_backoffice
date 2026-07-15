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
  onSaved: (
    setting: SystemSettingResponse,
  ) => void;
}

function serializeValue(
  value: unknown,
  valueType: string,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    valueType === "json" ||
    typeof value === "object"
  ) {
    return JSON.stringify(
      value,
      null,
      2,
    );
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
    const parsed =
      Number.parseInt(value, 10);

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
    return JSON.parse(value);
  }

  return value;
}

export function SystemSettingCard({
  setting,
  onSaved,
}: SystemSettingCardProps) {
  const [value, setValue] =
    useState(
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
            body: JSON.stringify(
              payload,
            ),
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
    setting.is_sensitive &&
    !showSensitive
      ? "password"
      : "text";

  return (
    <article className="rounded-2xl border border-white/7 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-white">
            {setting.label}
          </p>
          <p className="mt-1 break-all font-mono text-[10px] text-zinc-700">
            {setting.key}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-1.5">
          {setting.is_public && (
            <span className="rounded-full border border-blue-500/15 bg-blue-950/15 px-2 py-1 text-[10px] text-blue-300">
              PÚBLICA
            </span>
          )}
          {setting.requires_restart && (
            <span className="rounded-full border border-amber-500/15 bg-amber-950/15 px-2 py-1 text-[10px] text-amber-300">
              REINICIO
            </span>
          )}
          {!setting.is_editable && (
            <span className="rounded-full border border-white/8 bg-black/30 px-2 py-1 text-[10px] text-zinc-500">
              SOLO LECTURA
            </span>
          )}
        </div>
      </div>

      {setting.description && (
        <p className="mt-4 text-xs leading-6 text-zinc-600">
          {setting.description}
        </p>
      )}

      <div className="mt-5">
        {setting.value_type ===
        "boolean" ? (
          <select
            value={value}
            disabled={!setting.is_editable}
            onChange={(event) =>
              setValue(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white disabled:opacity-50"
          >
            <option value="true">
              true
            </option>
            <option value="false">
              false
            </option>
          </select>
        ) : setting.value_type ===
            "json" ? (
          <textarea
            value={value}
            disabled={!setting.is_editable}
            onChange={(event) =>
              setValue(
                event.target.value,
              )
            }
            spellCheck={false}
            className="min-h-40 w-full rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 disabled:opacity-50"
          />
        ) : (
          <div className="relative">
            <input
              type={inputType}
              value={value}
              disabled={!setting.is_editable}
              onChange={(event) =>
                setValue(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 pr-12 text-sm text-white outline-none focus:border-red-500/50 disabled:opacity-50"
            />

            {setting.is_sensitive && (
              <button
                type="button"
                onClick={() =>
                  setShowSensitive(
                    (current) =>
                      !current,
                  )
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-600 hover:text-white"
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
          disabled={
            !setting.is_editable
          }
          onClick={resetToDefault}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-500 disabled:opacity-30"
        >
          <RotateCcw size={14} />
          Usar default
        </button>

        <button
          type="button"
          disabled={
            isSaving ||
            !setting.is_editable
          }
          onClick={() => void save()}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-3 text-xs text-red-300 disabled:opacity-30"
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
