"use client";

import {
  Download,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { AdminStorageFile } from "@/types/admin-storage";

interface StorageImageViewerProps {
  file: AdminStorageFile;
  onClose: () => void;
}

export function StorageImageViewer({
  file,
  onClose,
}: StorageImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const contentUrl = `/api/admin/storage/files/${file.id}/content`;
  const downloadUrl = `${contentUrl}?download=1`;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const changeScale = (nextScale: number) => {
    setScale(Math.min(8, Math.max(0.2, nextScale)));
  };

  const openFullscreen = async () => {
    await viewportRef.current?.requestFullscreen?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {file.original_filename ?? `Archivo #${file.id}`}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Zoom {Math.round(scale * 100)}% · arrastra para inspeccionar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => changeScale(scale - 0.2)} className="viewer-button" aria-label="Alejar">
            <Minus size={16} />
          </button>
          <button type="button" onClick={() => changeScale(scale + 0.2)} className="viewer-button" aria-label="Acercar">
            <Plus size={16} />
          </button>
          <button type="button" onClick={reset} className="viewer-button" aria-label="Restablecer">
            <RotateCcw size={16} />
          </button>
          <button type="button" onClick={() => void openFullscreen()} className="viewer-button" aria-label="Pantalla completa">
            <Maximize2 size={16} />
          </button>
          <a href={downloadUrl} className="viewer-button" aria-label="Descargar">
            <Download size={16} />
          </a>
          <button type="button" onClick={onClose} className="viewer-button" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
      </header>

      <div
        ref={viewportRef}
        className="relative flex min-h-0 flex-1 cursor-grab items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)] active:cursor-grabbing"
        onWheel={(event) => {
          event.preventDefault();
          changeScale(scale + (event.deltaY < 0 ? 0.15 : -0.15));
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragOrigin({ x: event.clientX - position.x, y: event.clientY - position.y });
        }}
        onPointerMove={(event) => {
          if (!dragOrigin) return;
          setPosition({ x: event.clientX - dragOrigin.x, y: event.clientY - dragOrigin.y });
        }}
        onPointerUp={() => setDragOrigin(null)}
        onPointerCancel={() => setDragOrigin(null)}
      >
        <img
          src={contentUrl}
          alt={file.original_filename ?? `Archivo ${file.id}`}
          draggable={false}
          className="max-h-[88vh] max-w-[92vw] select-none object-contain shadow-2xl"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center",
          }}
        />
      </div>

      <style jsx>{`
        .viewer-button {
          display: inline-flex;
          width: 2.5rem;
          height: 2.5rem;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgb(212 212 216);
        }
        .viewer-button:hover { background: rgba(255,255,255,0.09); color: white; }
      `}</style>
    </div>
  );
}
