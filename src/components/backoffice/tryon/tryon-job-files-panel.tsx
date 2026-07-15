"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ExternalLink,
  FileImage,
  ImageOff,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";

import { TryOnCopyButton } from "@/components/backoffice/tryon/tryon-copy-button";
import { browserApiRequest } from "@/lib/api/browser-api";
import {
  formatTryOnDate,
} from "@/lib/tryon/format";
import { cn } from "@/lib/utils";

import type {
  AdminStorageFile,
  StorageSignedUrlResponse,
} from "@/types/admin-storage";
import type {
  TryOnJobSummary,
} from "@/types/admin-tryon";

interface TryOnJobFilesPanelProps {
  job: TryOnJobSummary;
}

interface JobFileDescriptor {
  key: "person" | "item" | "result";
  label: string;
  description: string;
  fileId: number | null;
}

interface FilePreviewState {
  metadata: AdminStorageFile | null;
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
}

type PreviewMap = Record<
  JobFileDescriptor["key"],
  FilePreviewState
>;

const EMPTY_PREVIEW: FilePreviewState = {
  metadata: null,
  previewUrl: null,
  loading: false,
  error: null,
};

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

function isImageContentType(
  contentType: string | null,
): boolean {
  return Boolean(
    contentType?.toLowerCase().startsWith(
      "image/",
    ),
  );
}

function FilePreviewCard({
  descriptor,
  state,
}: {
  descriptor: JobFileDescriptor;
  state: FilePreviewState;
}) {
  const {
    fileId,
    label,
    description,
  } = descriptor;

  const metadata = state.metadata;

  const canPreview =
    Boolean(state.previewUrl) &&
    (
      metadata === null ||
      isImageContentType(
        metadata.content_type,
      )
    );

  return (
    <article className="overflow-hidden rounded-3xl border border-white/7 bg-black/20">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-white/6 bg-[#070708]">
        {state.loading && (
          <div className="text-center">
            <LoaderCircle className="mx-auto animate-spin text-red-500" />

            <p className="mt-3 text-xs text-zinc-600">
              Cargando archivo...
            </p>
          </div>
        )}

        {!state.loading &&
          fileId === null && (
            <div className="p-6 text-center">
              <ImageOff
                size={34}
                className="mx-auto text-zinc-700"
              />

              <p className="mt-4 text-sm text-zinc-600">
                El job todavía no tiene este
                archivo.
              </p>
            </div>
          )}

        {!state.loading &&
          fileId !== null &&
          canPreview && (
            <img
              src={state.previewUrl ?? undefined}
              alt={`${label} del job`}
              className="size-full object-contain"
            />
          )}

        {!state.loading &&
          fileId !== null &&
          !canPreview && (
            <div className="p-6 text-center">
              <FileImage
                size={38}
                className="mx-auto text-red-400"
              />

              <p className="mt-4 text-sm text-zinc-500">
                Vista previa no disponible
              </p>

              {state.error && (
                <p className="mt-2 text-xs leading-5 text-red-400">
                  {state.error}
                </p>
              )}
            </div>
          )}

        {fileId !== null && (
          <span className="absolute top-3 left-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 font-mono text-[10px] text-zinc-300 backdrop-blur">
            ID {fileId}
          </span>
        )}
      </div>

      <div className="p-5">
        <div>
          <p className="text-sm font-semibold text-white">
            {label}
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-600">
            {description}
          </p>
        </div>

        {fileId !== null && (
          <dl className="mt-5 space-y-3 text-xs">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">
                Nombre
              </dt>

              <dd className="max-w-[65%] truncate text-right text-zinc-400">
                {metadata?.original_filename ??
                  "No disponible"}
              </dd>
            </div>

            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">
                Tipo
              </dt>

              <dd className="text-right text-zinc-400">
                {metadata?.content_type ??
                  "No disponible"}
              </dd>
            </div>

            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">
                Tamaño
              </dt>

              <dd className="text-right text-zinc-400">
                {formatBytes(
                  metadata?.size_bytes ?? null,
                )}
              </dd>
            </div>

            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-zinc-700">
                Proveedor
              </dt>

              <dd className="text-right text-zinc-400">
                {metadata?.provider ??
                  "No disponible"}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt className="text-zinc-700">
                Registrado
              </dt>

              <dd className="text-right text-zinc-400">
                {formatTryOnDate(
                  metadata?.created_at,
                )}
              </dd>
            </div>
          </dl>
        )}

        {fileId !== null && (
          <div className="mt-5 flex flex-wrap gap-2">
            <TryOnCopyButton
              value={String(fileId)}
              label="Copiar ID"
            />

            {state.previewUrl && (
              <a
                href={state.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-3 text-xs text-red-300 transition hover:bg-red-950/30"
              >
                <ExternalLink size={14} />
                Abrir archivo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function TryOnJobFilesPanel({
  job,
}: TryOnJobFilesPanelProps) {
  const descriptors =
    useMemo<JobFileDescriptor[]>(
      () => [
        {
          key: "person",
          label: "Imagen de persona",
          description:
            "Imagen base utilizada para vestir al usuario.",
          fileId: job.person_image_file_id,
        },
        {
          key: "item",
          label: "Prenda o calzado",
          description:
            "Artículo de entrada aplicado por el workflow.",
          fileId: job.item_image_file_id,
        },
        {
          key: "result",
          label: "Resultado generado",
          description:
            "Archivo final producido por el trabajo Try-On.",
          fileId: job.result_file_id,
        },
      ],
      [
        job.person_image_file_id,
        job.item_image_file_id,
        job.result_file_id,
      ],
    );

  const [states, setStates] =
    useState<PreviewMap>({
      person: { ...EMPTY_PREVIEW },
      item: { ...EMPTY_PREVIEW },
      result: { ...EMPTY_PREVIEW },
    });

  const loadFiles = useCallback(async () => {
    const activeDescriptors =
      descriptors.filter(
        (
          descriptor,
        ): descriptor is JobFileDescriptor & {
          fileId: number;
        } => descriptor.fileId !== null,
      );

    setStates({
      person: {
        ...EMPTY_PREVIEW,
        loading:
          descriptors[0].fileId !== null,
      },
      item: {
        ...EMPTY_PREVIEW,
        loading:
          descriptors[1].fileId !== null,
      },
      result: {
        ...EMPTY_PREVIEW,
        loading:
          descriptors[2].fileId !== null,
      },
    });

    if (activeDescriptors.length === 0) {
      return;
    }

    let storageFiles: AdminStorageFile[] = [];

    try {
      storageFiles =
        await browserApiRequest<
          AdminStorageFile[]
        >(
          "/api/admin/storage/files?skip=0&limit=200",
        );
    } catch {
      storageFiles = [];
    }

    const entries =
      await Promise.all(
        activeDescriptors.map(
          async (descriptor) => {
            const metadata =
              storageFiles.find(
                (file) =>
                  file.id === descriptor.fileId,
              ) ?? null;

            try {
              const signed =
                await browserApiRequest<StorageSignedUrlResponse>(
                  `/api/admin/storage/files/${descriptor.fileId}/signed-url?expires_in_seconds=3600`,
                );

              return [
                descriptor.key,
                {
                  metadata,
                  previewUrl:
                    metadata?.public_url ??
                    signed.url,
                  loading: false,
                  error: null,
                },
              ] as const;
            } catch (error) {
              return [
                descriptor.key,
                {
                  metadata,
                  previewUrl:
                    metadata?.public_url ??
                    null,
                  loading: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : "No fue posible crear la URL firmada.",
                },
              ] as const;
            }
          },
        ),
      );

    setStates((current) => {
      const next: PreviewMap = {
        ...current,
      };

      for (const [key, value] of entries) {
        next[key] = value;
      }

      return next;
    });
  }, [descriptors]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  return (
    <section className="luxia-panel mt-5 rounded-3xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Archivos del job
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Entradas y resultado
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Las vistas previas usan URLs públicas o
            URLs firmadas temporales generadas por el
            backend.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadFiles()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white"
        >
          <RefreshCcw size={15} />
          Recargar archivos
        </button>
      </div>

      <div
        className={cn(
          "mt-6 grid gap-5",
          descriptors.length === 3
            ? "lg:grid-cols-3"
            : "lg:grid-cols-2",
        )}
      >
        {descriptors.map((descriptor) => (
          <FilePreviewCard
            key={descriptor.key}
            descriptor={descriptor}
            state={states[descriptor.key]}
          />
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/6 bg-black/20 p-4 text-xs leading-6 text-zinc-600">
        El endpoint de almacenamiento lista hasta 200
        archivos por consulta. Si un archivo no aparece
        en esa página, su vista previa puede seguir
        funcionando mediante la URL firmada, pero algunos
        metadatos se mostrarán como no disponibles.
      </div>
    </section>
  );
}
