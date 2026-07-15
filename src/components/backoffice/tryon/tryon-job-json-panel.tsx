"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Search,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import type {
  TryOnJobSummary,
} from "@/types/admin-tryon";

interface TryOnJobJsonPanelProps {
  job: TryOnJobSummary;
}

function downloadJson(
  filename: string,
  content: string,
): void {
  const blob = new Blob(
    [content],
    {
      type: "application/json;charset=utf-8",
    },
  );

  const url = URL.createObjectURL(blob);
  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function TryOnJobJsonPanel({
  job,
}: TryOnJobJsonPanelProps) {
  const [expanded, setExpanded] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const formattedJson = useMemo(
    () => JSON.stringify(job, null, 2),
    [job],
  );

  const visibleJson = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return formattedJson;
    }

    return formattedJson
      .split("\n")
      .filter((line) =>
        line
          .toLowerCase()
          .includes(normalizedSearch),
      )
      .join("\n");
  }, [formattedJson, search]);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(
        formattedJson,
      );

      setCopied(true);
      toast.success(
        "JSON copiado correctamente.",
      );

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      toast.error(
        "No fue posible copiar el JSON.",
      );
    }
  };

  return (
    <section className="luxia-panel mt-5 overflow-hidden rounded-3xl">
      <div className="flex flex-col gap-4 border-b border-white/6 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Datos técnicos
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            JSON completo del job
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Representación exacta de la respuesta
            recibida desde el endpoint administrativo
            del trabajo Try-On.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void copyJson()
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white"
          >
            {copied ? (
              <Check size={15} />
            ) : (
              <Copy size={15} />
            )}

            {copied
              ? "Copiado"
              : "Copiar JSON"}
          </button>

          <button
            type="button"
            onClick={() =>
              downloadJson(
                `tryon-job-${job.id}.json`,
                formattedJson,
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300 transition hover:bg-red-950/30"
          >
            <Download size={15} />
            Descargar
          </button>

          <button
            type="button"
            onClick={() =>
              setExpanded(
                (current) => !current,
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 transition hover:text-white"
          >
            {expanded ? (
              <ChevronUp size={15} />
            ) : (
              <ChevronDown size={15} />
            )}

            {expanded
              ? "Contraer"
              : "Expandir"}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          <Search
            size={16}
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
            placeholder="Buscar claves o valores dentro del JSON..."
            className="h-11 w-full rounded-xl border border-white/7 bg-black/30 pr-4 pl-11 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-500/40"
          />
        </div>

        <div
          className={
            expanded
              ? "mt-5 max-h-none overflow-auto rounded-2xl border border-white/7 bg-[#060607]"
              : "mt-5 max-h-[420px] overflow-auto rounded-2xl border border-white/7 bg-[#060607]"
          }
        >
          <pre className="min-w-max p-5 font-mono text-xs leading-6 text-zinc-400">
            {visibleJson ||
              "No existen coincidencias para la búsqueda actual."}
          </pre>
        </div>

        <p className="mt-4 text-xs leading-6 text-zinc-700">
          La búsqueda filtra líneas visibles, pero
          copiar y descargar siempre utilizan el JSON
          completo original.
        </p>
      </div>
    </section>
  );
}
