"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Database,
  FileImage,
  Files,
  HardDrive,
  LoaderCircle,
  RefreshCcw,
  Search,
  Server,
} from "lucide-react";

import { AiEngineTabs } from "@/components/backoffice/tryon/ai-engine-tabs";
import { StorageFileCard } from "@/components/backoffice/tryon/storage-file-card";
import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  AdminStorageFile,
} from "@/types/admin-storage";

const PAGE_SIZE = 50;

function formatBytes(
  value: number,
): string {
  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  let size = value;
  let unitIndex = 0;

  while (
    size >= 1024 &&
    unitIndex < units.length - 1
  ) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toLocaleString("es-MX", {
    maximumFractionDigits: 2,
  })} ${units[unitIndex]}`;
}

export default function TryOnStoragePage() {
  const [files, setFiles] =
    useState<AdminStorageFile[]>([]);

  const [page, setPage] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [provider, setProvider] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<
          AdminStorageFile[]
        >(
          `/api/admin/storage/files?skip=${
            page * PAGE_SIZE
          }&limit=${PAGE_SIZE}`,
        );

      setFiles(response);
    } catch (error) {
      setFiles([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los archivos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const providers = useMemo(
    () =>
      Array.from(
        new Set(
          files.map(
            (file) => file.provider,
          ),
        ),
      ).sort(),
    [files],
  );

  const visibleFiles = useMemo(() => {
    const normalized =
      search.trim().toLowerCase();

    return files.filter((file) => {
      if (
        provider &&
        file.provider !== provider
      ) {
        return false;
      }

      if (
        typeFilter === "images" &&
        !file.content_type
          ?.toLowerCase()
          .startsWith("image/")
      ) {
        return false;
      }

      if (
        typeFilter === "other" &&
        file.content_type
          ?.toLowerCase()
          .startsWith("image/")
      ) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [
        String(file.id),
        String(file.user_id ?? ""),
        file.provider,
        file.bucket ?? "",
        file.object_key,
        file.original_filename ?? "",
        file.content_type ?? "",
      ].some((value) =>
        value
          .toLowerCase()
          .includes(normalized),
      );
    });
  }, [
    files,
    provider,
    search,
    typeFilter,
  ]);

  const totalBytes = files.reduce(
    (sum, file) =>
      sum + (file.size_bytes ?? 0),
    0,
  );

  const imageCount = files.filter(
    (file) =>
      file.content_type
        ?.toLowerCase()
        .startsWith("image/"),
  ).length;

  const publicCount = files.filter(
    (file) => Boolean(file.public_url),
  ).length;

  return (
    <div>
      <TryOnModuleHeader
        title="Storage"
        description="Consulta administrativa de archivos asociados a Try-On, metadatos y acceso mediante URLs públicas o firmadas."
      />

      <AiEngineTabs />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() =>
            void loadFiles()
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

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="luxia-panel rounded-2xl p-5">
          <Files
            size={18}
            className="text-red-400"
          />
          <p className="mt-4 text-xs text-zinc-600">
            Archivos cargados
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {files.length}
          </p>
        </article>

        <article className="luxia-panel rounded-2xl p-5">
          <FileImage
            size={18}
            className="text-red-400"
          />
          <p className="mt-4 text-xs text-zinc-600">
            Imágenes
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {imageCount}
          </p>
        </article>

        <article className="luxia-panel rounded-2xl p-5">
          <HardDrive
            size={18}
            className="text-red-400"
          />
          <p className="mt-4 text-xs text-zinc-600">
            Tamaño de la página
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatBytes(totalBytes)}
          </p>
        </article>

        <article className="luxia-panel rounded-2xl p-5">
          <Server
            size={18}
            className="text-red-400"
          />
          <p className="mt-4 text-xs text-zinc-600">
            URLs públicas
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {publicCount}
          </p>
        </article>
      </section>

      <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
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
                placeholder="Buscar por ID, usuario, nombre, bucket o clave..."
                className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-500/40"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={provider}
                onChange={(event) =>
                  setProvider(
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300"
              >
                <option value="">
                  Todos los proveedores
                </option>

                {providers.map(
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
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300"
              >
                <option value="">
                  Todos los tipos
                </option>
                <option value="images">
                  Solo imágenes
                </option>
                <option value="other">
                  Otros archivos
                </option>
              </select>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-700">
            Página {page + 1} ·{" "}
            {files.length} registros cargados ·{" "}
            {visibleFiles.length} visibles
          </p>
        </div>

        {isLoading && (
          <div className="flex min-h-96 items-center justify-center">
            <LoaderCircle className="animate-spin text-red-500" />
          </div>
        )}

        {!isLoading &&
          errorMessage && (
            <div className="p-6">
              <TryOnEmptyState
                error
                title="No se pudo cargar Storage"
                description={errorMessage}
              />
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          visibleFiles.length === 0 && (
            <div className="p-6">
              <TryOnEmptyState
                title="No hay archivos para mostrar"
                description={
                  files.length === 0
                    ? "El endpoint respondió correctamente, pero esta página no contiene archivos."
                    : "Ningún archivo coincide con los filtros actuales."
                }
              />
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          visibleFiles.length > 0 && (
            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleFiles.map(
                (file) => (
                  <StorageFileCard
                    key={file.id}
                    file={file}
                  />
                ),
              )}
            </div>
          )}

        <footer className="flex items-center justify-between border-t border-white/6 p-5">
          <p className="text-xs text-zinc-700">
            skip {page * PAGE_SIZE}, limit{" "}
            {PAGE_SIZE}
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
                files.length <
                  PAGE_SIZE ||
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

      <div className="mt-5 rounded-2xl border border-white/6 bg-black/20 p-4 text-xs leading-6 text-zinc-600">
        <Database
          size={16}
          className="mr-2 inline text-red-400"
        />
        El backend actual permite listar archivos y
        generar URLs firmadas. No expone acciones
        administrativas para eliminar, mover o limpiar
        archivos; por eso no se inventaron esas funciones.
        Las métricas corresponden únicamente a la página
        cargada.
      </div>
    </div>
  );
}
