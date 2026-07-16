"use client";

import {
  Languages,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCcw,
  Sprout,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { LocaleEditorDialog } from "@/components/backoffice/i18n/locale-editor-dialog";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  I18nLocale,
  I18nLocaleListResponse,
  I18nSeedResponse,
} from "@/types/admin-i18n";

export default function InternationalizationPage() {
  const [locales, setLocales] =
    useState<I18nLocale[]>([]);
  const [editor, setEditor] =
    useState<
      I18nLocale | null | undefined
    >(undefined);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSeeding, setIsSeeding] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<I18nLocaleListResponse>(
          "/api/admin/i18n/locales?active_only=false",
        );

      setLocales(response.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los idiomas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const seed = async () => {
    if (
      !window.confirm(
        "Se crearán o actualizarán los idiomas y traducciones iniciales definidos por el backend. ¿Continuar?",
      )
    ) {
      return;
    }

    setIsSeeding(true);

    try {
      const response =
        await browserApiRequest<I18nSeedResponse>(
          "/api/admin/i18n/seed",
          {
            method: "POST",
          },
        );

      toast.success(response.message);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible inicializar los idiomas.",
      );
    } finally {
      setIsSeeding(false);
    }
  };

  const saveLocale = (
    saved: I18nLocale,
  ) => {
    setLocales((current) => {
      const exists = current.some(
        (item) =>
          item.code === saved.code,
      );

      return exists
        ? current.map((item) =>
            item.code === saved.code
              ? saved
              : item,
          )
        : [saved, ...current];
    });

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
                Sistema
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Internacionalización
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                Administra idiomas, formatos,
                monedas, zonas horarias y
                relaciones de fallback.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void seed()}
              disabled={isSeeding}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 disabled:opacity-50"
            >
              {isSeeding ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Sprout size={16} />
              )}
              Inicializar datos
            </button>

            <button
              type="button"
              onClick={() =>
                setEditor(null)
              }
              className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Nuevo idioma
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
        <section className="mt-5 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {locales.map((locale) => (
            <article
              key={locale.code}
              className="luxia-panel rounded-3xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-red-400">
                    {locale.code}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    {locale.native_name}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-600">
                    {locale.name}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {locale.is_default && (
                    <span className="rounded-full border border-red-500/15 bg-red-950/15 px-2.5 py-1 text-[10px] text-red-300">
                      predeterminado
                    </span>
                  )}

                  <span
                    className={
                      locale.is_active
                        ? "rounded-full border border-emerald-500/15 bg-emerald-950/10 px-2.5 py-1 text-[10px] text-emerald-400"
                        : "rounded-full border border-white/8 px-2.5 py-1 text-[10px] text-zinc-600"
                    }
                  >
                    {locale.is_active
                      ? "activo"
                      : "inactivo"}
                  </span>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-xs">
                {[
                  [
                    "Fallback",
                    locale.fallback_locale_code ??
                      "—",
                  ],
                  [
                    "Moneda",
                    locale.currency_code,
                  ],
                  [
                    "Zona horaria",
                    locale.timezone,
                  ],
                  [
                    "Fecha",
                    locale.date_format,
                  ],
                  [
                    "Hora",
                    locale.time_format,
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
                  setEditor(locale)
                }
                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/8 text-sm text-zinc-400"
              >
                <Pencil size={15} />
                Editar
              </button>
            </article>
          ))}

          {locales.length === 0 && (
            <div className="luxia-panel col-span-full rounded-3xl p-12 text-center text-sm text-zinc-600">
              No existen idiomas configurados.
            </div>
          )}
        </section>
      )}

      {editor !== undefined && (
        <LocaleEditorDialog
          locale={editor}
          locales={locales}
          onClose={() =>
            setEditor(undefined)
          }
          onSaved={saveLocale}
        />
      )}
    </div>
  );
}
