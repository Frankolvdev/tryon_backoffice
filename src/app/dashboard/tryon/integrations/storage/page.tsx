"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  UserRound,
} from "lucide-react";

import { AiEngineTabs } from "@/components/backoffice/tryon/ai-engine-tabs";
import { StorageFileCard } from "@/components/backoffice/tryon/storage-file-card";
import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";
import type { AdminStorageFile } from "@/types/admin-storage";

const PAGE_SIZE = 50;

function formatBytes(value: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toLocaleString("es-MX", { maximumFractionDigits: 2 })} ${units[unitIndex]}`;
}

export default function TryOnStoragePage() {
  const [files, setFiles] = useState<AdminStorageFile[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [provider, setProvider] = useState("");
  const [role, setRole] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({
        skip: String(page * PAGE_SIZE),
        limit: String(PAGE_SIZE),
      });
      if (search.trim()) params.set("search", search.trim());
      if (userFilter.trim()) params.set("user", userFilter.trim());
      if (provider) params.set("provider", provider);
      if (role) params.set("role", role);
      if (typeFilter) params.set("file_type", typeFilter);

      const response = await browserApiRequest<AdminStorageFile[]>(
        `/api/admin/storage/files?${params.toString()}`,
      );
      setFiles(response);
    } catch (error) {
      setFiles([]);
      setErrorMessage(error instanceof Error ? error.message : "No fue posible cargar los archivos.");
    } finally {
      setIsLoading(false);
    }
  }, [page, provider, role, search, typeFilter, userFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadFiles(), 250);
    return () => window.clearTimeout(timer);
  }, [loadFiles]);

  useEffect(() => setPage(0), [provider, role, search, typeFilter, userFilter]);

  const providerOptions = useMemo(
    () => Array.from(new Set(files.map((file) => file.provider))).sort(),
    [files],
  );
  const totalBytes = files.reduce((sum, file) => sum + (file.size_bytes ?? 0), 0);
  const imageCount = files.filter((file) => file.content_type?.toLowerCase().startsWith("image/")).length;
  const userCount = new Set(files.map((file) => file.user_id).filter(Boolean)).size;

  return (
    <div>
      <TryOnModuleHeader
        title="Almacenamiento"
        description="Explora, filtra, previsualiza, descarga y administra archivos guardados en almacenamiento local o S3."
      />
      <AiEngineTabs />

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={() => void loadFiles()} disabled={isLoading} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 disabled:opacity-50">
          <RefreshCcw size={16} className={isLoading ? "animate-spin" : undefined} /> Actualizar
        </button>
      </div>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [Files, "Archivos en página", String(files.length)],
          [FileImage, "Imágenes", String(imageCount)],
          [HardDrive, "Tamaño de página", formatBytes(totalBytes)],
          [UserRound, "Usuarios visibles", String(userCount)],
        ].map(([Icon, label, value]) => {
          const CardIcon = Icon as typeof Files;
          return (
            <article key={String(label)} className="luxia-panel rounded-2xl p-5">
              <CardIcon size={18} className="text-red-400" />
              <p className="mt-4 text-xs text-zinc-600">{String(label)}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p>
            </article>
          );
        })}
      </section>

      <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
        <div className="border-b border-white/6 p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_repeat(4,minmax(150px,auto))]">
            <div className="relative">
              <Search size={17} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-700" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar archivo, bucket, MIME, ID o correo..." className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-500/40" />
            </div>
            <input type="search" value={userFilter} onChange={(event) => setUserFilter(event.target.value)} placeholder="Usuario, correo o ID" className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300 outline-none" />
            <select value={provider} onChange={(event) => setProvider(event.target.value)} className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300">
              <option value="">Todos los proveedores</option>
              {["local", "s3", "minio", "r2", ...providerOptions].filter((value, index, values) => values.indexOf(value) === index).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300">
              <option value="">Todos los roles</option>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="superadmin">Superadministrador</option>
              <option value="system">Sistema / sin usuario</option>
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-11 rounded-xl border border-white/7 bg-[#09090a] px-3 text-sm text-zinc-300">
              <option value="">Todos los tipos</option>
              <option value="images">Imágenes</option>
              <option value="videos">Videos</option>
              <option value="documents">Documentos</option>
              <option value="archives">Comprimidos</option>
              <option value="other">Otros</option>
            </select>
          </div>
          <p className="mt-4 text-xs text-zinc-700">Página {page + 1} · {files.length} registros cargados</p>
        </div>

        {isLoading && <div className="flex min-h-96 items-center justify-center"><LoaderCircle className="animate-spin text-red-500" /></div>}
        {!isLoading && errorMessage && <div className="p-6"><TryOnEmptyState error title="No se pudo cargar Almacenamiento" description={errorMessage} /></div>}
        {!isLoading && !errorMessage && files.length === 0 && <div className="p-6"><TryOnEmptyState title="No hay archivos para mostrar" description="No existen archivos o ninguno coincide con los filtros actuales." /></div>}
        {!isLoading && !errorMessage && files.length > 0 && (
          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {files.map((file) => (
              <StorageFileCard key={file.id} file={file} onDeleted={(fileId) => setFiles((current) => current.filter((item) => item.id !== fileId))} />
            ))}
          </div>
        )}

        <footer className="flex items-center justify-between border-t border-white/6 p-5">
          <p className="text-xs text-zinc-700">skip {page * PAGE_SIZE}, limit {PAGE_SIZE}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page === 0 || isLoading} onClick={() => setPage((current) => Math.max(current - 1, 0))} className="flex size-10 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 disabled:opacity-30"><ChevronLeft size={17} /></button>
            <button type="button" disabled={files.length < PAGE_SIZE || isLoading} onClick={() => setPage((current) => current + 1)} className="flex size-10 items-center justify-center rounded-xl border border-white/7 bg-white/[0.025] text-zinc-500 disabled:opacity-30"><ChevronRight size={17} /></button>
          </div>
        </footer>
      </section>

      <div className="mt-5 rounded-2xl border border-white/6 bg-black/20 p-4 text-xs leading-6 text-zinc-600">
        <Database size={16} className="mr-2 inline text-red-400" />
        Las miniaturas y descargas pasan por una ruta administrativa autenticada. El visor funciona con archivos locales y S3 sin exponer credenciales.
      </div>
    </div>
  );
}
