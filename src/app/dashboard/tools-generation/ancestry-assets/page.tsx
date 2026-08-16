"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check, Download, Film, Image as ImageIcon, Loader2, Pause, Play, RefreshCcw, Search,
  Trash2, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import { ANCESTRY_CATALOG, type AncestryCatalogItem } from "@/lib/ancestry-country-catalog";
import type {
  AncestryMediaAsset,
  AncestryMediaAssetList,
  AncestryStorageMode,
  AncestryStorageOptions,
} from "@/types/ancestry-media-assets";
import styles from "./page.module.css";

const API = "/api/admin/tools-generation/ancestry-assets";

async function posterFromVideo(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    await new Promise<void>((ok, fail) => {
      video.onloadedmetadata = () => ok();
      video.onerror = () => fail(new Error("No se pudo leer el video."));
    });

    video.currentTime = Math.min(
      Math.max(video.duration * 0.15, 0.05),
      Math.max(video.duration - 0.05, 0.05),
    );
    await new Promise<void>((ok) => {
      video.onseeked = () => ok();
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((ok, fail) =>
      canvas.toBlob(
        (value) => value ? ok(value) : fail(new Error("No se pudo crear poster.")),
        "image/webp",
        0.9,
      ),
    );

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "")}-poster.webp`,
      { type: "image/webp" },
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function AncestryAssetsPage() {
  const [items, setItems] = useState<AncestryMediaAsset[]>([]);
  const [storage, setStorage] = useState<AncestryStorageOptions>({
    active_provider: "local",
    modes: ["auto", "local", "amazon_s3", "cloudflare_r2"],
  });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [selected, setSelected] = useState<AncestryCatalogItem>(ANCESTRY_CATALOG[0]);
  const [mode, setMode] = useState<AncestryStorageMode>("auto");
  const [busy, setBusy] = useState<number | "new" | null>(null);
  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const videoRefs = useRef(new Map<number, HTMLVideoElement>());

  function mediaMark(item: { flagEmoji?: string | null; countryCode?: string | null }) {
    const code = (item.countryCode || "").toUpperCase();
    if (code === "ARAB" || code === "AFR") {
      return <span className={styles.regionMark}>{code}</span>;
    }
    return <span className={styles.flag}>{item.flagEmoji || "🌐"}</span>;
  }

  async function toggleVideo(asset: AncestryMediaAsset) {
    if (!asset.video_url) return;
    const video = videoRefs.current.get(asset.id);
    if (!video) return;

    if (playingId === asset.id && !video.paused) {
      video.pause();
      setPlayingId(null);
      return;
    }

    for (const [id, other] of videoRefs.current.entries()) {
      if (id !== asset.id && !other.paused) {
        other.pause();
        other.currentTime = 0;
      }
    }

    try {
      await video.play();
      setPlayingId(asset.id);
    } catch {
      toast.error("El navegador no permitió reproducir el video.");
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, opts] = await Promise.all([
        browserApiRequest<AncestryMediaAssetList>(API),
        browserApiRequest<AncestryStorageOptions>(`${API}/storage-options`),
      ]);
      setItems(list.items);
      setStorage(opts);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar Ancestry Assets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const assetByKey = useMemo(
    () => new Map(items.map((item) => [item.ancestry_key, item])),
    [items],
  );

  const selectedAsset = assetByKey.get(selected.key) ?? null;

  useEffect(() => {
    if (selectedAsset) setMode(selectedAsset.storage_mode);
  }, [selectedAsset]);

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const source = needle
      ? ANCESTRY_CATALOG.filter((item) =>
          [
            item.displayName,
            item.countryName,
            item.countryCode,
            ...item.aliases,
          ].some((value) => value.toLowerCase().includes(needle)),
        )
      : ANCESTRY_CATALOG;

    return source.slice(0, needle ? 40 : 28);
  }, [query]);

  const activeLabel = useMemo(
    () => storage.active_provider.replaceAll("_", " "),
    [storage.active_provider],
  );

  function choose(item: AncestryCatalogItem) {
    setSelected(item);
    setQuery("");
    setOpenSearch(false);
    const existing = assetByKey.get(item.key);
    setMode(existing?.storage_mode ?? "auto");
  }

  async function createIfNeeded(): Promise<AncestryMediaAsset> {
    const existing = assetByKey.get(selected.key);
    if (existing) {
      if (existing.storage_mode !== mode) {
        return browserApiRequest<AncestryMediaAsset>(`${API}/${existing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ storage_mode: mode }),
        });
      }
      return existing;
    }

    return browserApiRequest<AncestryMediaAsset>(API, {
      method: "POST",
      body: JSON.stringify({
        ancestry_key: selected.key,
        display_name: selected.displayName,
        country_code: selected.countryCode || null,
        flag_emoji: selected.flagEmoji || null,
        latitude: selected.latitude,
        longitude: selected.longitude,
        sort_order: selected.sortOrder,
        storage_mode: mode,
        is_active: true,
        metadata: {
          country_name: selected.countryName,
          featured: selected.featured,
          catalog_key: selected.key,
        },
      }),
    });
  }

  async function upload(id: number, kind: "poster" | "video", file: File) {
    const fd = new FormData();
    fd.append("kind", kind);
    fd.append("file", file);
    return browserApiRequest<AncestryMediaAsset>(`${API}/${id}/media`, {
      method: "POST",
      body: fd,
    });
  }

  async function videoSelected(file: File) {
    setBusy(selectedAsset?.id ?? "new");
    setUploadStage("Preparando…");
    try {
      const asset = await createIfNeeded();

      setUploadStage("Preparando poster…");
      const poster = await posterFromVideo(file).catch(() => null);

      setUploadStage("Subiendo video…");
      await upload(asset.id, "video", file);

      if (poster) {
        setUploadStage("Subiendo poster…");
        await upload(asset.id, "poster", poster);
      }

      setUploadStage("Finalizando…");
      toast.success(
        poster
          ? `${selected.displayName}: video y poster automático guardados.`
          : `${selected.displayName}: video guardado; puedes subir poster manualmente.`,
      );
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir el video.");
    } finally {
      setUploadStage(null);
      setBusy(null);
    }
  }

  async function posterSelected(asset: AncestryMediaAsset, file: File) {
    setBusy(asset.id);
    setUploadStage("Subiendo poster…");
    try {
      await upload(asset.id, "poster", file);
      toast.success("Poster actualizado.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir el poster.");
    } finally {
      setUploadStage(null);
      setBusy(null);
    }
  }

  async function patch(id: number, body: Record<string, unknown>) {
    setBusy(id);
    try {
      await browserApiRequest(`${API}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar este asset y sus archivos?")) return;
    try {
      await browserApiRequest(`${API}/${id}`, { method: "DELETE" });
      toast.success("Eliminado.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar.");
    }
  }

  async function importZip(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const fd = new FormData();
    fd.append("archive", file);
    fd.append("target", mode);

    try {
      await browserApiRequest(`${API}/import/zip`, { method: "POST", body: fd });
      toast.success("ZIP importado.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo importar.");
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>TOOLS GENERATION · FACE STUDIO</span>
          <h1>Ascendencias de rostro</h1>
          <p>
            El catálogo ya incluye las ascendencias destacadas y el catálogo mundial.
            Busca, selecciona y sube el video. Código, bandera y ubicación se completan automáticamente.
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.ghost} onClick={() => void load()}>
            <RefreshCcw size={15} /> Actualizar
          </button>
          <a className={styles.ghost} href="/api/admin/tools-generation/ancestry-assets-export">
            <Download size={15} /> Exportar ZIP
          </a>
          <label className={`${styles.ghost} ${styles.upload}`}>
            <Upload size={15} /> Importar ZIP
            <input type="file" accept=".zip" onChange={importZip} />
          </label>
        </div>
      </section>

      <section className={styles.selectorPanel}>
        <div className={styles.searchBlock}>
          <label>Buscar ascendencia o país</label>
          <div className={styles.searchInput}>
            <Search size={17} />
            <input
              value={query}
              placeholder="Ej. Russian, Japan, Mexico, Germany..."
              onFocus={() => setOpenSearch(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpenSearch(true);
              }}
            />
          </div>

          {openSearch && (
            <div className={styles.results}>
              {searchResults.map((item) => {
                const uploaded = assetByKey.has(item.key);
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={`${styles.result} ${selected.key === item.key ? styles.resultActive : ""}`}
                    onClick={() => choose(item)}
                  >
                    {mediaMark({ flagEmoji: item.flagEmoji, countryCode: item.countryCode })}
                    <span className={styles.resultCopy}>
                      <strong>{item.displayName}</strong>
                      <small>
                        {item.countryName}
                        {item.countryCode ? ` · ${item.countryCode}` : ""}
                      </small>
                    </span>
                    {item.featured && <span className={styles.featured}>DESTACADA</span>}
                    {uploaded && <Check size={15} className={styles.ready} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.selectedCard}>
          <div className={styles.selectedIdentity}>
            <div className={styles.selectedFlag}>{mediaMark({ flagEmoji: selected.flagEmoji, countryCode: selected.countryCode })}</div>
            <div>
              <span className={styles.selectedKicker}>
                {selected.featured ? "ASCENDENCIA DESTACADA" : "CATÁLOGO"}
              </span>
              <h2>{selected.displayName}</h2>
              <p>
                {selected.countryName}
                {selected.countryCode ? ` · ${selected.countryCode}` : ""}
              </p>
            </div>
          </div>

          <div className={styles.selectedState}>
            <span className={selectedAsset?.video_url ? styles.stateReady : styles.statePending}>
              {selectedAsset?.video_url ? "Video listo" : "Sin video"}
            </span>
          </div>
        </div>

        <div className={styles.uploadControls}>
          <label>
            Destino de storage
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as AncestryStorageMode)}
            >
              {storage.modes.map((value) => (
                <option key={value} value={value}>
                  {value === "auto" ? `Automatic (${activeLabel})` : value}
                </option>
              ))}
            </select>
          </label>

          <label
            className={`${styles.videoButton} ${styles.upload} ${busy !== null ? styles.uploadDisabled : ""}`}
            aria-disabled={busy !== null}
          >
            {busy !== null ? <Loader2 size={17} className={styles.spinner} /> : <Film size={17} />}
            {busy !== null
              ? (uploadStage || "Procesando…")
              : (selectedAsset?.video_url ? "Reemplazar video" : "Subir video")}
            <input
              type="file"
              accept="video/mp4,video/webm"
              disabled={busy !== null}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void videoSelected(file);
              }}
            />
          </label>
        </div>

        <p className={styles.help}>
          Al subir el video se crea automáticamente el registro si todavía no existe y se genera su poster WebP.
        </p>
      </section>

      <section className={styles.libraryHeader}>
        <div>
          <span className={styles.eyebrow}>BIBLIOTECA CARGADA</span>
          <h2>{items.length} ascendencias con registro</h2>
        </div>
      </section>

      {loading ? (
        <div className={styles.empty}>Cargando biblioteca…</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          Todavía no hay videos. Busca una ascendencia arriba y sube el primero.
        </div>
      ) : (
        <section className={styles.cards}>
          {items.map((asset) => (
            <article className={styles.card} key={asset.id}>
              <button
                type="button"
                className={`${styles.media} ${asset.video_url ? styles.mediaPlayable : ""}`}
                onClick={() => void toggleVideo(asset)}
                disabled={!asset.video_url}
                aria-label={asset.video_url ? `${playingId === asset.id ? "Pausar" : "Reproducir"} ${asset.display_name}` : asset.display_name}
              >
                {asset.video_url ? (
                  <video
                    ref={(node) => {
                      if (node) videoRefs.current.set(asset.id, node);
                      else videoRefs.current.delete(asset.id);
                    }}
                    src={asset.video_url}
                    poster={asset.poster_url || undefined}
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    onPause={() => {
                      if (playingId === asset.id) setPlayingId(null);
                    }}
                    onEnded={() => setPlayingId(null)}
                  />
                ) : asset.poster_url ? (
                  <img src={asset.poster_url} alt={asset.display_name} />
                ) : (
                  <ImageIcon size={30} />
                )}

                <span className={styles.badge}>
                  {asset.country_code === "ARAB" || asset.country_code === "AFR"
                    ? <span className={styles.regionMark}>{asset.country_code}</span>
                    : <span className={styles.flag}>{asset.flag_emoji || "🌐"}</span>}
                  {asset.display_name}
                </span>

                {asset.video_url && (
                  <span className={styles.playOverlay}>
                    {playingId === asset.id ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  </span>
                )}
              </button>

              <div className={styles.body}>
                <div className={styles.title}>
                  <div>
                    <h3>{asset.display_name}</h3>
                    <div className={styles.meta}>
                      {asset.country_code || "REGION"} · {asset.storage_mode}
                    </div>
                  </div>
                  <span className={asset.video_url ? styles.stateReady : styles.statePending}>
                    {asset.video_url ? "VIDEO" : "PENDIENTE"}
                  </span>
                </div>

                <div className={styles.row}>
                  <select
                    value={asset.storage_mode}
                    disabled={busy === asset.id}
                    onChange={(event) =>
                      void patch(asset.id, {
                        storage_mode: event.target.value as AncestryStorageMode,
                      })
                    }
                  >
                    {storage.modes.map((value) => (
                      <option key={value} value={value}>
                        {value === "auto" ? `Automatic (${activeLabel})` : value}
                      </option>
                    ))}
                  </select>

                  <label className={`${styles.ghost} ${styles.upload} ${busy === asset.id ? styles.uploadDisabled : ""}`}>
                    {busy === asset.id ? <Loader2 size={14} className={styles.spinner} /> : <Film size={14} />}
                    {busy === asset.id ? (uploadStage || "Procesando…") : "Video"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      disabled={busy !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) {
                          choose(
                            ANCESTRY_CATALOG.find((entry) => entry.key === asset.ancestry_key) ??
                              {
                                key: asset.ancestry_key,
                                displayName: asset.display_name,
                                countryName: asset.display_name,
                                countryCode: asset.country_code || "",
                                flagEmoji: asset.flag_emoji || "🌐",
                                latitude: asset.latitude,
                                longitude: asset.longitude,
                                aliases: [],
                                featured: false,
                                sortOrder: asset.sort_order,
                              },
                          );
                          setTimeout(() => void videoSelected(file), 0);
                        }
                      }}
                    />
                  </label>

                  <label className={`${styles.ghost} ${styles.upload} ${busy === asset.id ? styles.uploadDisabled : ""}`}>
                    {busy === asset.id ? <Loader2 size={14} className={styles.spinner} /> : <ImageIcon size={14} />}
                    {busy === asset.id ? (uploadStage || "Procesando…") : "Poster"}
                    <input
                      type="file"
                      accept="image/webp,image/jpeg,image/png"
                      disabled={busy !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void posterSelected(asset, file);
                      }}
                    />
                  </label>

                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={asset.is_active}
                      onChange={(event) =>
                        void patch(asset.id, { is_active: event.target.checked })
                      }
                    />
                    Visible
                  </label>

                  <button className={styles.danger} onClick={() => void remove(asset.id)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
