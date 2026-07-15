"use client";

import {
  FileJson2,
  LoaderCircle,
  Save,
} from "lucide-react";
import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { browserApiRequest } from "@/lib/api/browser-api";

import type {
  WorkflowDefinitionCreate,
  WorkflowDefinitionResponse,
  WorkflowDefinitionUpdate,
  WorkflowExecutionMode,
} from "@/types/admin-workflows";

interface WorkflowEditorProps {
  workflow?: WorkflowDefinitionResponse;
  onSaved: (
    workflow: WorkflowDefinitionResponse,
  ) => void;
}

function prettyJson(
  value: Record<string, unknown>,
): string {
  return JSON.stringify(value, null, 2);
}

function parseJsonObject(
  value: string,
  label: string,
): Record<string, unknown> | null {
  try {
    const parsed: unknown =
      JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      toast.error(
        `${label} debe ser un objeto JSON.`,
      );
      return null;
    }

    return parsed as Record<
      string,
      unknown
    >;
  } catch {
    toast.error(
      `${label} contiene JSON inválido.`,
    );
    return null;
  }
}

export function WorkflowEditor({
  workflow,
  onSaved,
}: WorkflowEditorProps) {
  const isEditing = Boolean(workflow);

  const [key, setKey] = useState(
    workflow?.key ?? "",
  );

  const [name, setName] = useState(
    workflow?.name ?? "",
  );

  const [
    description,
    setDescription,
  ] = useState(
    workflow?.description ?? "",
  );

  const [version, setVersion] =
    useState(
      workflow?.version ?? 1,
    );

  const [category, setCategory] =
    useState(
      workflow?.category ?? "tryon",
    );

  const [workflowJson, setWorkflowJson] =
    useState(
      prettyJson(
        workflow?.workflow ?? {},
      ),
    );

  const [
    parameterSchemaJson,
    setParameterSchemaJson,
  ] = useState(
    prettyJson(
      workflow?.parameter_schema ??
        {},
    ),
  );

  const [metadataJson, setMetadataJson] =
    useState(
      prettyJson(
        workflow?.metadata ?? {},
      ),
    );

  const [
    executionModes,
    setExecutionModes,
  ] = useState<WorkflowExecutionMode[]>(
    workflow?.execution_modes ?? [
      "comfyui_local",
    ],
  );

  const [isActive, setIsActive] =
    useState(
      workflow?.is_active ?? true,
    );

  const [isDefault, setIsDefault] =
    useState(
      workflow?.is_default ?? false,
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const title = useMemo(
    () =>
      isEditing
        ? "Editar workflow"
        : "Crear workflow",
    [isEditing],
  );

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

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      key.trim().length < 2 ||
      !/^[a-z0-9][a-z0-9._-]*$/.test(
        key.trim(),
      )
    ) {
      toast.error(
        "La clave debe usar minúsculas, números, punto, guion o guion bajo.",
      );
      return;
    }

    if (name.trim().length < 2) {
      toast.error(
        "El nombre debe tener al menos 2 caracteres.",
      );
      return;
    }

    if (
      category.trim().length < 2
    ) {
      toast.error(
        "La categoría debe tener al menos 2 caracteres.",
      );
      return;
    }

    if (executionModes.length === 0) {
      toast.error(
        "Selecciona al menos un modo de ejecución.",
      );
      return;
    }

    const parsedWorkflow =
      parseJsonObject(
        workflowJson,
        "Workflow",
      );

    if (!parsedWorkflow) return;

    const parsedParameterSchema =
      parseJsonObject(
        parameterSchemaJson,
        "Esquema de parámetros",
      );

    if (!parsedParameterSchema) return;

    const parsedMetadata =
      parseJsonObject(
        metadataJson,
        "Metadata",
      );

    if (!parsedMetadata) return;

    setIsSaving(true);

    try {
      let saved: WorkflowDefinitionResponse;

      if (workflow) {
        const payload: WorkflowDefinitionUpdate =
          {
            name: name.trim(),
            description:
              description.trim() || null,
            category:
              category.trim(),
            workflow:
              parsedWorkflow,
            parameter_schema:
              parsedParameterSchema,
            execution_modes:
              executionModes,
            metadata:
              parsedMetadata,
            is_active: isActive,
            is_default: isDefault,
          };

        saved =
          await browserApiRequest<WorkflowDefinitionResponse>(
            `/api/admin/workflow-definitions/${workflow.id}`,
            {
              method: "PATCH",
              body: JSON.stringify(
                payload,
              ),
            },
          );
      } else {
        const payload: WorkflowDefinitionCreate =
          {
            key: key.trim(),
            name: name.trim(),
            description:
              description.trim() || null,
            version,
            category:
              category.trim(),
            workflow:
              parsedWorkflow,
            parameter_schema:
              parsedParameterSchema,
            execution_modes:
              executionModes,
            metadata:
              parsedMetadata,
            is_active: isActive,
            is_default: isDefault,
          };

        saved =
          await browserApiRequest<WorkflowDefinitionResponse>(
            "/api/admin/workflow-definitions",
            {
              method: "POST",
              body: JSON.stringify(
                payload,
              ),
            },
          );
      }

      toast.success(
        isEditing
          ? "Workflow actualizado."
          : "Workflow creado.",
      );

      onSaved(saved);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el workflow.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="luxia-panel rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <FileJson2 className="text-red-400" />

        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-red-500 uppercase">
            Administración
          </p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            {title}
          </h2>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 space-y-6"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Clave
            </span>

            <input
              value={key}
              disabled={isEditing}
              onChange={(event) =>
                setKey(
                  event.target.value
                    .toLowerCase(),
                )
              }
              placeholder="tryon.clothing.v1"
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 font-mono text-sm text-white outline-none focus:border-red-500/50 disabled:opacity-50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Nombre
            </span>

            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Try-On ropa"
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Categoría
            </span>

            <input
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              placeholder="tryon"
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Versión
            </span>

            <input
              type="number"
              min={1}
              step={1}
              disabled={isEditing}
              value={version}
              onChange={(event) =>
                setVersion(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="h-12 w-full rounded-xl border border-white/8 bg-black/30 px-4 text-sm text-white outline-none focus:border-red-500/50 disabled:opacity-50"
            />
          </label>
        </div>

        <label>
          <span className="mb-2 block text-sm text-zinc-500">
            Descripción
          </span>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            className="min-h-24 w-full resize-y rounded-xl border border-white/8 bg-black/30 p-4 text-sm text-white outline-none focus:border-red-500/50"
          />
        </label>

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
              className="min-h-[420px] w-full resize-y rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 outline-none focus:border-red-500/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-zinc-500">
              Parameter schema JSON
            </span>

            <textarea
              value={
                parameterSchemaJson
              }
              onChange={(event) =>
                setParameterSchemaJson(
                  event.target.value,
                )
              }
              spellCheck={false}
              className="min-h-[420px] w-full resize-y rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 outline-none focus:border-red-500/50"
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
              className="min-h-[420px] w-full resize-y rounded-xl border border-white/8 bg-[#060607] p-4 font-mono text-xs leading-6 text-zinc-300 outline-none focus:border-red-500/50"
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
              Estado
            </legend>

            <div className="mt-2 space-y-3">
              <label className="flex items-center gap-3 text-sm text-zinc-300">
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
                Activo
              </label>

              <label className="flex items-center gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(event) =>
                    setIsDefault(
                      event.target.checked,
                    )
                  }
                  className="size-4 accent-red-700"
                />
                Predeterminado
              </label>
            </div>
          </fieldset>
        </div>

        <div className="flex justify-end border-t border-white/6 pt-5">
          <button
            type="submit"
            disabled={isSaving}
            className="luxia-red-glow inline-flex h-11 items-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Save size={16} />
            )}

            {isEditing
              ? "Guardar cambios"
              : "Crear workflow"}
          </button>
        </div>
      </form>
    </section>
  );
}
