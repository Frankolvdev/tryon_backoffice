"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Cpu,
  Eye,
  ImageIcon,
  LoaderCircle,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";

import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnJobStatusBadge } from "@/components/backoffice/tryon/tryon-job-status-badge";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  formatTryOnDate,
  formatTryOnDuration,
  formatTryOnMoneyFromCents,
} from "@/lib/tryon/format";

import type {
  TryOnJobStatus,
  TryOnJobSummary,
} from "@/types/admin-tryon";

const PAGE_SIZE = 50;

function matchesSearch(
  job: TryOnJobSummary,
  search: string,
): boolean {
  const normalizedSearch =
    search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  const values = [
    String(job.id),
    String(job.user_id),
    String(job.person_image_file_id),
    String(job.item_image_file_id),
    job.result_file_id === null
      ? ""
      : String(job.result_file_id),
    job.status,
    job.item_type,
    job.quality_mode,
    job.runpod_job_id ?? "",
    job.comfy_workflow_name ?? "",
    job.prompt ?? "",
    job.error_message ?? "",
  ];

  return values.some((value) =>
    value
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

export default function TryOnJobsPage() {
  const [jobs, setJobs] = useState<
    TryOnJobSummary[]
  >([]);

  const [page, setPage] = useState(0);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [itemTypeFilter, setItemTypeFilter] =
    useState("");

  const [qualityFilter, setQualityFilter] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const skip = page * PAGE_SIZE;

      const response =
        await browserApiRequest<
          TryOnJobSummary[]
        >(
          `/api/admin/tryon-jobs?skip=${skip}&limit=${PAGE_SIZE}`,
        );

      setJobs(response);
    } catch (error) {
      setJobs([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los trabajos Try-On.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          jobs.map((job) => job.status),
        ),
      ).sort(),
    [jobs],
  );

  const itemTypes = useMemo(
    () =>
      Array.from(
        new Set(
          jobs.map((job) => job.item_type),
        ),
      ).sort(),
    [jobs],
  );

  const qualityModes = useMemo(
    () =>
      Array.from(
        new Set(
          jobs.map((job) => job.quality_mode),
        ),
      ).sort(),
    [jobs],
  );

  const visibleJobs = useMemo(
    () =>
      jobs.filter((job) => {
        if (
          statusFilter &&
          job.status !== statusFilter
        ) {
          return false;
        }

        if (
          itemTypeFilter &&
          job.item_type !== itemTypeFilter
        ) {
          return false;
        }

        if (
          qualityFilter &&
          job.quality_mode !== qualityFilter
        ) {
          return false;
        }

        return matchesSearch(job, search);
      }),
    [
      jobs,
      search,
      statusFilter,
      itemTypeFilter,
      qualityFilter,
    ],
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setItemTypeFilter("");
    setQualityFilter("");
  };

  return (
    <div>
      <TryOnModuleHeader
        title="Trabajos Try-On"
        description="Listado administrativo real de trabajos. El backend actualmente permite paginación mediante skip y limit; la búsqueda y los filtros se aplican sobre la página cargada."
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
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Buscar por ID, usuario, workflow, RunPod o error..."
                className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-500/40"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300"
              >
                <option value="">
                  Todos los estados
                </option>

                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={itemTypeFilter}
                onChange={(event) =>
                  setItemTypeFilter(
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300"
              >
                <option value="">
                  Todos los artículos
                </option>

                {itemTypes.map((itemType) => (
                  <option
                    key={itemType}
                    value={itemType}
                  >
                    {itemType}
                  </option>
                ))}
              </select>

              <select
                value={qualityFilter}
                onChange={(event) =>
                  setQualityFilter(
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300"
              >
                <option value="">
                  Todas las calidades
                </option>

                {qualityModes.map(
                  (qualityMode) => (
                    <option
                      key={qualityMode}
                      value={qualityMode}
                    >
                      {qualityMode}
                    </option>
                  ),
                )}
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
                  void loadJobs()
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
            Página {page + 1} ·{" "}
            {jobs.length} registros cargados ·{" "}
            {visibleJobs.length} visibles
          </p>
        </div>

        {isLoading && (
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <LoaderCircle className="mx-auto animate-spin text-red-500" />

              <p className="mt-4 text-sm text-zinc-500">
                Cargando trabajos Try-On...
              </p>
            </div>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="p-6">
            <TryOnEmptyState
              error
              title="No se pudo cargar el listado"
              description={errorMessage}
            />
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          visibleJobs.length === 0 && (
            <div className="p-6">
              <TryOnEmptyState
                title="No hay trabajos para mostrar"
                description={
                  jobs.length === 0
                    ? "El backend respondió correctamente, pero esta página no contiene trabajos Try-On."
                    : "Ningún trabajo de la página cargada coincide con los filtros actuales."
                }
              />
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          visibleJobs.length > 0 && (
            <>
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[1480px]">
                  <thead>
                    <tr className="border-b border-white/6 text-left">
                      {[
                        "Job",
                        "Usuario",
                        "Artículo",
                        "Calidad",
                        "Estado",
                        "Archivos",
                        "Tokens",
                        "GPU",
                        "Workflow",
                        "Creado",
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
                    {visibleJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b border-white/5 transition hover:bg-white/[0.018]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
                              <Sparkles size={17} />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-zinc-200">
                                #{job.id}
                              </p>

                              {job.runpod_job_id && (
                                <p className="mt-1 max-w-40 truncate font-mono text-[10px] text-zinc-700">
                                  {job.runpod_job_id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <UserRound size={15} />
                            #{job.user_id}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-400">
                          {job.item_type}
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-400">
                          {job.quality_mode}
                        </td>

                        <td className="px-5 py-4">
                          <TryOnJobStatusBadge
                            status={job.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1 text-[11px] text-zinc-600">
                            <p>
                              Persona:{" "}
                              {job.person_image_file_id}
                            </p>

                            <p>
                              Artículo:{" "}
                              {job.item_image_file_id}
                            </p>

                            <p>
                              Resultado:{" "}
                              {job.result_file_id ??
                                "Pendiente"}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Coins
                              size={15}
                              className="text-red-400"
                            />
                            {job.tokens_cost.toLocaleString(
                              "es-MX",
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1 text-[11px] text-zinc-600">
                            <p>
                              Real:{" "}
                              {formatTryOnDuration(
                                job.actual_gpu_seconds,
                              )}
                            </p>

                            <p>
                              {formatTryOnMoneyFromCents(
                                job.actual_gpu_cost_cents,
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-48 truncate text-xs text-zinc-500">
                            {job.comfy_workflow_name ??
                              "No asignado"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-xs text-zinc-600">
                          {formatTryOnDate(
                            job.created_at,
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/tryon/jobs/${job.id}`}
                            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/7 bg-white/[0.025] px-3 text-xs text-zinc-400 transition hover:border-red-500/15 hover:bg-red-950/20 hover:text-white"
                          >
                            <Eye size={14} />
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/6 xl:hidden">
                {visibleJobs.map((job) => (
                  <article
                    key={job.id}
                    className="p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-500/15 bg-red-950/20 text-red-400">
                        <Sparkles size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-white">
                            Job #{job.id}
                          </p>

                          <TryOnJobStatusBadge
                            status={job.status}
                          />
                        </div>

                        <p className="mt-2 text-xs text-zinc-600">
                          Usuario #{job.user_id} ·{" "}
                          {job.item_type} ·{" "}
                          {job.quality_mode}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                      <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                        <ImageIcon
                          size={15}
                          className="text-red-400"
                        />

                        <p className="mt-3 text-zinc-700">
                          Resultado
                        </p>

                        <p className="mt-1 text-zinc-300">
                          {job.result_file_id ??
                            "Pendiente"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                        <Coins
                          size={15}
                          className="text-red-400"
                        />

                        <p className="mt-3 text-zinc-700">
                          Tokens
                        </p>

                        <p className="mt-1 text-zinc-300">
                          {job.tokens_cost}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                        <Cpu
                          size={15}
                          className="text-red-400"
                        />

                        <p className="mt-3 text-zinc-700">
                          GPU
                        </p>

                        <p className="mt-1 text-zinc-300">
                          {formatTryOnDuration(
                            job.actual_gpu_seconds,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/6 bg-black/20 p-3">
                        <Sparkles
                          size={15}
                          className="text-red-400"
                        />

                        <p className="mt-3 text-zinc-700">
                          Workflow
                        </p>

                        <p className="mt-1 truncate text-zinc-300">
                          {job.comfy_workflow_name ??
                            "No asignado"}
                        </p>
                      </div>
                    </div>

                    {job.error_message && (
                      <p className="mt-4 rounded-xl border border-red-500/10 bg-red-950/10 p-3 text-xs leading-5 text-red-300">
                        {job.error_message}
                      </p>
                    )}

                    <Link
                      href={`/dashboard/tryon/jobs/${job.id}`}
                      className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/7 bg-white/[0.025] text-sm text-zinc-400"
                    >
                      <Eye size={15} />
                      Abrir detalle
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}

        <footer className="flex items-center justify-between border-t border-white/6 p-5">
          <p className="text-xs text-zinc-700">
            Registros del backend: skip{" "}
            {page * PAGE_SIZE}, limit{" "}
            {PAGE_SIZE}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                page === 0 || isLoading
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
                jobs.length < PAGE_SIZE ||
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
