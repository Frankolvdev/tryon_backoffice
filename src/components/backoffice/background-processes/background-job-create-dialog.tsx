"use client";

import {
  LoaderCircle,
  Plus,
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
  BackgroundJob,
  BackgroundJobCreate,
  BackgroundJobHandlerListResponse,
} from "@/types/admin-background-jobs";

interface Props {
  onClose: () => void;
  onCreated: (job: BackgroundJob) => void;
}

function parseObject(
  value: string,
  label: string,
): Record<string, unknown> {
  const parsed = JSON.parse(value || "{}") as unknown;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      `${label} debe ser un objeto JSON.`,
    );
  }

  return parsed as Record<string, unknown>;
}

export function BackgroundJobCreateDialog({
  onClose,
  onCreated,
}: Props) {
  const [handlers, setHandlers] =
    useState<string[]>([]);
  const [jobType, setJobType] =
    useState("");
  const [queueName, setQueueName] =
    useState<BackgroundJobCreate["queue_name"]>(
      "default",
    );
  const [executionMode, setExecutionMode] =
    useState<BackgroundJobCreate["execution_mode"]>(
      "internal",
    );
  const [priority, setPriority] =
    useState<BackgroundJobCreate["priority"]>(
      50,
    );
  const [payload, setPayload] =
    useState("{}");
  const [metadata, setMetadata] =
    useState("{}");
  const [maxAttempts, setMaxAttempts] =
    useState(3);
  const [timeoutSeconds, setTimeoutSeconds] =
    useState(900);
  const [retrySeconds, setRetrySeconds] =
    useState(30);
  const [retryMultiplier, setRetryMultiplier] =
    useState(2);
  const [isCancelable, setIsCancelable] =
    useState(true);
  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    void browserApiRequest<BackgroundJobHandlerListResponse>(
      "/api/admin/background-jobs/handlers",
    )
      .then((response) => {
        setHandlers(
          response.items.map(
            (item) => item.job_type,
          ),
        );
      })
      .catch(() => {
        setHandlers([]);
      });
  }, []);

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (jobType.trim().length < 2) {
      toast.error(
        "El tipo de proceso es obligatorio.",
      );
      return;
    }

    let parsedPayload:
      Record<string, unknown>;
    let parsedMetadata:
      Record<string, unknown>;

    try {
      parsedPayload = parseObject(
        payload,
        "Payload",
      );
      parsedMetadata = parseObject(
        metadata,
        "Metadata",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "JSON inválido.",
      );
      return;
    }

    const data: BackgroundJobCreate = {
      job_type: jobType.trim(),
      queue_name: queueName,
      execution_mode: executionMode,
      priority,
      payload: parsedPayload,
      metadata: parsedMetadata,
      dependencies: [],
      max_attempts: maxAttempts,
      retry_backoff_seconds:
        retrySeconds,
      retry_backoff_multiplier:
        retryMultiplier,
      timeout_seconds: timeoutSeconds,
      is_cancelable: isCancelable,
    };

    setIsSaving(true);

    try {
      const created =
        await browserApiRequest<BackgroundJob>(
          "/api/admin/background-jobs/create",
          {
            method: "POST",
            body: JSON.stringify(data),
          },
        );

      toast.success(
        "Proceso creado correctamente.",
      );
      onCreated(created);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible crear el proceso.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="luxia-panel max-h-[94vh] w-full max-w-5xl overflow-auto rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-white/6 bg-[#09090a]/95 p-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
              Procesos
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Crear proceso manual
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-white/8 text-zinc-500"
          >
            <X size={17} />
          </button>
        </header>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Tipo de proceso
            </span>

            <input
              list="background-job-handlers"
              value={jobType}
              onChange={(event) =>
                setJobType(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white"
            />

            <datalist id="background-job-handlers">
              {handlers.map((handler) => (
                <option
                  key={handler}
                  value={handler}
                />
              ))}
            </datalist>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Cola
            </span>
            <select
              value={queueName}
              onChange={(event) =>
                setQueueName(
                  event.target
                    .value as BackgroundJobCreate["queue_name"],
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              {[
                "default",
                "ai",
                "billing",
                "security",
                "notifications",
                "maintenance",
                "webhooks",
              ].map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Ejecución
            </span>
            <select
              value={executionMode}
              onChange={(event) =>
                setExecutionMode(
                  event.target
                    .value as BackgroundJobCreate["execution_mode"],
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              {[
                "internal",
                "comfyui_local",
                "runpod_serverless",
                "external_api",
              ].map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Prioridad
            </span>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  Number(
                    event.target.value,
                  ) as BackgroundJobCreate["priority"],
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-zinc-300"
            >
              <option value={0}>
                critical
              </option>
              <option value={25}>
                high
              </option>
              <option value={50}>
                normal
              </option>
              <option value={75}>
                low
              </option>
              <option value={100}>
                background
              </option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Intentos máximos
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={maxAttempts}
              onChange={(event) =>
                setMaxAttempts(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Timeout (segundos)
            </span>
            <input
              type="number"
              min={1}
              max={86400}
              value={timeoutSeconds}
              onChange={(event) =>
                setTimeoutSeconds(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Backoff inicial
            </span>
            <input
              type="number"
              min={0}
              max={86400}
              value={retrySeconds}
              onChange={(event) =>
                setRetrySeconds(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Multiplicador
            </span>
            <input
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={retryMultiplier}
              onChange={(event) =>
                setRetryMultiplier(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white"
            />
          </label>
        </div>

        <div className="grid gap-5 px-6 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Payload JSON
            </span>
            <textarea
              value={payload}
              onChange={(event) =>
                setPayload(
                  event.target.value,
                )
              }
              className="min-h-52 w-full rounded-xl border border-white/8 bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-300"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Metadata JSON
            </span>
            <textarea
              value={metadata}
              onChange={(event) =>
                setMetadata(
                  event.target.value,
                )
              }
              className="min-h-52 w-full rounded-xl border border-white/8 bg-[#050506] p-4 font-mono text-xs leading-6 text-zinc-300"
            />
          </label>
        </div>

        <label className="mx-6 mt-5 flex items-center justify-between rounded-2xl border border-white/7 bg-black/20 p-4 text-sm text-zinc-400">
          Permitir cancelación
          <input
            type="checkbox"
            checked={isCancelable}
            onChange={(event) =>
              setIsCancelable(
                event.target.checked,
              )
            }
            className="accent-red-700"
          />
        </label>

        <footer className="sticky bottom-0 mt-6 flex justify-end border-t border-white/6 bg-[#09090a]/95 p-5">
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
              <Plus size={16} />
            )}
            Crear proceso
          </button>
        </footer>
      </form>
    </div>
  );
}
