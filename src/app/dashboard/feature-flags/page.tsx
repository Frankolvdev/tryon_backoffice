"use client";

import {
  Eye,
  EyeOff,
  Flag,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  AdminFeatureFlag,
  FeatureFlagStatusFilter,
  FeatureFlagVisibilityFilter,
} from "@/types/admin-feature-flags";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<AdminFeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FeatureFlagStatusFilter>("all");
  const [visibilityFilter, setVisibilityFilter] =
    useState<FeatureFlagVisibilityFilter>("all");

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await browserApiRequest<AdminFeatureFlag[]>(
        "/api/admin/feature-flags",
      );

      setFlags(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los feature flags.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredFlags = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return flags.filter((flag) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        flag.key.toLowerCase().includes(normalizedSearch) ||
        flag.name.toLowerCase().includes(normalizedSearch) ||
        (flag.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && flag.is_enabled) ||
        (statusFilter === "disabled" && !flag.is_enabled);

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "public" && flag.is_public) ||
        (visibilityFilter === "private" && !flag.is_public);

      return matchesSearch && matchesStatus && matchesVisibility;
    });
  }, [flags, search, statusFilter, visibilityFilter]);

  const enabledCount = flags.filter((flag) => flag.is_enabled).length;
  const publicCount = flags.filter((flag) => flag.is_public).length;
  const privateCount = flags.length - publicCount;

  return (
    <div>
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="luxia-red-glow flex size-14 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <SlidersHorizontal size={24} />
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
                Sistema
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-white">
                Feature flags
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
                Supervisa las funcionalidades controladas por el backend,
                su disponibilidad actual y su exposición pública.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/8 px-4 text-sm text-zinc-400 transition hover:border-white/15 hover:text-white disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={isLoading ? "animate-spin" : undefined}
            />
            Actualizar
          </button>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Flags totales",
            value: flags.length,
            icon: Flag,
          },
          {
            label: "Habilitados",
            value: enabledCount,
            icon: ToggleRight,
          },
          {
            label: "Públicos",
            value: publicCount,
            icon: Eye,
          },
          {
            label: "Privados",
            value: privateCount,
            icon: ShieldCheck,
          },
        ].map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="luxia-panel rounded-3xl p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-600">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {value}
                </p>
              </div>

              <div className="flex size-11 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-zinc-500">
                <Icon size={20} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="luxia-panel mt-5 rounded-3xl p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por clave, nombre o descripción"
              className="h-11 w-full rounded-xl border border-white/8 bg-black/20 pr-4 pl-11 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-red-500/30"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as FeatureFlagStatusFilter,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-black/20 px-4 text-sm text-zinc-300 outline-none focus:border-red-500/30"
          >
            <option value="all">Todos los estados</option>
            <option value="enabled">Habilitados</option>
            <option value="disabled">Deshabilitados</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(event) =>
              setVisibilityFilter(
                event.target.value as FeatureFlagVisibilityFilter,
              )
            }
            className="h-11 rounded-xl border border-white/8 bg-black/20 px-4 text-sm text-zinc-300 outline-none focus:border-red-500/30"
          >
            <option value="all">Toda visibilidad</option>
            <option value="public">Públicos</option>
            <option value="private">Privados</option>
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
        <section className="mt-5 grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredFlags.map((flag) => (
            <article
              key={flag.id}
              className="luxia-panel rounded-3xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-red-400">
                    {flag.key}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    {flag.name}
                  </h2>
                </div>

                <div
                  className={
                    flag.is_enabled
                      ? "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/15 bg-emerald-950/10 text-emerald-400"
                      : "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-zinc-700"
                  }
                >
                  {flag.is_enabled ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </div>
              </div>

              <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-600">
                {flag.description || "Sin descripción configurada."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={
                    flag.is_enabled
                      ? "rounded-full border border-emerald-500/15 bg-emerald-950/10 px-2.5 py-1 text-[10px] text-emerald-400"
                      : "rounded-full border border-white/8 px-2.5 py-1 text-[10px] text-zinc-600"
                  }
                >
                  {flag.is_enabled ? "habilitado" : "deshabilitado"}
                </span>

                <span
                  className={
                    flag.is_public
                      ? "inline-flex items-center gap-1.5 rounded-full border border-sky-500/15 bg-sky-950/10 px-2.5 py-1 text-[10px] text-sky-400"
                      : "inline-flex items-center gap-1.5 rounded-full border border-white/8 px-2.5 py-1 text-[10px] text-zinc-600"
                  }
                >
                  {flag.is_public ? <Eye size={11} /> : <EyeOff size={11} />}
                  {flag.is_public ? "público" : "privado"}
                </span>
              </div>

              <dl className="mt-5 space-y-3 border-t border-white/5 pt-4 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-700">Creado</dt>
                  <dd className="text-right text-zinc-400">
                    {formatDate(flag.created_at)}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-700">Actualizado</dt>
                  <dd className="text-right text-zinc-400">
                    {formatDate(flag.updated_at)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}

          {filteredFlags.length === 0 && (
            <div className="luxia-panel col-span-full rounded-3xl p-12 text-center">
              <Flag className="mx-auto text-zinc-800" size={30} />
              <p className="mt-4 text-sm text-zinc-600">
                No hay feature flags que coincidan con los filtros.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
