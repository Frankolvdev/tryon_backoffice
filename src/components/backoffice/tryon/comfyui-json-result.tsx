"use client";

import {
  Check,
  Copy,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

interface ComfyUIJsonResultProps {
  title: string;
  value: unknown;
}

export function ComfyUIJsonResult({
  title,
  value,
}: ComfyUIJsonResultProps) {
  const [copied, setCopied] =
    useState(false);

  const formatted = useMemo(
    () => JSON.stringify(value, null, 2),
    [value],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        formatted,
      );

      setCopied(true);
      toast.success("JSON copiado.");

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
    <section className="overflow-hidden rounded-2xl border border-white/7 bg-black/20">
      <div className="flex items-center justify-between gap-4 border-b border-white/6 px-4 py-3">
        <p className="text-sm font-medium text-zinc-300">
          {title}
        </p>

        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/8 px-3 text-xs text-zinc-500 hover:text-white"
        >
          {copied ? (
            <Check size={13} />
          ) : (
            <Copy size={13} />
          )}

          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <pre className="max-h-[420px] overflow-auto p-4 font-mono text-xs leading-6 text-zinc-400">
        {formatted}
      </pre>
    </section>
  );
}
