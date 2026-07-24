"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowLeft,
  Copy,
  Download,
  File,
  Folder,
  FolderPlus,
  HardDrive,
  Move,
  Pencil,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  DockerBrowse,
  DockerEntry,
  DockerVolume,
} from "@/types/admin-docker-file-manager";

const btn =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-40";

type UploadProgressState = {
  currentFile: string;
  currentFileIndex: number;
  totalFiles: number;
  filePercent: number;
  totalPercent: number;
  uploadedBytes: number;
  totalBytes: number;
};

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function uploadFileWithProgress(
  form: FormData,
  onProgress: (loaded: number, total: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/docker-file-manager/upload");
    request.withCredentials = true;

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded, event.total);
    };

    request.onerror = () => reject(new Error("La conexión se interrumpió durante la subida."));
    request.onabort = () => reject(new Error("La subida fue cancelada."));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      let message = `No fue posible subir el archivo (${request.status}).`;
      try {
        const body = JSON.parse(request.responseText) as {
          detail?: string;
          message?: string;
        };
        message = body.detail || body.message || message;
      } catch {
        if (request.responseText) message = request.responseText;
      }
      reject(new Error(message));
    };

    request.send(form);
  });
}

export function DockerFileManager() {
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [volume, setVolume] = useState("");
  const [path, setPath] = useState("");
  const [entries, setEntries] = useState<DockerEntry[]>([]);
  const [selected, setSelected] = useState<DockerEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgressState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadVolumes = useCallback(async () => {
    setLoadingMessage("Cargando volúmenes Docker…");
    const response = await browserApiRequest<{ items: DockerVolume[] }>(
      "/api/admin/docker-file-manager/volumes",
    );
    setVolumes(response.items);
    setVolume((current) =>
      current && response.items.some((item) => item.name === current)
        ? current
        : response.items[0]?.name || "",
    );
    setLoadingMessage("");
    return response.items;
  }, []);

  const browse = useCallback(async (selectedVolume = volume, selectedPath = path) => {
    if (!selectedVolume) {
      setLoadingMessage("");
      setEntries([]);
      setSelected(null);
      return;
    }
    setLoadingMessage(selectedPath ? `Abriendo ${selectedPath}…` : `Abriendo ${selectedVolume}…`);
    const response = await browserApiRequest<DockerBrowse>(
      `/api/admin/docker-file-manager/browse?volume=${encodeURIComponent(selectedVolume)}&path=${encodeURIComponent(selectedPath)}`,
    );
    setEntries(response.items);
    setSelected(null);
    setLoadingMessage("");
  }, [path, volume]);

  useEffect(() => {
    void loadVolumes().catch((error: Error) => toast.error(error.message));
  }, [loadVolumes]);

  useEffect(() => {
    void browse(volume, path).catch((error: Error) => toast.error(error.message));
  }, [browse, path, volume]);

  const parent = useMemo(
    () => path.split("/").filter(Boolean).slice(0, -1).join("/"),
    [path],
  );

  const action = async (
    fn: () => Promise<unknown>,
    message: string,
    pendingMessage = "Procesando operación…",
  ) => {
    setBusy(true);
    setLoadingMessage(pendingMessage);
    try {
      await fn();
      toast.success(message);
      await loadVolumes();
      await browse();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operación fallida");
    } finally {
      setBusy(false);
      setLoadingMessage("");
    }
  };

  const createVolume = () => {
    const name = window.prompt("Nombre del nuevo volumen Docker:");
    if (!name) return;
    void action(
      () =>
        browserApiRequest("/api/admin/docker-file-manager/volumes", {
          method: "POST",
          body: JSON.stringify({
            name,
            driver: "local",
            labels: { "tryon.managed": "true" },
          }),
        }),
      "Volumen creado.",
      "Creando volumen Docker…",
    );
  };

  const deleteVolume = async () => {
    if (!volume || !window.confirm(`¿Eliminar definitivamente el volumen ${volume}?`)) {
      return;
    }

    const volumeToDelete = volume;
    setBusy(true);
    setLoadingMessage(`Eliminando volumen ${volumeToDelete}…`);
    try {
      await browserApiRequest(
        `/api/admin/docker-file-manager/volumes/${encodeURIComponent(volumeToDelete)}?force=true`,
        { method: "DELETE" },
      );

      // Clear the deleted volume before any browse request. Mounting a missing named
      // volume with `docker run -v name:/data` would recreate it automatically.
      setVolume("");
      setPath("");
      setEntries([]);
      setSelected(null);

      const remainingVolumes = await loadVolumes();
      const nextVolume = remainingVolumes[0]?.name || "";
      if (nextVolume) {
        setVolume(nextVolume);
        await browse(nextVolume, "");
      }
      toast.success("Volumen eliminado definitivamente.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No fue posible eliminar el volumen.",
      );
    } finally {
      setBusy(false);
      setLoadingMessage("");
    }
  };

  const createFolder = () => {
    const name = window.prompt("Nombre de la carpeta:");
    if (!name) return;
    void action(
      () =>
        browserApiRequest("/api/admin/docker-file-manager/directories", {
          method: "POST",
          body: JSON.stringify({
            volume,
            path: [path, name].filter(Boolean).join("/"),
            parents: true,
          }),
        }),
      "Carpeta creada.",
      "Creando carpeta…",
    );
  };

  const removeSelected = () => {
    if (!selected || !window.confirm(`¿Eliminar ${selected.name}?`)) return;
    void action(
      () =>
        browserApiRequest(
          `/api/admin/docker-file-manager/paths?volume=${encodeURIComponent(volume)}&path=${encodeURIComponent(selected.path)}`,
          { method: "DELETE" },
        ),
      "Elemento eliminado.",
      `Eliminando ${selected.name}…`,
    );
  };

  const upload = async (fileList: FileList | null) => {
    if (!fileList?.length || !volume) return;

    const files = Array.from(fileList);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let completedBytes = 0;
    setBusy(true);
    setLoadingMessage("Preparando subida…");

    try {
      for (const [index, file] of files.entries()) {
        const form = new FormData();
        form.set("volume", volume);
        form.set("path", [path, file.name].filter(Boolean).join("/"));
        form.set("overwrite", "true");
        form.set("file", file);

        setLoadingMessage(`Subiendo ${file.name}…`);
        setUploadProgress({
          currentFile: file.name,
          currentFileIndex: index + 1,
          totalFiles: files.length,
          filePercent: 0,
          totalPercent:
            totalBytes > 0 ? Math.round((completedBytes / totalBytes) * 100) : 0,
          uploadedBytes: completedBytes,
          totalBytes,
        });

        await uploadFileWithProgress(form, (loaded, requestTotal) => {
          const fileTotal = requestTotal || file.size;
          const overallLoaded = completedBytes + Math.min(loaded, file.size);
          setUploadProgress({
            currentFile: file.name,
            currentFileIndex: index + 1,
            totalFiles: files.length,
            filePercent:
              fileTotal > 0 ? Math.min(100, Math.round((loaded / fileTotal) * 100)) : 0,
            totalPercent:
              totalBytes > 0
                ? Math.min(100, Math.round((overallLoaded / totalBytes) * 100))
                : 0,
            uploadedBytes: overallLoaded,
            totalBytes,
          });
        });

        completedBytes += file.size;
      }

      setUploadProgress((current) =>
        current
          ? {
              ...current,
              filePercent: 100,
              totalPercent: 100,
              uploadedBytes: totalBytes,
            }
          : current,
      );
      toast.success(
        files.length === 1
          ? `Archivo ${files[0].name} subido correctamente.`
          : `${files.length} archivos subidos correctamente.`,
      );
      await browse(volume, path);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible subir el archivo.");
    } finally {
      setBusy(false);
      setLoadingMessage("");
      window.setTimeout(() => setUploadProgress(null), 1200);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const download = () => {
    if (selected?.type !== "file") return;
    window.location.href = `/api/admin/docker-file-manager/download?volume=${encodeURIComponent(volume)}&path=${encodeURIComponent(selected.path)}`;
  };

  const renameSelected = () => {
    if (!selected) return;
    const name = window.prompt("Nuevo nombre:", selected.name);
    if (!name || name === selected.name) return;
    void action(
      () =>
        browserApiRequest("/api/admin/docker-file-manager/rename", {
          method: "POST",
          body: JSON.stringify({ volume, path: selected.path, new_name: name }),
        }),
      "Elemento renombrado.",
      `Renombrando ${selected.name}…`,
    );
  };

  const crumbs = useMemo(() => {
    const parts = path.split("/").filter(Boolean);
    return [
      { label: volume, path: "" },
      ...parts.map((part, index) => ({
        label: part,
        path: parts.slice(0, index + 1).join("/"),
      })),
    ];
  }, [path, volume]);

  const transfer = (operation: "copy" | "move") => {
    if (!selected) return;
    const destination = window.prompt(
      `Ruta destino para ${operation === "copy" ? "copiar" : "mover"}:`,
      selected.path,
    );
    if (!destination) return;
    void action(
      () =>
        browserApiRequest("/api/admin/docker-file-manager/transfer", {
          method: "POST",
          body: JSON.stringify({
            source_volume: volume,
            source_path: selected.path,
            destination_volume: volume,
            destination_path: destination,
            overwrite: false,
            operation,
          }),
        }),
      operation === "copy" ? "Elemento copiado." : "Elemento movido.",
      operation === "copy" ? `Copiando ${selected.name}…` : `Moviendo ${selected.name}…`,
    );
  };

  return (
    <div className="space-y-5">
      <section className="luxia-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/25 text-red-400">
              <HardDrive />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-red-500">
                Infraestructura Docker
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Docker File Manager</h1>
              <p className="mt-2 text-sm text-zinc-500">
                Administra volúmenes y archivos sin copiar el volumen completo al host.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={btn}
              disabled={busy || Boolean(loadingMessage)}
              onClick={() => {
                setLoadingMessage("Actualizando volúmenes y carpeta…");
                void loadVolumes()
                  .then((items) => {
                    const current = items.some((item) => item.name === volume)
                      ? volume
                      : items[0]?.name || "";
                    return browse(current, current === volume ? path : "");
                  })
                  .catch((error: Error) => toast.error(error.message))
                  .finally(() => setLoadingMessage(""));
              }}
            >
              {loadingMessage ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCcw size={15} />}Actualizar
            </button>
            <button
              className="luxia-red-glow inline-flex h-10 items-center gap-2 rounded-xl bg-red-700 px-3 text-sm font-semibold text-white"
              disabled={busy || Boolean(loadingMessage)}
              onClick={createVolume}
            >
              <Plus size={15} />Crear volumen
            </button>
          </div>
        </div>
      </section>

      {loadingMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-950/15 px-4 py-3 text-sm text-zinc-200" role="status" aria-live="polite">
          <LoaderCircle size={17} className="animate-spin text-red-400" />
          <span>{loadingMessage}</span>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <aside className="luxia-panel rounded-3xl p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Volúmenes Docker</h2>
          <div className="space-y-2">
            {volumes.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setVolume(item.name);
                  setPath("");
                }}
                className={`w-full rounded-xl border p-3 text-left ${
                  volume === item.name
                    ? "border-red-500/30 bg-red-950/20"
                    : "border-white/7 bg-black/20"
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-white">
                  <Archive size={15} />{item.name}
                </div>
                <div className="mt-1 text-xs text-zinc-600">{item.driver}</div>
              </button>
            ))}
          </div>
          {volume && (
            <button
              disabled={busy}
              onClick={() => void deleteVolume()}
              className="mt-4 inline-flex items-center gap-2 text-sm text-red-400 disabled:opacity-40"
            >
              <Trash2 size={14} />Eliminar volumen
            </button>
          )}
        </aside>

        <main className="luxia-panel rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <button disabled={!path} onClick={() => setPath(parent)} className={btn}>
                <ArrowLeft size={15} />
              </button>
              <div className="flex flex-wrap items-center gap-1">
                {crumbs.map((crumb, index) => (
                  <span key={`${crumb.path}-${index}`} className="flex items-center gap-1">
                    <button
                      onClick={() => setPath(crumb.path)}
                      className="rounded-lg px-2 py-1 text-zinc-300 hover:bg-white/5"
                    >
                      {crumb.label || "Sin volumen"}
                    </button>
                    {index < crumbs.length - 1 && <span className="text-zinc-700">/</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={!volume || busy} className={btn} onClick={createFolder}>
                <FolderPlus size={15} />Carpeta
              </button>
              <button
                disabled={!volume || busy}
                className={btn}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={15} />Subir
              </button>
              <input
                ref={fileRef}
                hidden
                type="file"
                multiple
                onChange={(event) => void upload(event.target.files)}
              />
              <button disabled={!selected || busy} className={btn} onClick={renameSelected}>
                <Pencil size={15} />Renombrar
              </button>
              <button disabled={!selected || busy} className={btn} onClick={() => transfer("copy")}>
                <Copy size={15} />Copiar
              </button>
              <button disabled={!selected || busy} className={btn} onClick={() => transfer("move")}>
                <Move size={15} />Mover
              </button>
              <button disabled={selected?.type !== "file" || busy} className={btn} onClick={download}>
                <Download size={15} />Descargar
              </button>
              <button disabled={!selected || busy} className={btn} onClick={removeSelected}>
                <Trash2 size={15} />Eliminar
              </button>
            </div>
          </div>

          {uploadProgress && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-950/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium text-white">
                    Subiendo {uploadProgress.currentFileIndex} de {uploadProgress.totalFiles}
                  </p>
                  <p className="mt-1 break-all text-xs text-zinc-400">
                    {uploadProgress.currentFile}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-300">{uploadProgress.totalPercent}%</p>
                  <p className="text-xs text-zinc-500">
                    {formatBytes(uploadProgress.uploadedBytes)} de {formatBytes(uploadProgress.totalBytes)}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-red-600 transition-[width] duration-150"
                  style={{ width: `${uploadProgress.totalPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Progreso del archivo actual: {uploadProgress.filePercent}%
              </p>
            </div>
          )}

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/8">
            <div className="grid grid-cols-[1fr_120px_150px] bg-white/[.03] px-4 py-3 text-xs uppercase tracking-wide text-zinc-600">
              <span>Nombre</span><span>Tipo</span><span>Tamaño</span>
            </div>
            {loadingMessage && volume ? (
              <div className="flex items-center justify-center gap-3 py-16 text-zinc-500">
                <LoaderCircle size={18} className="animate-spin" />
                Cargando contenido…
              </div>
            ) : entries.length === 0 ? (
              <div className="py-16 text-center text-zinc-600">Carpeta vacía</div>
            ) : (
              entries.map((item) => (
                <button
                  key={item.path}
                  onDoubleClick={() => item.type === "directory" && setPath(item.path)}
                  onClick={() => setSelected(item)}
                  className={`grid w-full grid-cols-[1fr_120px_150px] items-center border-t border-white/5 px-4 py-3 text-left text-sm ${
                    selected?.path === item.path ? "bg-red-950/20" : "hover:bg-white/[.02]"
                  }`}
                >
                  <span className="flex items-center gap-2 text-zinc-200">
                    {item.type === "directory" ? (
                      <Folder size={16} className="text-amber-300" />
                    ) : (
                      <File size={16} className="text-zinc-500" />
                    )}
                    {item.name}
                  </span>
                  <span className="text-zinc-500">{item.type}</span>
                  <span className="text-zinc-500">
                    {item.type === "directory" ? "—" : formatBytes(item.size)}
                  </span>
                </button>
              ))
            )}
          </div>

          {selected && (
            <div className="mt-4 grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-zinc-600">Seleccionado</p>
                <p className="mt-1 break-all text-zinc-200">{selected.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-zinc-600">Ruta</p>
                <p className="mt-1 break-all text-zinc-400">{selected.path}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-zinc-600">Tamaño</p>
                <p className="mt-1 text-zinc-400">
                  {selected.type === "directory" ? "Carpeta" : formatBytes(selected.size)}
                </p>
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
