"use client";

import {
  Download,
  Eye,
  File,
  FileImage,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StorageImageViewer } from "@/components/backoffice/tryon/storage-image-viewer";
import { TryOnCopyButton } from "@/components/backoffice/tryon/tryon-copy-button";
import { browserApiRequest } from "@/lib/api/browser-api";
import { formatTryOnDate } from "@/lib/tryon/format";
import type { AdminStorageFile } from "@/types/admin-storage";

interface StorageFileCardProps {
  file: AdminStorageFile;
  onDeleted: (fileId: number) => void;
}

function formatBytes(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "No disponible";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toLocaleString("es-MX", { maximumFractionDigits: 2 })} ${units[unitIndex]}`;
}

export function StorageFileCard({ file, onDeleted }: StorageFileCardProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isImage = file.content_type?.toLowerCase().startsWith("image/") ?? false;
  const contentUrl = `/api/admin/storage/files/${file.id}/content`;
  const downloadUrl = `${contentUrl}?download=1`;

  const deleteFile = async () => {
    const accepted = window.confirm(
      `¿Eliminar definitivamente ${file.original_filename ?? `el archivo #${file.id}`}?`,
    );
    if (!accepted) return;

    setIsDeleting(true);
    try {
      await browserApiRequest<unknown>(`/api/admin/storage/files/${file.id}`, { method: "DELETE" });
      toast.success("Archivo eliminado correctamente.");
      onDeleted(file.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible eliminar el archivo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article className="overflow-hidden rounded-3xl border border-white/7 bg-black/20">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-white/6 bg-[#070708]">
          {isImage ? (
            <img
              src={contentUrl}
              alt={file.original_filename ?? `Archivo ${file.id}`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
            />
          ) : (
            <File size={42} className="text-red-400" />
          )}
          <span className="absolute top-3 right-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 font-mono text-[10px] text-zinc-300 backdrop-blur">
            #{file.id}
          </span>
        </div>

        <div className="p-5">
          <p className="truncate text-sm font-semibold text-white">
            {file.original_filename ?? `Archivo #${file.id}`}
          </p>
          <p className="mt-2 truncate font-mono text-[10px] text-zinc-700">{file.object_key}</p>

          <dl className="mt-5 space-y-3 text-xs">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">Usuario</dt>
              <dd className="max-w-[65%] truncate text-right text-zinc-400">
                {file.user_email ?? file.user_full_name ?? (file.user_id ? `#${file.user_id}` : "Sistema")}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">Rol</dt>
              <dd className="text-right text-zinc-400">{file.user_role ?? "Sistema"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">Proveedor</dt>
              <dd className="text-right text-zinc-400">{file.provider}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">Tipo MIME</dt>
              <dd className="max-w-[65%] truncate text-right text-zinc-400">{file.content_type ?? "No disponible"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">Tamaño</dt>
              <dd className="text-right text-zinc-400">{formatBytes(file.size_bytes)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-700">Creado</dt>
              <dd className="text-right text-zinc-400">{formatTryOnDate(file.created_at)}</dd>
            </div>
          </dl>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => isImage ? setViewerOpen(true) : window.open(contentUrl, "_blank", "noopener,noreferrer")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-3 text-xs text-red-300"
            >
              <Eye size={14} /> Abrir
            </button>
            <a
              href={downloadUrl}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-3 text-xs text-zinc-300"
            >
              <Download size={14} /> Descargar
            </a>
            <TryOnCopyButton value={String(file.id)} label="Copiar ID" />
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => void deleteFile()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 px-3 text-xs text-red-300 disabled:opacity-50"
            >
              {isDeleting ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Eliminar
            </button>
          </div>
        </div>
      </article>

      {viewerOpen && isImage && (
        <StorageImageViewer file={file} onClose={() => setViewerOpen(false)} />
      )}
    </>
  );
}
