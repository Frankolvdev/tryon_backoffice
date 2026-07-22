"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  CircleDot,
  LoaderCircle,
  RefreshCcw,
  Search,
  Settings,
  Sparkles,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { SystemSettingCard } from "@/components/backoffice/system/system-setting-card";
import { SystemStatusEditor } from "@/components/backoffice/system/system-status-editor";
import { browserApiRequest } from "@/lib/api/browser-api";

import { UserLibraryQuotaSetting } from "@/components/backoffice/system/user-library-quota-setting";

import type {
  ConfigurationValidationResponse,
  SeedDefaultSettingsResponse,
  SystemSettingResponse,
  SystemSettingsGroupedResponse,
  SystemStatusResponse,
} from "@/types/admin-system-settings";

export default function SystemSettingsPage() {
  const [grouped, setGrouped] =
    useState<SystemSettingsGroupedResponse>({
      categories: {},
    });
  const [status, setStatus] =
    useState<SystemStatusResponse | null>(
      null,
    );
  const [validation, setValidation] =
    useState<ConfigurationValidationResponse | null>(
      null,
    );
  const [search, setSearch] =
    useState("");
  const [category, setCategory] =
    useState("all");
  const [isLoading, setIsLoading] =
    useState(true);
  const [action, setAction] =
    useState<string | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        groupedResponse,
        statusResponse,
      ] = await Promise.all([
        browserApiRequest<SystemSettingsGroupedResponse>(
          "/api/admin/system-settings/grouped",
        ),
        browserApiRequest<SystemStatusResponse>(
          "/api/admin/system-status",
        ),
      ]);

      setGrouped(groupedResponse);
      setStatus(statusResponse);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar la configuración del sistema.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const categories = useMemo(
    () =>
      Object.keys(
        grouped.categories,
      ).sort(),
    [grouped.categories],
  );

  const settings = useMemo(
    () =>
      Object.entries(
        grouped.categories,
      ).flatMap(
        ([categoryKey, items]) =>
          items.map((item) => ({
            ...item,
            category: item.category ??
              categoryKey,
          })),
      ),
    [grouped.categories],
  );

  const visibleSettings = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    return settings.filter(
      (setting) => {
        if (
          category !== "all" &&
          setting.category !== category
        ) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        return [
          setting.label,
          setting.key,
          setting.description ?? "",
          setting.category,
        ].some((value) =>
          value
            .toLowerCase()
            .includes(normalized),
        );
      },
    );
  }, [
    category,
    search,
    settings,
  ]);

  const updateSetting = (
    updated: SystemSettingResponse,
  ) => {
    setGrouped((current) => {
      const nextCategories =
        Object.fromEntries(
          Object.entries(
            current.categories,
          ).map(
            ([key, items]) => [
              key,
              items.map((item) =>
                item.id === updated.id
                  ? updated
                  : item,
              ),
            ],
          ),
        );

      return {
        categories: nextCategories,
      };
    });
  };

  const seedDefaults = async () => {
    setAction("seed");

    try {
      const response =
        await browserApiRequest<SeedDefaultSettingsResponse>(
          "/api/admin/system-settings/seed-defaults",
          {
            method: "POST",
          },
        );

      toast.success(
        response.message,
      );
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible crear los valores predeterminados.",
      );
    } finally {
      setAction(null);
    }
  };

  const validateConfiguration =
    async () => {
      setAction("validate");

      try {
        const response =
          await browserApiRequest<ConfigurationValidationResponse>(
            "/api/admin/configuration/validate",
          );

        setValidation(response);
        toast.success(
          "Validación de configuración completada.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No fue posible validar la configuración.",
        );
      } finally {
        setAction(null);
      }
    };

  return (
    <div>
      <section className="luxia-panel overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
                <Settings size={24} />
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                  Sistema
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  Configuración
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                  Estado operativo y parámetros persistidos
                  en la base de datos mediante los endpoints
                  administrativos reales del backend.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void seedDefaults()
                }
                disabled={Boolean(action)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300 disabled:opacity-50"
              >
                {action === "seed" ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles size={16} />
                )}
                Crear defaults
              </button>

              <button
                type="button"
                onClick={() =>
                  void validateConfiguration()
                }
                disabled={Boolean(action)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-950/15 px-4 text-sm text-emerald-300 disabled:opacity-50"
              >
                {action === "validate" ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Validar
              </button>

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
              <SystemStatusEditor
                status={status}
                onSaved={setStatus}
              />
            </div>

            {validation && (
              <section className="luxia-panel mt-5 rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400" />
                  <h2 className="font-semibold text-white">
                    Resultado de validación
                  </h2>
                </div>

                <pre className="mt-5 max-h-96 overflow-auto rounded-2xl border border-white/7 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-400">
                  {JSON.stringify(
                    validation,
                    null,
                    2,
                  )}
                </pre>
              </section>
            )}

            <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
              <div className="border-b border-white/6 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Wrench className="text-red-400" />
                      <h2 className="text-lg font-semibold text-white">
                        Parámetros del sistema
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">
                      {settings.length} configuraciones
                      cargadas en {categories.length} categorías.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative">
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
                        placeholder="Buscar configuración..."
                        className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white sm:w-72"
                      />
                    </div>

                    <select
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value,
                        )
                      }
                      className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-4 text-sm text-zinc-300"
                    >
                      <option value="all">
                        Todas las categorías
                      </option>
                      {categories.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {visibleSettings.length > 0 ||
              ((category === "all" || category === "storage") && !search.trim()) ? (
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
                  {(category === "all" || category === "storage") && !search.trim() && (
                    <UserLibraryQuotaSetting />
                  )}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <CircleDot
                    size={34}
                    className="mx-auto text-zinc-700"
                  />
                  <p className="mt-4 text-sm text-zinc-600">
                    No hay configuraciones que coincidan
                    con los filtros.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
    </div>
  );
}
