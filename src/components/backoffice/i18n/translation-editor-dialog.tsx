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
  I18nTranslation,
  I18nTranslationCreate,
  I18nTranslationUpdate,
} from "@/types/admin-i18n";

interface Props {
  translation: I18nTranslation | null;
  locales: I18nLocale[];
  onClose: () => void;
  onSaved: (
    translation: I18nTranslation,
  ) => void;
}

export function TranslationEditorDialog({
  translation,
  locales,
  onClose,
  onSaved,
}: Props) {
  const editing =
    translation !== null;

  const [localeCode, setLocaleCode] =
    useState(
      translation?.locale_code ??
        locales[0]?.code ??
        "",
    );
  const [translationKey, setTranslationKey] =
    useState(
      translation?.translation_key ??
        "",
    );
  const [value, setValue] =
    useState(
      translation?.value ?? "",
    );
  const [description, setDescription] =
    useState(
      translation?.description ?? "",
    );
  const [isHtml, setIsHtml] =
    useState(
      translation?.is_html ?? false,
    );
  const [isActive, setIsActive] =
    useState(
      translation?.is_active ?? true,
    );
  const [isSaving, setIsSaving] =
    useState(false);

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (!localeCode) {
      toast.error(
        "Selecciona un idioma.",
      );
      return;
    }

    if (!translationKey.trim()) {
      toast.error(
        "La clave es obligatoria.",
      );
      return;
    }

    if (!value.trim()) {
      toast.error(
        "El valor es obligatorio.",
      );
      return;
    }

    const payload:
      | I18nTranslationCreate
      | I18nTranslationUpdate =
      editing
        ? {
            value: value.trim(),
            description:
              description.trim() || null,
            is_html: isHtml,
            is_active: isActive,
          }
        : {
            locale_code: localeCode,
            translation_key:
              translationKey.trim(),
            value: value.trim(),
            description:
              description.trim() || null,
            is_html: isHtml,
            is_active: isActive,
          };

    setIsSaving(true);

    try {
      const saved =
        await browserApiRequest<I18nTranslation>(
          editing
            ? `/api/admin/i18n/translations/${translation.id}`
            : "/api/admin/i18n/translations",
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
          ? "Traducción actualizada."
          : "Traducción creada.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la traducción.",
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
              {editing
                ? "Editar traducción"
                : "Nueva traducción"}
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
              Idioma
            </span>
            <select
              value={localeCode}
              disabled={editing}
              onChange={(event) =>
                setLocaleCode(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300 disabled:opacity-50"
            >
              {locales.map((locale) => (
                <option
                  key={locale.code}
                  value={locale.code}
                >
                  {locale.code} ·{" "}
                  {locale.native_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Clave
            </span>
            <input
              value={translationKey}
              disabled={editing}
              onChange={(event) =>
                setTranslationKey(
                  event.target.value,
                )
              }
              placeholder="auth.login.title"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white disabled:opacity-50"
            />
          </label>
        </div>

        <label className="mx-6 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Valor
          </span>
          <textarea
            value={value}
            maxLength={50000}
            onChange={(event) =>
              setValue(event.target.value)
            }
            className="min-h-48 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm leading-7 text-white"
          />
        </label>

        <label className="mx-6 mt-5 block">
          <span className="mb-2 block text-sm text-zinc-500">
            Descripción interna
          </span>
          <textarea
            value={description}
            maxLength={10000}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            className="min-h-28 w-full rounded-xl border border-white/8 bg-black/30 p-4 text-sm leading-7 text-white"
          />
        </label>

        <div className="grid gap-4 px-6 pt-5 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Contenido HTML
            <input
              type="checkbox"
              checked={isHtml}
              onChange={(event) =>
                setIsHtml(
                  event.target.checked,
                )
              }
              className="accent-red-700"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Traducción activa
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
            Guardar traducción
          </button>
        </footer>
      </form>
    </div>
  );
}
