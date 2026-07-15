"use client";

import {
  Check,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TryOnCopyButtonProps {
  value: string;
  label?: string;
}

export function TryOnCopyButton({
  value,
  label = "Copiar",
}: TryOnCopyButtonProps) {
  const [copied, setCopied] =
    useState(false);

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Valor copiado.");

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      toast.error(
        "No fue posible copiar el valor.",
      );
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copyValue()}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-3 text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
    >
      {copied ? (
        <Check size={14} />
      ) : (
        <Copy size={14} />
      )}

      {copied ? "Copiado" : label}
    </button>
  );
}
