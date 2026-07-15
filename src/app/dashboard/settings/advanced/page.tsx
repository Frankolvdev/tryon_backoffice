"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { SystemSettingsCategory } from "@/components/backoffice/system/system-settings-category";
import { SystemSettingsSummary } from "@/components/backoffice/system/system-settings-summary";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  SystemSettingResponse,
  SystemSettingsGroupedResponse,
} from "@/types/admin-system-settings";

export default function AdvancedSystemSettingsPage() {
  const [grouped, setGrouped] =
    useState<SystemSettingsGroupedResponse>({
      categories: {},
    });

  const [search, setSearch] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<SystemSettingsGroupedResponse>(
          "/api/admin/system-settings/grouped",
        );

      setGrouped(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la configuración avanzada.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const allSettings = useMemo(
    () =>
      Object.values(
        grouped.categories,
      ).flat(),
    [grouped.categories],
  );

  const visibleCategories = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    return Object.entries(
      grouped.categories,
    )
      .map(([category, settings]) => ({
        category,
        settings: normalized
          ? settings.filter((setting) =>
              [
                setting.label,
                setting.key,
                setting.description ?? "",
                setting.value_type,
              ].some((value) =>
                value
                  .toLowerCase()
                  .includes(normalized),
              ),
            )
          : settings,
      }))
      .filter(
        (entry) =>
          entry.settings.length > 0,
      )
      .sort((left, right) =>
        left.category.localeCompare(
          right.category,
        ),
      );
  }, [
    grouped.categories,
    search,
  ]);

  const updateSetting = (
    updated: SystemSettingResponse,
  ) => {
    setGrouped((current) => ({
      categories: Object.fromEntries(
        Object.entries(
          current.categories,
        ).map(([category, settings]) => [
          category,
          settings.map((setting) =>
            setting.id === updated.id
              ? updated
              : setting,
          ),
        ]),
      ),
    }));
  };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 bg-red-950/20 text-red-400">
                <ShieldCheck size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Sistema
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Configuración avanzada
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Vista agrupada de todos los parámetros
                  persistidos por el backend, incluidos los
                  valores técnicos, sensibles y que requieren
                  reiniciar servicios.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadSettings()
              }
              disabled={isLoading}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 disabled:opacity-50"
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
        <section className="luxia-panel mt-5 flex min-h-80 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading &&
        errorMessage && (
          <section className="luxia-panel mt-5 rounded-3xl p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-950/15 p-5">
              <TriangleAlert
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <p className="text-sm leading-6 text-red-300">
                {errorMessage}
              </p>
            </div>
          </section>
        )}

      {!isLoading &&
        !errorMessage && (
          <>
            <div className="mt-5">
              <SystemSettingsSummary
                settings={allSettings}
              />
            </div>

            <section className="luxia-panel mt-5 rounded-3xl p-5">
              <div className="relative max-w-xl">
                <Search
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Buscar por nombre, clave, tipo o descripción..."
                  className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white"
                />
              </div>
            </section>

            <div className="mt-5 space-y-5">
              {visibleCategories.map(
                (entry) => (
                  <SystemSettingsCategory
                    key={entry.category}
                    category={
                      entry.category
                    }
                    settings={
                      entry.settings
                    }
                    onSaved={
                      updateSetting
                    }
                  />
                ),
              )}
            </div>

            {visibleCategories.length === 0 && (
              <section className="luxia-panel mt-5 rounded-3xl p-10 text-center text-sm text-zinc-600">
                No hay configuraciones que coincidan con la búsqueda.
              </section>
            )}

            <section className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4 text-xs leading-6 text-amber-300/80">
              Los valores marcados como sensibles permanecen
              ocultos por defecto. Los parámetros con
              <span className="font-mono">
                {" "}
                requires_restart=true
              </span>
              {" "}
              pueden requerir reiniciar el backend o el
              servicio relacionado después de guardarlos.
            </section>
          </>
        )}
    </div>
  );
}
