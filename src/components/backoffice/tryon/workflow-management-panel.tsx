"use client";

import {
  CircleDot,
  CopyPlus,
  LoaderCircle,
  Power,
  PowerOff,
  Save,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  WorkflowDefinitionResponse,
  WorkflowDefinitionUpdate,
  WorkflowExecutionMode,
  WorkflowVersionCreate,
} from "@/types/admin-workflows";

interface WorkflowManagementPanelProps {
  workflow: WorkflowDefinitionResponse;
}

function parseJsonObject(
  value: string,
  label: string,
): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      toast.error(`${label} debe ser un objeto JSON.`);
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    toast.error(`${label} contiene JSON inválido.`);
    return null;
  }
}

export function WorkflowManagementPanel({
  workflow,
}: WorkflowManagementPanelProps) {
  const [action, setAction] = useState<
    "status" | "default" | "version" | null
  >(null);

  const [showVersionForm, setShowVersionForm] =
    useState(false);

  const [versionName, setVersionName] =
    useState(workflow.name);

  const [versionDescription, setVersionDescription] =
    useState(workflow.description ?? "");

  const [workflowJson, setWorkflowJson] =
    useState(JSON.stringify(workflow.workflow, null, 2));

  const [parameterSchemaJson, setParameterSchemaJson] =
    useState(
      JSON.stringify(workflow.parameter_schema, null, 2),
    );

  const [metadataJson, setMetadataJson] =
    useState(JSON.stringify(workflow.metadata, null, 2));

  const [executionModes, setExecutionModes] =
    useState<WorkflowExecutionMode[]>(
      workflow.execution_modes,
    );

  const [activateNewVersion, setActivateNewVersion] =
    useState(true);

  const [makeDefault, setMakeDefault] =
    useState(false);

  const reloadPage = () => {
    window.location.reload();
  };

  const toggleActive = async () => {
    const nextActive = !workflow.is_active;

    const confirmed = window.confirm(
      nextActive
        ? "¿Activar este workflow?"
        : "¿Desactivar este workflow?",
    );

    if (!confirmed) return;

    const payload: WorkflowDefinitionUpdate = {
      is_active: nextActive,
    };

    setAction("status");

    try {
      await browserApiRequest<WorkflowDefinitionResponse>(
        `/api/admin/workflow-definitions/${workflow.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );

      toast.success(
        nextActive
          ? "Workflow activado."
          : "Workflow desactivado.",
      );

      reloadPage();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar el estado.",
      );
    } finally {
      setAction(null);
    }
  };

  const setAsDefault = async () => {
    if (workflow.is_default) {
      toast.info(
        "Este workflow ya es el predeterminado de su categoría.",
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Marcar "${workflow.name}" como workflow predeterminado de la categoría "${workflow.category}"?`,
    );

    if (!confirmed) return;

    setAction("default");

    try {
      await browserApiRequest<WorkflowDefinitionResponse>(
        `/api/admin/workflow-definitions/${workflow.id}/set-default`,
        {
          method: "POST",
        },
      );

      toast.success(
        "Workflow marcado como predeterminado.",
      );

      reloadPage();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible establecer el workflow predeterminado.",
      );
    } finally {
      setAction(null);
    }
  };

  const toggleMode = (
    mode: WorkflowExecutionMode,
  ) => {
    setExecutionModes((current) => {
      if (current.includes(mode)) {
        return current.filter(
          (item) => item !== mode,
        );
      }

      return [...current, mode];
    });
  };

  const createVersion = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      versionName.trim() &&
      versionName.trim().length < 2
    ) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    if (executionModes.length === 0) {
      toast.error(
        "Selecciona al menos un modo de ejecución.",
      );
      return;
    }

    const parsedWorkflow = parseJsonObject(
      workflowJson,
      "Workflow",
    );

    if (!parsedWorkflow) return;

    const parsedParameterSchema = parseJsonObject(
      parameterSchemaJson,
      "Esquema de parámetros",
    );

    if (!parsedParameterSchema) return;

    const parsedMetadata = parseJsonObject(
      metadataJson,
      "Metadata",
    );

    if (!parsedMetadata) return;

    const payload: WorkflowVersionCreate = {
      name: versionName.trim() || null,
      description:
        versionDescription.trim() || null,
      workflow: parsedWorkflow,
      parameter_schema: parsedParameterSchema,
      execution_modes: executionModes,
      metadata: parsedMetadata,
      activate_new_version: activateNewVersion,
      make_default: makeDefault,
    };

    setAction("version");

    try {
      const created =
        await browserApiRequest<WorkflowDefinitionResponse>(
          `/api/admin/workflow-definitions/${workflow.id}/versions`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

      toast.success(
        `Versión ${created.version} creada correctamente.`,
      );

      window.location.href =
        `/dashboard/tryon/workflows/${created.id}`;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible crear la versión.",
      );
    } finally {
      setAction(null);
    }
  };

  return (
    <section className="luxia-panel mt-5 rounded-3xl p-6">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
          Gestión del workflow
        </p>

        <h2 className="mt-2 text-lg font-semibold text-white">
          Estado, predeterminado y versiones
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
          Acciones administrativas respaldadas por los
          endpoints reales del backend.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          disabled={Boolean(action)}
          onClick={() => void toggleActive()}
          className={
            workflow.is_active
              ? "flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-500/15 bg-amber-950/15 px-4 text-sm text-amber-300 disabled:opacity-50"
              : "flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-950/15 px-4 text-sm text-emerald-300 disabled:opacity-50"
          }
        >
          {action === "status" ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : workflow.is_active ? (
            <PowerOff size={16} />
          ) : (
            <Power size={16} />
          )}

          {workflow.is_active
            ? "Desactivar"
            : "Activar"}
        </button>

        <button
          type="button"
          disabled={
            Boolean(action) ||
            workflow.is_default
          }
          onClick={() => void setAsDefault()}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-950/15 px-4 text-sm text-red-300 disabled:opacity-40"
        >
          {action === "default" ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <CircleDot size={16} />
          )}

          {workflow.is_default
            ? "Ya es predeterminado"
            : "Marcar predeterminado"}
        </button>

        <button
          type="button"
          disabled={Boolean(action)}
          onClick={() =>
            setShowVersionForm(
              (current) => !current,
            )
          }
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-500/15 bg-blue-950/15 px-4 text-sm text-blue-300 disabled:opacity-50"
        >
          <CopyPlus size={16} />
          Crear nueva versión
        </button>
      </div>

      {showVersionForm && (
        <form
          onSubmit={createVersion}
          className="mt-6 space-y-5 border-t border-white/6 pt-6"
        >
          <div className="rounded-2xl border border-blue-500/10 bg-blue-950/10 p-4 text-xs leading-6 text-blue-300/80">
            Se creará una nueva definición con la misma
            clave y categoría. El backend incrementará
            automáticamente la versión.
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Nombre de la nueva versión
              </span>

              <input
                value={versionName}
                onChange={(event) =>
                  setVersionName(
                    event.target.value,
                  )
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Descripción
              </span>

              <input
                value={versionDescription}
                onChange={(event) =>
                  setVersionDescription(
                    event.target.value,
                  )
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
              />
            </label>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Workflow JSON
              </span>

              <textarea
                value={workflowJson}
                onChange={(event) =>
                  setWorkflowJson(
                    event.target.value,
                  )
                }
                spellCheck={false}
                className="min-h-[360px] w-full resize-y rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 outline-none focus:border-red-500/50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Parameter schema JSON
              </span>

              <textarea
                value={parameterSchemaJson}
                onChange={(event) =>
                  setParameterSchemaJson(
                    event.target.value,
                  )
                }
                spellCheck={false}
                className="min-h-[360px] w-full resize-y rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 outline-none focus:border-red-500/50"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-500">
                Metadata JSON
              </span>

              <textarea
                value={metadataJson}
                onChange={(event) =>
                  setMetadataJson(
                    event.target.value,
                  )
                }
                spellCheck={false}
                className="min-h-[360px] w-full resize-y rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 outline-none focus:border-red-500/50"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <fieldset className="rounded-2xl border border-white/7 bg-black/20 p-5">
              <legend className="px-2 text-sm text-zinc-500">
                Modos de ejecución
              </legend>

              <div className="mt-2 space-y-3">
                {(
                  [
                    "simulated",
                    "comfyui_local",
                    "runpod_serverless",
                  ] as WorkflowExecutionMode[]
                ).map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      checked={executionModes.includes(
                        mode,
                      )}
                      onChange={() =>
                        toggleMode(mode)
                      }
                      className="size-4 accent-red-700"
                    />

                    {mode}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-white/7 bg-black/20 p-5">
              <legend className="px-2 text-sm text-zinc-500">
                Publicación
              </legend>

              <div className="mt-2 space-y-3">
                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={activateNewVersion}
                    onChange={(event) =>
                      setActivateNewVersion(
                        event.target.checked,
                      )
                    }
                    className="size-4 accent-red-700"
                  />
                  Activar nueva versión
                </label>

                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={makeDefault}
                    onChange={(event) =>
                      setMakeDefault(
                        event.target.checked,
                      )
                    }
                    className="size-4 accent-red-700"
                  />
                  Marcar nueva versión como predeterminada
                </label>
              </div>
            </fieldset>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={Boolean(action)}
              className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {action === "version" ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save size={16} />
              )}

              Crear versión
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 rounded-2xl border border-white/6 bg-black/20 p-4 text-xs leading-6 text-zinc-600">
        El backend no expone endpoints para eliminar o
        duplicar workflows. La creación de versiones,
        activación, desactivación y selección
        predeterminada son las acciones reales disponibles.
      </div>
    </section>
  );
}
