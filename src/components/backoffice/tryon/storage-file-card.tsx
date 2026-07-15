"use client";

import {
  ExternalLink,
  File,
  FileImage,
  LoaderCircle,
  Link2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { TryOnCopyButton } from "@/components/backoffice/tryon/tryon-copy-button";
import { browserApiRequest } from "@/lib/api/browser-api";
import { formatTryOnDate } from "@/lib/tryon/format";

import type {
  AdminStorageFile,
  StorageSignedUrlResponse,
} from "@/types/admin-storage";

interface StorageFileCardProps {
  file: AdminStorageFile;
}

function formatBytes(
  value: number | null,
): string {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "No disponible";
  }

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

export function StorageFileCard({
  file,
}: StorageFileCardProps) {
  const [isLoadingUrl, setIsLoadingUrl] =
    useState(false);

  const isImage =
    file.content_type
      ?.toLowerCase()
      .startsWith("image/") ?? false;

  const openFile = async () => {
    if (file.public_url) {
      window.open(
        file.public_url,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    setIsLoadingUrl(true);

    try {
      const response =
        await browserApiRequest<StorageSignedUrlResponse>(
          `/api/admin/storage/files/${file.id}/signed-url?expires_in_seconds=3600`,
        );

      window.open(
        response.url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible obtener la URL firmada.",
      );
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const Icon = isImage
    ? FileImage
    : File;

  return (
    <article className="overflow-hidden rounded-3xl border border-white/7 bg-black/20">
      <div className="flex aspect-[4/3] items-center justify-center border-b border-white/6 bg-[#070708]">
        <Icon
          size={42}
          className="text-red-400"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {file.original_filename ??
                `Archivo #${file.id}`}
            </p>

            <p className="mt-2 truncate font-mono text-[10px] text-zinc-700">
              {file.object_key}
            </p>
          </div>

          <span className="rounded-full border border-white/8 bg-black/30 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
            #{file.id}
          </span>
        </div>

        <dl className="mt-5 space-y-3 text-xs">
          <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
            <dt className="text-zinc-700">
              Proveedor
            </dt>
            <dd className="text-right text-zinc-400">
              {file.provider}
            </dd>
          </div>

          <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
            <dt className="text-zinc-700">
              Bucket
            </dt>
            <dd className="max-w-[65%] truncate text-right text-zinc-400">
              {file.bucket ?? "No disponible"}
            </dd>
          </div>

          <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
            <dt className="text-zinc-700">
              Tipo MIME
            </dt>
            <dd className="text-right text-zinc-400">
              {file.content_type ??
                "No disponible"}
            </dd>
          </div>

          <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
            <dt className="text-zinc-700">
              Tamaño
            </dt>
            <dd className="text-right text-zinc-400">
              {formatBytes(file.size_bytes)}
            </dd>
          </div>

          <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
            <dt className="text-zinc-700">
              Usuario
            </dt>
            <dd className="text-right text-zinc-400">
              {file.user_id
                ? `#${file.user_id}`
                : "Sistema"}
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-zinc-700">
              Creado
            </dt>
            <dd className="text-right text-zinc-400">
              {formatTryOnDate(
                file.created_at,
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void openFile()}
            disabled={isLoadingUrl}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-3 text-xs text-red-300 disabled:opacity-50"
          >
            {isLoadingUrl ? (
              <LoaderCircle
                size={14}
                className="animate-spin"
              />
            ) : file.public_url ? (
              <ExternalLink size={14} />
            ) : (
              <Link2 size={14} />
            )}

            {file.public_url
              ? "Abrir archivo"
              : "Generar URL"}
          </button>

          <TryOnCopyButton
            value={String(file.id)}
            label="Copiar ID"
          />
        </div>
      </div>
    </article>
  );
}
