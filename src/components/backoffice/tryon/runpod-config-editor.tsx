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
  RunPodConfigCreate,
  RunPodConfigResponse,
  RunPodConfigUpdate,
} from "@/types/admin-runpod";

interface RunPodConfigEditorProps {
  config?: RunPodConfigResponse | null;
  onSaved: () => Promise<void> | void;
  onCancel?: () => void;
}

interface TextFieldDefinition {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
}

function nullable(
  value: string,
): string | null {
  return value.trim() || null;
}

export function RunPodConfigEditor({
  config,
  onSaved,
  onCancel,
}: RunPodConfigEditorProps) {
  const [name, setName] =
    useState("");

  const [endpointId, setEndpointId] =
    useState("");

  const [endpointUrl, setEndpointUrl] =
    useState("");

  const [gpuType, setGpuType] =
    useState("");

  const [dockerImage, setDockerImage] =
    useState("");

  const [workflowName, setWorkflowName] =
    useState("");

  const [minWorkers, setMinWorkers] =
    useState("0");

  const [maxWorkers, setMaxWorkers] =
    useState("3");

  const [cost, setCost] =
    useState("1");

  const [isActive, setIsActive] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setName(config?.name ?? "");
    setEndpointId(
      config?.endpoint_id ?? "",
    );
    setEndpointUrl(
      config?.endpoint_url ?? "",
    );
    setGpuType(
      config?.gpu_type ?? "",
    );
    setDockerImage(
      config?.docker_image ?? "",
    );
    setWorkflowName(
      config?.comfy_workflow_name ?? "",
    );
    setMinWorkers(
      String(config?.min_workers ?? 0),
    );
    setMaxWorkers(
      String(config?.max_workers ?? 3),
    );
    setCost(
      String(
        config
          ?.estimated_cost_per_second_cents ??
          1,
      ),
    );
    setIsActive(
      config?.is_active ?? true,
    );
  }, [config]);

  const textFields: TextFieldDefinition[] = [
    {
      label: "Nombre",
      value: name,
      setValue: setName,
      placeholder: "Producción RunPod",
    },
    {
      label: "Endpoint ID",
      value: endpointId,
      setValue: setEndpointId,
      placeholder: "abc123",
    },
    {
      label: "Endpoint URL",
      value: endpointUrl,
      setValue: setEndpointUrl,
      placeholder:
        "https://api.runpod.ai/...",
    },
    {
      label: "GPU",
      value: gpuType,
      setValue: setGpuType,
      placeholder: "NVIDIA RTX 4090",
    },
    {
      label: "Imagen Docker",
      value: dockerImage,
      setValue: setDockerImage,
      placeholder: "usuario/imagen:tag",
    },
    {
      label: "Workflow ComfyUI",
      value: workflowName,
      setValue: setWorkflowName,
      placeholder: "tryon.json",
    },
  ];

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const minimum =
      Number.parseInt(
        minWorkers,
        10,
      );

    const maximum =
      Number.parseInt(
        maxWorkers,
        10,
      );

    const cents =
      Number.parseInt(
        cost,
        10,
      );

    if (name.trim().length < 2) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    if (
      !Number.isInteger(minimum) ||
      minimum < 0 ||
      !Number.isInteger(maximum) ||
      maximum < 1 ||
      maximum < minimum
    ) {
      toast.error(
        "Revisa min_workers y max_workers.",
      );
      return;
    }

    if (
      !Number.isInteger(cents) ||
      cents < 0
    ) {
      toast.error(
        "El costo estimado debe ser un entero mayor o igual a cero.",
      );
      return;
    }

    setIsSaving(true);

    try {
      if (config) {
        const payload: RunPodConfigUpdate = {
          name: name.trim(),
          endpoint_id:
            nullable(endpointId),
          endpoint_url:
            nullable(endpointUrl),
          gpu_type:
            nullable(gpuType),
          docker_image:
            nullable(dockerImage),
          comfy_workflow_name:
            nullable(workflowName),
          min_workers: minimum,
          max_workers: maximum,
          estimated_cost_per_second_cents:
            cents,
          is_active: isActive,
        };

        await browserApiRequest<RunPodConfigResponse>(
          `/api/admin/runpod-configs/${config.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              payload,
            ),
          },
        );

        toast.success(
          "Configuración RunPod actualizada.",
        );
      } else {
        const payload: RunPodConfigCreate = {
          name: name.trim(),
          mode: "serverless",
          endpoint_id:
            nullable(endpointId),
          endpoint_url:
            nullable(endpointUrl),
          gpu_type:
            nullable(gpuType),
          docker_image:
            nullable(dockerImage),
          comfy_workflow_name:
            nullable(workflowName),
          min_workers: minimum,
          max_workers: maximum,
          estimated_cost_per_second_cents:
            cents,
          is_active: isActive,
        };

        await browserApiRequest<RunPodConfigResponse>(
          "/api/admin/runpod-configs",
          {
            method: "POST",
            body: JSON.stringify(
              payload,
            ),
          },
        );

        toast.success(
          "Configuración RunPod creada.",
        );
      }

      await onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la configuración.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="luxia-panel rounded-3xl p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Configuración Serverless
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            {config
              ? `Editar ${config.name}`
              : "Nueva configuración RunPod"}
          </h2>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex size-9 items-center justify-center rounded-xl border border-white/8 text-zinc-500 hover:text-white"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {textFields.map((field) => (
          <label key={field.label}>
            <span className="mb-2 block text-sm text-zinc-500">
              {field.label}
            </span>

            <input
              value={field.value}
              onChange={(event) =>
                field.setValue(
                  event.target.value,
                )
              }
              placeholder={field.placeholder}
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
            />
          </label>
        ))}

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Workers mínimos
          </span>

          <input
            type="number"
            min={0}
            step={1}
            value={minWorkers}
            onChange={(event) =>
              setMinWorkers(
                event.target.value,
              )
            }
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Workers máximos
          </span>

          <input
            type="number"
            min={1}
            step={1}
            value={maxWorkers}
            onChange={(event) =>
              setMaxWorkers(
                event.target.value,
              )
            }
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Costo estimado/segundo
            (centavos)
          </span>

          <input
            type="number"
            min={0}
            step={1}
            value={cost}
            onChange={(event) =>
              setCost(
                event.target.value,
              )
            }
            className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>
      </div>

      <label className="mt-5 flex items-center gap-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) =>
            setIsActive(
              event.target.checked,
            )
          }
          className="size-4 accent-red-700"
        />

        Configuración activa
      </label>

      <div className="mt-6 flex justify-end border-t border-white/6 pt-5">
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

          Guardar configuración
        </button>
      </div>
    </form>
  );
}
