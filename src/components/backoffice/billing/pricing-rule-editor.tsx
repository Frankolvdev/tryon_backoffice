"use client";

import {
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  PricingRuleCreate,
  PricingRuleResponse,
  PricingRuleUpdate,
} from "@/types/admin-pricing-coupons";

interface PricingRuleEditorProps {
  rule: PricingRuleResponse | null;
  onClose: () => void;
  onSaved: (
    rule: PricingRuleResponse,
  ) => void;
}

export function PricingRuleEditor({
  rule,
  onClose,
  onSaved,
}: PricingRuleEditorProps) {
  const isEditing = rule !== null;

  const [operationType, setOperationType] =
    useState(rule?.operation_type ?? "tryon");
  const [itemType, setItemType] =
    useState(rule?.item_type ?? "clothing");
  const [qualityMode, setQualityMode] =
    useState(rule?.quality_mode ?? "standard");
  const [tokensCost, setTokensCost] =
    useState(String(rule?.tokens_cost ?? 10));
  const [gpuSeconds, setGpuSeconds] =
    useState(
      String(rule?.estimated_gpu_seconds ?? 30),
    );
  const [gpuCostCents, setGpuCostCents] =
    useState(
      String(rule?.estimated_gpu_cost_cents ?? 1),
    );
  const [marginPercent, setMarginPercent] =
    useState(String(rule?.margin_percent ?? 70));
  const [isActive, setIsActive] =
    useState(rule?.is_active ?? true);
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setOperationType(
      rule?.operation_type ?? "tryon",
    );
    setItemType(rule?.item_type ?? "clothing");
    setQualityMode(
      rule?.quality_mode ?? "standard",
    );
    setTokensCost(
      String(rule?.tokens_cost ?? 10),
    );
    setGpuSeconds(
      String(rule?.estimated_gpu_seconds ?? 30),
    );
    setGpuCostCents(
      String(rule?.estimated_gpu_cost_cents ?? 1),
    );
    setMarginPercent(
      String(rule?.margin_percent ?? 70),
    );
    setIsActive(rule?.is_active ?? true);
  }, [rule]);

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const parsedTokens = Number(tokensCost);
    const parsedSeconds = Number(gpuSeconds);
    const parsedGpuCost = Number(gpuCostCents);
    const parsedMargin = Number(marginPercent);

    if (
      !Number.isInteger(parsedTokens) ||
      parsedTokens <= 0
    ) {
      toast.error(
        "El costo en tokens debe ser un entero mayor que cero.",
      );
      return;
    }

    if (
      !Number.isInteger(parsedSeconds) ||
      parsedSeconds < 0 ||
      !Number.isInteger(parsedGpuCost) ||
      parsedGpuCost < 0 ||
      !Number.isInteger(parsedMargin) ||
      parsedMargin < 0
    ) {
      toast.error(
        "GPU, costo y margen deben ser enteros no negativos.",
      );
      return;
    }

    const common = {
      tokens_cost: parsedTokens,
      estimated_gpu_seconds: parsedSeconds,
      estimated_gpu_cost_cents: parsedGpuCost,
      margin_percent: parsedMargin,
      is_active: isActive,
    };

    const payload:
      | PricingRuleCreate
      | PricingRuleUpdate = isEditing
      ? common
      : {
          operation_type: operationType.trim(),
          item_type: itemType.trim(),
          quality_mode: qualityMode.trim(),
          ...common,
        };

    setIsSaving(true);

    try {
      const response =
        await browserApiRequest<PricingRuleResponse>(
          isEditing
            ? `/api/admin/pricing-rules/${rule.id}`
            : "/api/admin/pricing-rules",
          {
            method: isEditing ? "PATCH" : "POST",
            body: JSON.stringify(payload),
          },
        );

      toast.success(
        isEditing
          ? "Regla actualizada."
          : "Regla creada.",
      );
      onSaved(response);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la regla.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="luxia-panel w-full max-w-3xl rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/6 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Pricing
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {isEditing
                ? "Editar regla"
                : "Nueva regla"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
          >
            <X size={17} />
          </button>
        </header>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Tipo de operación
            </span>
            <input
              value={operationType}
              disabled={isEditing}
              onChange={(event) =>
                setOperationType(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white disabled:opacity-50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Tipo de artículo
            </span>
            <input
              value={itemType}
              disabled={isEditing}
              onChange={(event) =>
                setItemType(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white disabled:opacity-50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Calidad
            </span>
            <input
              value={qualityMode}
              disabled={isEditing}
              onChange={(event) =>
                setQualityMode(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white disabled:opacity-50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Costo en tokens
            </span>
            <input
              type="number"
              min={1}
              value={tokensCost}
              onChange={(event) =>
                setTokensCost(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              GPU estimada (segundos)
            </span>
            <input
              type="number"
              min={0}
              value={gpuSeconds}
              onChange={(event) =>
                setGpuSeconds(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Costo GPU estimado (centavos)
            </span>
            <input
              type="number"
              min={0}
              value={gpuCostCents}
              onChange={(event) =>
                setGpuCostCents(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Margen objetivo (%)
            </span>
            <input
              type="number"
              min={0}
              value={marginPercent}
              onChange={(event) =>
                setMarginPercent(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
            Regla activa
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
              className="size-4 accent-red-700"
            />
          </label>
        </div>

        <footer className="flex justify-end border-t border-white/6 p-5">
          <button
            type="submit"
            disabled={isSaving}
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Save size={16} />
            )}
            Guardar regla
          </button>
        </footer>
      </form>
    </div>
  );
}
