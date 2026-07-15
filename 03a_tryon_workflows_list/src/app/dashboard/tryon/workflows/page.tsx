"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileJson2,
  LoaderCircle,
  RefreshCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { WorkflowStatusBadges } from "@/components/backoffice/tryon/workflow-status-badges";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  formatTryOnDate,
} from "@/lib/tryon/format";

import type {
  WorkflowDefinitionListResponse,
  WorkflowDefinitionResponse,
} from "@/types/admin-workflows";

const PAGE_SIZE = 50;

export default function TryOnWorkflowsPage() {
  const [response, setResponse] =
    useState<WorkflowDefinitionListResponse | null>(
      null,
    );

  const [page, setPage] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("");

  const [defaultFilter, setDefaultFilter] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadWorkflows =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const query =
          new URLSearchParams({
            skip: String(
              page * PAGE_SIZE,
            ),
            limit: String(PAGE_SIZE),
          });

        if (search.trim()) {
          query.set(
            "search",
            search.trim(),
          );
        }

        if (category) {
          query.set(
            "category",
            category,
          );
        }

        if (activeFilter) {
          query.set(
            "is_active",
            activeFilter,
          );
        }

        if (defaultFilter) {
          query.set(
            "is_default",
            defaultFilter,
          );
        }

        const result =
          await browserApiRequest<WorkflowDefinitionListResponse>(
            `/api/admin/workflow-definitions?${query.toString()}`,
          );

        setResponse(result);
      } catch (error) {
        setResponse(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar los workflows.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      activeFilter,
      category,
      defaultFilter,
      page,
      search,
    ]);

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        void loadWorkflows();
      }, 250);

    return () =>
      window.clearTimeout(timeout);
  }, [loadWorkflows]);

  const workflows =
    response?.items ?? [];

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          workflows.map(
            (workflow) =>
              workflow.category,
          ),
        ),
      ).sort(),
    [workflows],
  );

  const nodeCount = (
    workflow: WorkflowDefinitionResponse,
  ): number => {
    return Object.keys(
      workflow.workflow,
    ).length;
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setActiveFilter("");
    setDefaultFilter("");
    setPage(0);
  };

  return (
    <div>
      <TryOnModuleHeader
        title="Workflows"
        description="Catálogo administrativo de definiciones y versiones de workflows disponibles para ComfyUI local y RunPod Serverless."
      />

      <section className="luxia-panel mt-7 overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                size={17}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );
                  setPage(0);
                }}
                placeholder="Buscar por nombre, clave o descripción..."
                className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-500/40"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={category}
                onChange={(event) => {
                  setCategory(
                    event.target.value,
                  );
                  setPage(0);
                }}
                className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300"
              >
                <option value="">
                  Todas las categorías
                </option>

                {categories.map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ),
                )}
              </select>

              <select
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(
                    event.target.value,
                  );
                  setPage(0);
                }}
                className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300"
              >
                <option value="">
                  Activos e inactivos
                </option>
                <option value="true">
                  Solo activos
                </option>
                <option value="false">
                  Solo inactivos
                </option>
              </select>

              <select
                value={defaultFilter}
                onChange={(event) => {
                  setDefaultFilter(
                    event.target.value,
                  );
                  setPage(0);
                }}
                className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300"
              >
                <option value="">
                  Todos
                </option>
                <option value="true">
                  Predeterminados
                </option>
                <option value="false">
                  No predeterminados
                </option>
              </select>

              <button
                type="button"
                onClick={clearFilters}
                title="Limpiar filtros"
                className="flex size-11 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 transition hover:text-white"
              >
                <SlidersHorizontal size={17} />
              </button>

              <button
                type="button"
                onClick={() =>
                  void loadWorkflows()
                }
                disabled={isLoading}
                className="flex h-11 items-center gap-2 rounded-xl border border-white/7 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white disabled:opacity-50"
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

          <p className="mt-4 text-xs text-zinc-700">
            {response?.total ?? 0} workflows ·
            página {page + 1}
          </p>
        </div>

        {isLoading && (
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <LoaderCircle className="mx-auto animate-spin text-red-500" />
              <p className="mt-4 text-sm text-zinc-500">
                Cargando workflows...
              </p>
            </div>
          </div>
        )}

        {!isLoading &&
          errorMessage && (
            <div className="p-6">
              <TryOnEmptyState
                error
                title="No se pudo cargar Workflows"
                description={
                  errorMessage
                }
              />
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          workflows.length === 0 && (
            <div className="p-6">
              <TryOnEmptyState
                title="No existen workflows"
                description="No hay definiciones que coincidan con los filtros actuales."
              />
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          workflows.length > 0 && (
            <>
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[1280px]">
                  <thead>
                    <tr className="border-b border-white/6 text-left">
                      {[
                        "Workflow",
                        "Versión",
                        "Categoría",
                        "Estado",
                        "Nodos",
                        "Creado",
                        "Actualizado",
                        "",
                      ].map((label) => (
                        <th
                          key={label}
                          className="px-5 py-4 text-[10px] font-semibold tracking-[0.18em] text-zinc-700 uppercase"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {workflows.map(
                      (workflow) => (
                        <tr
                          key={workflow.id}
                          className="border-b border-white/5 transition hover:bg-white/[0.018]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
                                <Boxes size={17} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-medium text-zinc-200">
                                  {workflow.name}
                                </p>

                                <p className="mt-1 max-w-72 truncate font-mono text-[10px] text-zinc-700">
                                  {workflow.key}
                                </p>

                                {workflow.description && (
                                  <p className="mt-2 max-w-96 truncate text-xs text-zinc-600">
                                    {
                                      workflow.description
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-400">
                            v{workflow.version}
                          </td>

                          <td className="px-5 py-4 text-sm text-zinc-400">
                            {workflow.category}
                          </td>

                          <td className="px-5 py-4">
                            <WorkflowStatusBadges
                              workflow={
                                workflow
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <FileJson2
                                size={15}
                                className="text-red-400"
                              />

                              {nodeCount(
                                workflow,
                              ).toLocaleString(
                                "es-MX",
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs text-zinc-600">
                            {formatTryOnDate(
                              workflow.created_at,
                            )}
                          </td>

                          <td className="px-5 py-4 text-xs text-zinc-600">
                            {formatTryOnDate(
                              workflow.updated_at,
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/dashboard/tryon/workflows/${workflow.id}`}
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/7 bg-white/[0.025] px-3 text-xs text-zinc-400 transition hover:border-red-500/15 hover:bg-red-950/20 hover:text-white"
                            >
                              <Eye size={14} />
                              Ver
                            </Link>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/6 xl:hidden">
                {workflows.map(
                  (workflow) => (
                    <article
                      key={workflow.id}
                      className="p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
                          <Boxes size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">
                            {workflow.name}
                          </p>

                          <p className="mt-1 truncate font-mono text-[10px] text-zinc-700">
                            {workflow.key}
                          </p>

                          <div className="mt-3">
                            <WorkflowStatusBadges
                              workflow={
                                workflow
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                        <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                          <p className="text-zinc-700">
                            Versión
                          </p>
                          <p className="mt-1 text-zinc-300">
                            v
                            {
                              workflow.version
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                          <p className="text-zinc-700">
                            Categoría
                          </p>
                          <p className="mt-1 truncate text-zinc-300">
                            {
                              workflow.category
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                          <p className="text-zinc-700">
                            Nodos
                          </p>
                          <p className="mt-1 text-zinc-300">
                            {nodeCount(
                              workflow,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                          <p className="text-zinc-700">
                            Creador
                          </p>
                          <p className="mt-1 text-zinc-300">
                            {workflow.created_by_user_id
                              ? `#${workflow.created_by_user_id}`
                              : "Sistema"}
                          </p>
                        </div>
                      </div>

                      {workflow.description && (
                        <p className="mt-4 text-xs leading-6 text-zinc-600">
                          {
                            workflow.description
                          }
                        </p>
                      )}

                      <Link
                        href={`/dashboard/tryon/workflows/${workflow.id}`}
                        className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/7 bg-white/[0.025] text-sm text-zinc-400"
                      >
                        <Eye size={15} />
                        Abrir detalle
                      </Link>
                    </article>
                  ),
                )}
              </div>
            </>
          )}

        <footer className="flex items-center justify-between border-t border-white/6 p-5">
          <p className="text-xs text-zinc-700">
            Mostrando{" "}
            {response?.skip ?? 0}–{" "}
            {(response?.skip ?? 0) +
              workflows.length}{" "}
            de {response?.total ?? 0}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                page === 0 ||
                isLoading
              }
              onClick={() =>
                setPage((current) =>
                  Math.max(
                    current - 1,
                    0,
                  ),
                )
              }
              className="flex size-10 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              disabled={
                !response ||
                response.skip +
                  response.items.length >=
                  response.total ||
                isLoading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1,
                )
              }
              className="flex size-10 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
