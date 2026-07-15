"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Globe2,
  LoaderCircle,
  RefreshCcw,
  Search,
  TriangleAlert,
} from "lucide-react";

import { PublicConfigPreview } from "@/components/backoffice/system/public-config-preview";
import { SystemSettingCard } from "@/components/backoffice/system/system-setting-card";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  SystemSettingResponse,
  SystemSettingsGroupedResponse,
  SystemStatusResponse,
} from "@/types/admin-system-settings";

export default function PublicSystemSettingsPage() {
  const [grouped, setGrouped] =
    useState<SystemSettingsGroupedResponse>({
      categories: {},
    });

  const [status, setStatus] =
    useState<SystemStatusResponse | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        settingsResponse,
        statusResponse,
      ] = await Promise.all([
        browserApiRequest<SystemSettingsGroupedResponse>(
          "/api/admin/system-settings/grouped",
        ),
        browserApiRequest<SystemStatusResponse>(
          "/api/admin/system-status",
        ),
      ]);

      setGrouped(settingsResponse);
      setStatus(statusResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la configuración pública.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const publicSettings = useMemo(
    () =>
      Object.values(
        grouped.categories,
      )
        .flat()
        .filter(
          (setting) =>
            setting.is_public,
        )
        .sort(
          (left, right) =>
            left.sort_order -
              right.sort_order ||
            left.label.localeCompare(
              right.label,
            ),
        ),
    [grouped.categories],
  );

  const visibleSettings = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    if (!normalized) {
      return publicSettings;
    }

    return publicSettings.filter(
      (setting) =>
        [
          setting.label,
          setting.key,
          setting.description ?? "",
          setting.category,
        ].some((value) =>
          value
            .toLowerCase()
            .includes(normalized),
        ),
    );
  }, [
    publicSettings,
    search,
  ]);

  const updateSetting = (
    updated: SystemSettingResponse,
  ) => {
    setGrouped((current) => ({
      categories: Object.fromEntries(
        Object.entries(
          current.categories,
        ).map(([key, items]) => [
          key,
          items.map((item) =>
            item.id === updated.id
              ? updated
              : item,
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
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/15 bg-blue-950/15 text-blue-400">
                <Globe2 size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-400 uppercase">
                  Sistema
                </p>

                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Configuración pública
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Parámetros que el backend marca como
                  públicos y que pueden influir en el
                  frontend de usuarios.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadData()
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
        !errorMessage &&
        status && (
          <>
            <div className="mt-5">
              <PublicConfigPreview
                settings={
                  publicSettings
                }
                status={status}
              />
            </div>

            <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
              <div className="border-b border-white/6 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-white">
                      Valores públicos editables
                    </h2>

                    <p className="mt-1 text-xs text-zinc-600">
                      {
                        visibleSettings.length
                      }{" "}
                      de{" "}
                      {
                        publicSettings.length
                      }{" "}
                      configuraciones
                    </p>
                  </div>

                  <div className="relative w-full sm:w-80">
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
                      placeholder="Buscar valor público..."
                      className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              {visibleSettings.length >
              0 ? (
                <div className="grid gap-4 p-5 lg:grid-cols-2 2xl:grid-cols-3">
                  {visibleSettings.map(
                    (setting) => (
                      <SystemSettingCard
                        key={setting.id}
                        setting={setting}
                        onSaved={
                          updateSetting
                        }
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="p-10 text-center text-sm text-zinc-600">
                  No hay configuraciones públicas que
                  coincidan con la búsqueda.
                </div>
              )}
            </section>

            <section className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4 text-xs leading-6 text-amber-300/80">
              Solo aparecen registros con
              <span className="font-mono">
                {" "}
                is_public=true
              </span>
              . Los valores sensibles permanecen ocultos
              aunque un registro esté marcado como público.
            </section>
          </>
        )}
    </div>
  );
}
