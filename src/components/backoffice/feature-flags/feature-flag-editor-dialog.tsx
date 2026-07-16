"use client";

import {
  Flag,
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
  AdminFeatureFlag,
  AdminFeatureFlagCreate,
  AdminFeatureFlagUpdate,
} from "@/types/admin-feature-flags";

interface Props {
  flag: AdminFeatureFlag | null;
  onClose: () => void;
  onSaved: (flag: AdminFeatureFlag) => void;
}

const inputClassName =
  "h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-500/30";

export function FeatureFlagEditorDialog({
  flag,
  onClose,
  onSaved,
}: Props) {
  const editing = flag !== null;
  const [key, setKey] = useState(flag?.key ?? "");
  const [name, setName] = useState(flag?.name ?? "");
  const [description, setDescription] = useState(
    flag?.description ?? "",
  );
  const [isEnabled, setIsEnabled] = useState(
    flag?.is_enabled ?? false,
  );
  const [isPublic, setIsPublic] = useState(
    flag?.is_public ?? true,
  );
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedKey = key.trim();
    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("El nombre es obligatorio.");
      return;
    }

    if (
      !editing &&
      !/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(normalizedKey)
    ) {
      toast.error(
        "La clave solo puede contener minúsculas, números, puntos, guiones y guiones bajos.",
      );
      return;
    }

    const shared: AdminFeatureFlagUpdate = {
      name: normalizedName,
      description: description.trim() || null,
      is_enabled: isEnabled,
      is_public: isPublic,
    };

    const payload: AdminFeatureFlagCreate | AdminFeatureFlagUpdate =
      editing
        ? shared
        : {
            key: normalizedKey,
            ...shared,
            is_enabled: isEnabled,
            is_public: isPublic,
          };

    setIsSaving(true);

    try {
      const saved = await browserApiRequest<AdminFeatureFlag>(
        editing
          ? `/api/admin/feature-flags/${flag.id}`
          : "/api/admin/feature-flags",
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );

      onSaved(saved);
      toast.success(
        editing
          ? "Feature flag actualizado."
          : "Feature flag creado.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el feature flag.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="luxia-panel max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/8">
        <div className="flex items-start justify-between gap-4 border-b border-white/5 p-6">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <Flag size={21} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                Feature flags
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {editing ? `Editar ${flag.key}` : "Nuevo feature flag"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Controla la disponibilidad y exposición de una funcionalidad
                registrada en el backend.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/8 text-zinc-600 transition hover:border-white/15 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <label className="block">
            <span className="mb-2 block text-xs text-zinc-500">
              Clave
            </span>
            <input
              value={key}
              onChange={(event) => setKey(event.target.value)}
              disabled={editing}
              placeholder="tryon.new_engine"
              className={`${inputClassName} font-mono disabled:cursor-not-allowed disabled:opacity-50`}
              required
            />
            <span className="mt-2 block text-[11px] leading-5 text-zinc-700">
              La clave es permanente después de crear el flag.
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs text-zinc-500">
              Nombre
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nuevo motor Try-On"
              className={inputClassName}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs text-zinc-500">
              Descripción
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe qué funcionalidad controla este flag."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-red-500/30"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 p-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Habilitado
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-700">
                  Activa la funcionalidad controlada.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(event) =>
                  setIsEnabled(event.target.checked)
                }
                className="size-4 accent-red-700"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/20 p-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Público
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-700">
                  Expone su estado mediante la configuración pública.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) =>
                  setIsPublic(event.target.checked)
                }
                className="size-4 accent-red-700"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/8 px-5 text-sm text-zinc-500 transition hover:border-white/15 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="luxia-red-glow inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {isSaving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar feature flag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
