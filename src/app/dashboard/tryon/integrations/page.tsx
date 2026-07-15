"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  CheckCircle2,
  Cpu,
  FileCheck2,
  FlaskConical,
  LoaderCircle,
  Play,
  RefreshCcw,
  Send,
  Server,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { ComfyUIJsonResult } from "@/components/backoffice/tryon/comfyui-json-result";
import { TryOnEmptyState } from "@/components/backoffice/tryon/tryon-empty-state";
import { TryOnModuleHeader } from "@/components/backoffice/tryon/tryon-module-header";
import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  ComfyUIRunWorkflowRequest,
  ComfyUIRunWorkflowResponse,
  ComfyUITryOnTestRequest,
  ComfyUITryOnTestResponse,
  ComfyUIWorkflowListResponse,
  ComfyUIWorkflowPatch,
  ComfyUIWorkflowValidateRequest,
  ComfyUIWorkflowValidateResponse,
} from "@/types/admin-comfyui";

function parseRequiredNodes(
  value: string,
): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePatches(
  value: string,
): ComfyUIWorkflowPatch[] | null {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      toast.error(
        "Patches debe ser un arreglo JSON.",
      );
      return null;
    }

    for (const item of parsed) {
      if (
        typeof item !== "object" ||
        item === null ||
        Array.isArray(item)
      ) {
        toast.error(
          "Cada patch debe ser un objeto.",
        );
        return null;
      }

      const patch = item as Record<
        string,
        unknown
      >;

      if (
        typeof patch.node_id !== "string" ||
        !Array.isArray(patch.path) ||
        !("value" in patch)
      ) {
        toast.error(
          "Cada patch requiere node_id, path y value.",
        );
        return null;
      }
    }

    return parsed as ComfyUIWorkflowPatch[];
  } catch {
    toast.error(
      "El JSON de patches no es válido.",
    );
    return null;
  }
}

export default function TryOnComfyUIPage() {
  const [workflows, setWorkflows] =
    useState<string[]>([]);

  const [selectedWorkflow, setSelectedWorkflow] =
    useState("");

  const [requiredNodes, setRequiredNodes] =
    useState("");

  const [patchesJson, setPatchesJson] =
    useState("[]");

  const [clientId, setClientId] =
    useState("");

  const [waitForResult, setWaitForResult] =
    useState(true);

  const [tryOnJobId, setTryOnJobId] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [action, setAction] = useState<
    "validate" | "run" | "test" | "process" | null
  >(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [validationResult, setValidationResult] =
    useState<ComfyUIWorkflowValidateResponse | null>(
      null,
    );

  const [runResult, setRunResult] =
    useState<ComfyUIRunWorkflowResponse | null>(
      null,
    );

  const [tryOnResult, setTryOnResult] =
    useState<ComfyUITryOnTestResponse | null>(
      null,
    );

  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response =
        await browserApiRequest<ComfyUIWorkflowListResponse>(
          "/api/admin/comfyui/workflows",
        );

      setWorkflows(response.workflows);

      setSelectedWorkflow((current) => {
        if (
          current &&
          response.workflows.includes(current)
        ) {
          return current;
        }

        return response.workflows[0] ?? "";
      });
    } catch (error) {
      setWorkflows([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los workflows ComfyUI.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkflows();
  }, [loadWorkflows]);

  const workflowCount = workflows.length;

  const hasSelection = useMemo(
    () =>
      selectedWorkflow.trim().length > 0,
    [selectedWorkflow],
  );

  const validateWorkflow = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!hasSelection) {
      toast.error(
        "Selecciona un workflow.",
      );
      return;
    }

    const payload: ComfyUIWorkflowValidateRequest = {
      workflow_name: selectedWorkflow,
      required_nodes:
        parseRequiredNodes(requiredNodes),
    };

    setAction("validate");

    try {
      const result =
        await browserApiRequest<ComfyUIWorkflowValidateResponse>(
          "/api/admin/comfyui/workflows/validate",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      setValidationResult(result);

      toast.success(
        result.valid
          ? "Workflow válido."
          : "Workflow validado con nodos faltantes.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible validar el workflow.",
      );
    } finally {
      setAction(null);
    }
  };

  const runWorkflow = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!hasSelection) {
      toast.error(
        "Selecciona un workflow.",
      );
      return;
    }

    const patches =
      parsePatches(patchesJson);

    if (!patches) return;

    const payload: ComfyUIRunWorkflowRequest = {
      workflow_name: selectedWorkflow,
      patches,
      client_id:
        clientId.trim() || null,
      wait_for_result: waitForResult,
    };

    setAction("run");

    try {
      const result =
        await browserApiRequest<ComfyUIRunWorkflowResponse>(
          "/api/admin/comfyui/run-workflow",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      setRunResult(result);

      toast.success(
        `Workflow ejecutado con estado ${result.status}.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible ejecutar el workflow.",
      );
    } finally {
      setAction(null);
    }
  };

  const numericTryOnJobId = () => {
    const parsed = Number.parseInt(
      tryOnJobId.trim(),
      10,
    );

    if (
      !Number.isInteger(parsed) ||
      parsed <= 0
    ) {
      toast.error(
        "Ingresa un Try-On Job ID válido.",
      );
      return null;
    }

    return parsed;
  };

  const testTryOn = async () => {
    const id = numericTryOnJobId();

    if (id === null) return;

    const payload: ComfyUITryOnTestRequest = {
      tryon_job_id: id,
    };

    setAction("test");

    try {
      const result =
        await browserApiRequest<ComfyUITryOnTestResponse>(
          "/api/admin/comfyui/test-tryon",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      setTryOnResult(result);

      toast.success(
        `Prueba terminada con estado ${result.status}.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible probar el job.",
      );
    } finally {
      setAction(null);
    }
  };

  const processTryOn = async () => {
    const id = numericTryOnJobId();

    if (id === null) return;

    const confirmed = window.confirm(
      `¿Procesar el Try-On Job #${id} mediante ComfyUI?`,
    );

    if (!confirmed) return;

    setAction("process");

    try {
      const result =
        await browserApiRequest<ComfyUITryOnTestResponse>(
          `/api/admin/comfyui/process-tryon/${id}`,
          {
            method: "POST",
          },
        );

      setTryOnResult(result);

      toast.success(
        `Procesamiento terminado con estado ${result.status}.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible procesar el job.",
      );
    } finally {
      setAction(null);
    }
  };

  return (
    <div>
      <TryOnModuleHeader
        title="ComfyUI"
        description="Operación administrativa real: catálogo de workflows, validación, ejecución directa y pruebas de trabajos Try-On."
      />

      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={() =>
            void loadWorkflows()
          }
          disabled={isLoading}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCcw
            size={16}
            className={
              isLoading
                ? "animate-spin"
                : undefined
            }
          />
          Recargar workflows
        </button>
      </div>

      {isLoading && (
        <section className="luxia-panel mt-5 flex min-h-72 items-center justify-center rounded-3xl">
          <LoaderCircle className="animate-spin text-red-500" />
        </section>
      )}

      {!isLoading &&
        errorMessage && (
          <div className="mt-5">
            <TryOnEmptyState
              error
              title="No se pudo conectar con ComfyUI"
              description={errorMessage}
            />
          </div>
        )}

      {!isLoading &&
        !errorMessage && (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="luxia-panel rounded-2xl p-5">
                <Server
                  size={18}
                  className="text-red-400"
                />
                <p className="mt-4 text-xs text-zinc-600">
                  Catálogo
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {workflowCount}
                </p>
                <p className="mt-1 text-xs text-zinc-700">
                  workflows disponibles
                </p>
              </article>

              <article className="luxia-panel rounded-2xl p-5">
                <Cpu
                  size={18}
                  className="text-red-400"
                />
                <p className="mt-4 text-xs text-zinc-600">
                  Workflow seleccionado
                </p>
                <p className="mt-2 truncate text-lg font-semibold text-white">
                  {selectedWorkflow ||
                    "Ninguno"}
                </p>
              </article>

              <article className="luxia-panel rounded-2xl p-5">
                <CheckCircle2
                  size={18}
                  className="text-red-400"
                />
                <p className="mt-4 text-xs text-zinc-600">
                  Última validación
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {validationResult
                    ? validationResult.valid
                      ? "Válido"
                      : "Con faltantes"
                    : "Sin ejecutar"}
                </p>
              </article>

              <article className="luxia-panel rounded-2xl p-5">
                <Play
                  size={18}
                  className="text-red-400"
                />
                <p className="mt-4 text-xs text-zinc-600">
                  Última ejecución
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {runResult?.status ??
                    "Sin ejecutar"}
                </p>
              </article>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2">
              <form
                onSubmit={validateWorkflow}
                className="luxia-panel rounded-3xl p-6"
              >
                <div className="flex items-center gap-3">
                  <FileCheck2 className="text-red-400" />
                  <div>
                    <h2 className="font-semibold text-white">
                      Validar workflow
                    </h2>
                    <p className="mt-1 text-xs text-zinc-600">
                      Verifica existencia y nodos requeridos.
                    </p>
                  </div>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm text-zinc-500">
                    Workflow
                  </span>

                  <select
                    value={selectedWorkflow}
                    onChange={(event) =>
                      setSelectedWorkflow(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white"
                  >
                    {workflows.map(
                      (workflow) => (
                        <option
                          key={workflow}
                          value={workflow}
                        >
                          {workflow}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm text-zinc-500">
                    Nodos requeridos
                  </span>

                  <textarea
                    value={requiredNodes}
                    onChange={(event) =>
                      setRequiredNodes(
                        event.target.value,
                      )
                    }
                    placeholder="14793, 14734, 14697"
                    className="min-h-28 w-full rounded-xl border border-white/8 bg-black/30 p-4 font-mono text-sm text-white outline-none focus:border-red-500/50"
                  />
                </label>

                <button
                  type="submit"
                  disabled={
                    Boolean(action) ||
                    !hasSelection
                  }
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {action === "validate" ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <FileCheck2 size={16} />
                  )}

                  Validar
                </button>
              </form>

              <section className="luxia-panel rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <FlaskConical className="text-red-400" />
                  <div>
                    <h2 className="font-semibold text-white">
                      Procesar Try-On
                    </h2>
                    <p className="mt-1 text-xs text-zinc-600">
                      Prueba o procesa un job existente.
                    </p>
                  </div>
                </div>

                <label className="mt-5 block">
                  <span className="mb-2 block text-sm text-zinc-500">
                    Try-On Job ID
                  </span>

                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={tryOnJobId}
                    onChange={(event) =>
                      setTryOnJobId(
                        event.target.value,
                      )
                    }
                    placeholder="Ejemplo: 42"
                    className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
                  />
                </label>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={Boolean(action)}
                    onClick={() =>
                      void testTryOn()
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-950/15 px-5 text-sm text-blue-300 disabled:opacity-50"
                  >
                    {action === "test" ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <FlaskConical size={16} />
                    )}

                    Probar job
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(action)}
                    onClick={() =>
                      void processTryOn()
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {action === "process" ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={16} />
                    )}

                    Procesar job
                  </button>
                </div>
              </section>
            </section>

            <form
              onSubmit={runWorkflow}
              className="luxia-panel mt-5 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3">
                <Play className="text-red-400" />
                <div>
                  <h2 className="font-semibold text-white">
                    Ejecutar workflow directo
                  </h2>
                  <p className="mt-1 text-xs text-zinc-600">
                    Envía patches al workflow y opcionalmente espera el resultado.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm text-zinc-500">
                    Workflow
                  </span>

                  <select
                    value={selectedWorkflow}
                    onChange={(event) =>
                      setSelectedWorkflow(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-white/8 bg-[#09090a] px-4 text-sm text-white"
                  >
                    {workflows.map(
                      (workflow) => (
                        <option
                          key={workflow}
                          value={workflow}
                        >
                          {workflow}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm text-zinc-500">
                    Client ID opcional
                  </span>

                  <input
                    value={clientId}
                    onChange={(event) =>
                      setClientId(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white outline-none focus:border-red-500/50"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm text-zinc-500">
                  Patches JSON
                </span>

                <textarea
                  value={patchesJson}
                  onChange={(event) =>
                    setPatchesJson(
                      event.target.value,
                    )
                  }
                  spellCheck={false}
                  className="min-h-64 w-full rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 outline-none focus:border-red-500/50"
                />
              </label>

              <label className="mt-5 flex items-center gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={waitForResult}
                  onChange={(event) =>
                    setWaitForResult(
                      event.target.checked,
                    )
                  }
                  className="size-4 accent-red-700"
                />
                Esperar resultado e historial
              </label>

              <button
                type="submit"
                disabled={
                  Boolean(action) ||
                  !hasSelection
                }
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {action === "run" ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Play size={16} />
                )}

                Ejecutar workflow
              </button>
            </form>

            <section className="mt-5 grid gap-5 xl:grid-cols-2">
              {validationResult && (
                <ComfyUIJsonResult
                  title="Resultado de validación"
                  value={validationResult}
                />
              )}

              {tryOnResult && (
                <ComfyUIJsonResult
                  title="Resultado Try-On"
                  value={tryOnResult}
                />
              )}
            </section>

            {runResult && (
              <div className="mt-5">
                <ComfyUIJsonResult
                  title="Resultado de ejecución"
                  value={runResult}
                />
              </div>
            )}

            {workflows.length === 0 && (
              <div className="mt-5">
                <TryOnEmptyState
                  title="No hay workflows ComfyUI"
                  description="El endpoint respondió correctamente, pero no existen workflows disponibles en el almacenamiento configurado."
                />
              </div>
            )}

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/10 bg-amber-950/10 p-4">
              <TriangleAlert
                size={18}
                className="mt-0.5 shrink-0 text-amber-400"
              />
              <p className="text-xs leading-6 text-amber-300/80">
                Ejecutar workflows y procesar jobs puede consumir GPU y tokens. Usa jobs de prueba y confirma que ComfyUI esté disponible antes de ejecutar.
              </p>
            </div>
          </>
        )}
    </div>
  );
}
