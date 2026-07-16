"use client";

import {
  Eye,
  Languages,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { TranslationEditorDialog } from "@/components/backoffice/i18n/translation-editor-dialog";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  I18nLocale,
  I18nLocaleListResponse,
  I18nTranslation,
  I18nTranslationListResponse,
} from "@/types/admin-i18n";

const LIMIT = 500;

export default function TranslationsPage() {
  const [locales, setLocales] =
    useState<I18nLocale[]>([]);
  const [translations, setTranslations] =
    useState<I18nTranslation[]>([]);
  const [search, setSearch] =
    useState("");
  const [localeCode, setLocaleCode] =
    useState("");
  const [namespace, setNamespace] =
    useState("");
  const [activeOnly, setActiveOnly] =
    useState("");
  const [selected, setSelected] =
    useState<I18nTranslation | null>(
      null,
    );
  const [editor, setEditor] =
    useState<
      I18nTranslation | null | undefined
    >(undefined);
  const [isLoading, setIsLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params =
        new URLSearchParams({
          skip: "0",
          limit: String(LIMIT),
        });

      if (localeCode) {
        params.set(
          "locale_code",
          localeCode,
        );
      }

      if (namespace) {
        params.set(
          "namespace",
          namespace,
        );
      }

      if (search.trim()) {
        params.set(
          "search",
          search.trim(),
        );
      }

      if (activeOnly) {
        params.set(
          "is_active",
          activeOnly,
        );
      }

      const [
        localeResponse,
        translationResponse,
      ] = await Promise.all([
        browserApiRequest<I18nLocaleListResponse>(
          "/api/admin/i18n/locales?active_only=false",
        ),
        browserApiRequest<I18nTranslationListResponse>(
          `/api/admin/i18n/translations?${params.toString()}`,
        ),
      ]);

      setLocales(
        localeResponse.items,
      );
      setTranslations(
        translationResponse.items,
      );

      setSelected((current) =>
        current
          ? translationResponse.items.find(
              (item) =>
                item.id === current.id,
            ) ??
            translationResponse.items[0] ??
            null
          : translationResponse.items[0] ??
            null,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las traducciones.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    activeOnly,
    localeCode,
    namespace,
    search,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const namespaces = useMemo(
    () =>
      Array.from(
        new Set(
          translations.map(
            (item) => item.namespace,
          ),
        ),
      ).sort(),
    [translations],
  );

  const saveTranslation = (
    saved: I18nTranslation,
  ) => {
    setTranslations((current) => {
      const exists = current.some(
        (item) =>
          item.id === saved.id,
      );

      return exists
        ? current.map((item) =>
            item.id === saved.id
              ? saved
              : item,
          )
        : [saved, ...current];
    });

    setSelected(saved);
    setEditor(undefined);
  };

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <Languages size={24} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                Internacionalización
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Traducciones
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Administra claves y valores
                localizados para cada idioma.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setEditor(null)
              }
              className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Nueva traducción
            </button>

            <button
              type="button"
              onClick={() => void load()}
              disabled={isLoading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-50"
            >
              <RefreshCcw
                size={16}
                className={
                  isLoading
                    ? "animate-spin"
                    : undefined
                }
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <Search
              size={16}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
            />
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Buscar clave o valor..."
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 pr-4 pl-11 text-sm text-white"
            />
          </label>

          <select
            value={localeCode}
            onChange={(event) =>
              setLocaleCode(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Todos los idiomas
            </option>
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

          <select
            value={namespace}
            onChange={(event) =>
              setNamespace(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Todos los namespaces
            </option>
            {namespaces.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          <select
            value={activeOnly}
            onChange={(event) =>
              setActiveOnly(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
          >
            <option value="">
              Activas e inactivas
            </option>
            <option value="true">
              Activas
            </option>
            <option value="false">
              Inactivas
            </option>
          </select>
        </div>
      </section>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className="luxia-panel mt-5 rounded-3xl p-6 text-sm text-red-300">
          {errorMessage}
        </section>
      )}

      {!isLoading && !errorMessage && (
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="luxia-panel overflow-hidden rounded-3xl">
            {translations.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-600">
                No existen traducciones que coincidan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] text-left">
                  <thead className="border-b border-white/6 bg-black/20 text-[10px] tracking-[0.14em] text-zinc-700 uppercase">
                    <tr>
                      <th className="px-5 py-4">
                        Clave
                      </th>
                      <th className="px-5 py-4">
                        Idioma
                      </th>
                      <th className="px-5 py-4">
                        Namespace
                      </th>
                      <th className="px-5 py-4">
                        Estado
                      </th>
                      <th className="px-5 py-4 text-right">
                        Acción
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {translations.map(
                      (translation) => (
                        <tr
                          key={translation.id}
                          className={
                            selected?.id ===
                            translation.id
                              ? "bg-red-950/[0.08]"
                              : "hover:bg-white/[0.02]"
                          }
                        >
                          <td className="px-5 py-4">
                            <p className="max-w-sm truncate font-mono text-xs text-white">
                              {
                                translation.translation_key
                              }
                            </p>
                            <p className="mt-1 max-w-sm truncate text-[10px] text-zinc-700">
                              {translation.value}
                            </p>
                          </td>

                          <td className="px-5 py-4 font-mono text-xs text-zinc-400">
                            {
                              translation.locale_code
                            }
                          </td>

                          <td className="px-5 py-4 text-xs text-zinc-500">
                            {
                              translation.namespace
                            }
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={
                                translation.is_active
                                  ? "rounded-full border border-emerald-500/15 bg-emerald-950/10 px-2.5 py-1 text-[10px] text-emerald-400"
                                  : "rounded-full border border-white/8 px-2.5 py-1 text-[10px] text-zinc-600"
                              }
                            >
                              {translation.is_active
                                ? "activa"
                                : "inactiva"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelected(
                                  translation,
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 px-3 text-xs text-zinc-400"
                            >
                              <Eye size={14} />
                              Ver
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="luxia-panel rounded-3xl p-6">
            {!selected ? (
              <div className="flex min-h-72 items-center justify-center text-sm text-zinc-600">
                Selecciona una traducción.
              </div>
            ) : (
              <>
                <p className="font-mono text-[10px] text-red-400">
                  {selected.locale_code} ·{" "}
                  {selected.namespace}
                </p>

                <h2 className="mt-3 break-all text-lg font-semibold text-white">
                  {selected.translation_key}
                </h2>

                <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {selected.value}
                  </p>
                </div>

                {selected.description && (
                  <div className="mt-4 rounded-2xl border border-white/7 bg-black/20 p-4">
                    <p className="text-xs font-semibold text-zinc-500">
                      Descripción
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-zinc-600">
                      {selected.description}
                    </p>
                  </div>
                )}

                <dl className="mt-5 space-y-3 text-xs">
                  {[
                    [
                      "HTML",
                      selected.is_html
                        ? "Sí"
                        : "No",
                    ],
                    [
                      "Activa",
                      selected.is_active
                        ? "Sí"
                        : "No",
                    ],
                    [
                      "Creada",
                      new Date(
                        selected.created_at,
                      ).toLocaleString(
                        "es-MX",
                      ),
                    ],
                    [
                      "Actualizada",
                      new Date(
                        selected.updated_at,
                      ).toLocaleString(
                        "es-MX",
                      ),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="flex justify-between gap-4 border-b border-white/5 pb-3"
                    >
                      <dt className="text-zinc-700">
                        {String(label)}
                      </dt>
                      <dd className="text-right text-zinc-300">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>

                <button
                  type="button"
                  onClick={() =>
                    setEditor(selected)
                  }
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400"
                >
                  <Pencil size={15} />
                  Editar traducción
                </button>
              </>
            )}
          </aside>
        </section>
      )}

      {editor !== undefined && (
        <TranslationEditorDialog
          translation={editor}
          locales={locales}
          onClose={() =>
            setEditor(undefined)
          }
          onSaved={saveTranslation}
        />
      )}
    </div>
  );
}
