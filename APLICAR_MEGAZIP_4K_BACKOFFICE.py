from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent

def load(relative):
    path = ROOT / relative
    if not path.is_file():
        raise FileNotFoundError(path)
    return path, path.read_text(encoding="utf-8")

def save(path, text):
    path.write_text(text, encoding="utf-8", newline="\n")

# Tipos
path, text = load("src/types/admin-integrations.ts")
text = text.replace('| "runpod"\n', '| "modal"\n')
save(path, text)

# Catálogo
path, text = load("src/lib/integrations/catalog.ts")
text = text.replace('provider: "runpod"', 'provider: "modal"')
text = text.replace('label: "RunPod"', 'label: "Modal"')
text = text.replace(
    '"Ejecución Serverless de trabajos de inteligencia artificial."',
    '"Infraestructura serverless para ejecutar módulos de inteligencia artificial."',
)
save(path, text)

# Proveedores editables
for relative in (
    "src/app/dashboard/integrations/page.tsx",
    "src/app/dashboard/integrations/[provider]/page.tsx",
):
    path, text = load(relative)
    text = text.replace('"runpod",', '"modal",')
    save(path, text)

# Editor específico de Modal
editor = ROOT / "src/components/backoffice/integrations/modal-integration-editor.tsx"
editor.parent.mkdir(parents=True, exist_ok=True)
editor.write_text(r'''"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { browserApiRequest } from "@/lib/api/browser-api";
import type {
  IntegrationConfigResponse,
  IntegrationConfigUpdate,
} from "@/types/admin-integrations";

const DEFAULTS = {
  profile: "",
  gpu: "L40S",
  cpu: 8,
  memory_mb: 32768,
  min_containers: 0,
  max_containers: 10,
  container_idle_timeout_seconds: 300,
  execution_timeout_seconds: 900,
  concurrency: 1,
  retries: 2,
};

export function ModalIntegrationEditor({
  integration,
  onSaved,
}: {
  integration: IntegrationConfigResponse;
  onSaved: (value: IntegrationConfigResponse) => void;
}) {
  const initial = useMemo(
    () => ({ ...DEFAULTS, ...(integration.config ?? {}) }),
    [integration.config],
  );
  const [form, setForm] = useState(initial);
  const [tokenId, setTokenId] = useState("");
  const [tokenSecret, setTokenSecret] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass =
    "mt-2 h-11 w-full rounded-xl border border-white/8 bg-black/25 px-3 text-sm text-white outline-none";

  const save = async () => {
    setSaving(true);
    try {
      const payload: IntegrationConfigUpdate = {
        name: "Modal",
        is_enabled: true,
        status: "enabled",
        api_key: tokenId || null,
        api_secret: tokenSecret || null,
        config: form,
      };
      const response = await browserApiRequest<IntegrationConfigResponse>(
        "/api/admin/integrations/modal",
        { method: "PUT", body: JSON.stringify(payload) },
      );
      onSaved(response);
      setTokenId("");
      setTokenSecret("");
      toast.success("Configuración de Modal guardada.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No fue posible guardar Modal.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="luxia-panel rounded-3xl p-6">
      <h2 className="text-lg font-semibold text-white">
        Configuración de Modal
      </h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="text-xs text-zinc-500">
          Profile
          <input
            className={inputClass}
            value={String(form.profile)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                profile: event.target.value,
              }))
            }
          />
        </label>

        <label className="text-xs text-zinc-500">
          GPU
          <select
            className={inputClass}
            value={String(form.gpu)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                gpu: event.target.value,
              }))
            }
          >
            <option value="L40S">L40S - recomendado</option>
            <option value="A10G">A10G</option>
            <option value="A100">A100</option>
            <option value="H100">H100</option>
          </select>
        </label>

        {[
          ["cpu", "CPU"],
          ["memory_mb", "Memoria (MB)"],
          ["min_containers", "Workers mínimos"],
          ["max_containers", "Workers máximos"],
          ["container_idle_timeout_seconds", "Apagado por inactividad (s)"],
          ["execution_timeout_seconds", "Timeout de ejecución (s)"],
          ["concurrency", "Concurrencia por worker"],
          ["retries", "Reintentos"],
        ].map(([key, label]) => (
          <label key={key} className="text-xs text-zinc-500">
            {label}
            <input
              type="number"
              min="0"
              className={inputClass}
              value={Number(form[key as keyof typeof DEFAULTS])}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [key]: Number(event.target.value),
                }))
              }
            />
          </label>
        ))}

        <label className="text-xs text-zinc-500">
          Token ID
          <input
            type="password"
            className={inputClass}
            value={tokenId}
            placeholder={
              integration.api_key_configured
                ? "Configurado - dejar vacío para conservar"
                : ""
            }
            onChange={(event) => setTokenId(event.target.value)}
          />
        </label>

        <label className="text-xs text-zinc-500">
          Token Secret
          <input
            type="password"
            className={inputClass}
            value={tokenSecret}
            placeholder={
              integration.api_secret_configured
                ? "Configurado - dejar vacío para conservar"
                : ""
            }
            onChange={(event) => setTokenSecret(event.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="mt-6 inline-flex h-11 items-center rounded-xl border border-red-500/15 bg-red-950/15 px-5 text-sm text-red-300 disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar configuración"}
      </button>
    </section>
  );
}
''', encoding="utf-8", newline="\n")

# Integrar editor en la página de proveedor.
path, text = load("src/app/dashboard/integrations/[provider]/page.tsx")
import_line = (
    'import { ModalIntegrationEditor } from '
    '"@/components/backoffice/integrations/modal-integration-editor";\n'
)
anchor = (
    'import { IntegrationStatusBadge } from '
    '"@/components/backoffice/integrations/integration-status-badge";\n'
)
if import_line not in text:
    text = text.replace(anchor, anchor + import_line)

old = '''        {provider === "stripe" ? (
          <StripeIntegrationEditor'''
new = '''        {provider === "modal" ? (
          <ModalIntegrationEditor
            integration={integration}
            onSaved={setIntegration}
          />
        ) : provider === "stripe" ? (
          <StripeIntegrationEditor'''
if new not in text:
    if old not in text:
        raise RuntimeError("No se encontró el selector de editor por proveedor.")
    text = text.replace(old, new)
save(path, text)

# Preservar exactamente la sección indicada y sustituir solo RunPod por Modal.
matches = []
for candidate in (ROOT / "src").rglob("*.tsx"):
    source = candidate.read_text(encoding="utf-8")
    if "Motores disponibles para los módulos" in source:
        matches.append((candidate, source))

if not matches:
    raise RuntimeError(
        'No se encontró la sección "Motores disponibles para los módulos".'
    )

for candidate, source in matches:
    source = source.replace('"runpod"', '"modal"')
    source = source.replace("'runpod'", "'modal'")
    source = source.replace("RunPod", "Modal")
    save(candidate, source)

print("[4K BackOffice] Modal agregado.")
print('[4K BackOffice] Se preservó "Motores disponibles para los módulos".')
'''
