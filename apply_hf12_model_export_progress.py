#!/usr/bin/env python3
"""
HF12 BackOffice — Progreso inmediato, polling robusto y estado persistente.

Ejecutar desde la raíz de tryon_backoffice:

    python apply_hf12_model_export_progress.py
"""
from __future__ import annotations

from pathlib import Path
import re

ROOT = Path.cwd()
TARGET = ROOT / "src/components/runtime-builder/runtime-mega3-panel.tsx"

if not TARGET.exists():
    raise SystemExit(
        "No se encontró src/components/runtime-builder/runtime-mega3-panel.tsx. "
        "Ejecuta el instalador desde la raíz de tryon_backoffice."
    )

source = TARGET.read_text(encoding="utf-8")
original = source

if "HF12_EXPORT_PROGRESS" in source:
    print("HF12 BackOffice ya estaba aplicado.")
    raise SystemExit(0)

# 1) Reemplazar wait por polling con:
# - actualización inmediata;
# - límite de tiempo;
# - tolerancia a errores transitorios;
# - progreso visible hasta completar/fallar.
wait_pattern = re.compile(
    r"const wait=async\(created:RuntimeContextJob\)=>\{"
    r".*?"
    r"return current\.result as RuntimeModelVolumeExportResponse"
    r"\};",
    re.DOTALL,
)

wait_replacement = (
    "const wait=async(created:RuntimeContextJob)=>{"
    "/* HF12_EXPORT_PROGRESS */"
    "let current=created;"
    "let transientErrors=0;"
    "const startedAt=Date.now();"
    "setJob(current);"
    "while([\"queued\",\"running\"].includes(current.status)){"
    "if(Date.now()-startedAt>6*60*60*1000)"
    "throw new Error(\"La exportación superó el tiempo máximo de seguimiento.\");"
    "await new Promise(r=>setTimeout(r,1000));"
    "try{"
    "current=await browserApiRequest<RuntimeContextJob>("
    "`/api/admin/runtime-builder/context/jobs/${created.job_id}`"
    ");"
    "transientErrors=0;"
    "setJob(current)"
    "}catch(e){"
    "transientErrors+=1;"
    "if(transientErrors>=5)throw e"
    "}"
    "}"
    "setJob(current);"
    "if(current.status===\"failed\")"
    "throw new Error(current.error||\"Exportación fallida.\");"
    "if(!current.result)throw new Error(\"La exportación terminó sin resultado.\");"
    "return current.result as RuntimeModelVolumeExportResponse"
    "};"
)

match = wait_pattern.search(source)
if not match:
    raise SystemExit(
        "No se encontró la función wait() del exportador. "
        "No se modificó ningún archivo."
    )
source = source[:match.start()] + wait_replacement + source[match.end():]

# 2) Reemplazar run por flujo que muestra actividad ANTES de guardar o llamar backend.
run_pattern = re.compile(
    r"const run=async\(\)=>\{"
    r".*?"
    r"\};\s*if\(!settings\)return",
    re.DOTALL,
)

run_replacement = (
    "const run=async()=>{"
    "if(!settings?.comfyui_path)"
    "return toast.error(\"Indica la ruta de ComfyUI.\");"
    "if(settings.destination_type===\"docker_volume\"&&!settings.docker_volume)"
    "return toast.error(\"Selecciona un volumen.\");"
    "setBusy(true);"
    "setResult(null);"
    "setJob({"
    "job_id:\"pending\","
    "status:\"queued\","
    "phase:\"saving\","
    "progress:1,"
    "message:\"Guardando configuración e iniciando exportación…\","
    "error:null,"
    "result:null"
    "} as RuntimeContextJob);"
    "try{"
    # HF11 compatibility: prefer global save if installed, otherwise existing save.
    "const saveFn=typeof saveAllConfiguration===\"function\""
    "?saveAllConfiguration"
    ":save;"
    "const saved=await saveFn(false as never);"
    "if(saved===false)"
    "throw new Error(\"No se pudo guardar la configuración antes de exportar.\");"
    "setJob(j=>j?{...j,phase:\"requesting\",progress:2,message:\"Creando trabajo de exportación…\"}:j);"
    "const created=await browserApiRequest<RuntimeContextJob>("
    "\"/api/admin/runtime-builder/models-volume/export\","
    "{method:\"POST\",body:JSON.stringify(settings)}"
    ");"
    "setJob(created);"
    "const completed=await wait(created);"
    "setResult(completed);"
    "toast.success(\"Exportación terminada.\")"
    "}catch(e){"
    "const message=e instanceof Error?e.message:\"Exportación fallida.\";"
    "setJob(j=>j?{...j,status:\"failed\",phase:\"failed\",message,error:message}:j);"
    "toast.error(message)"
    "}finally{setBusy(false)}"
    "}; "
    "if(!settings)return"
)

match = run_pattern.search(source)
if not match:
    raise SystemExit(
        "No se encontró la función run() del exportador. "
        "No se modificó ningún archivo."
    )
source = source[:match.start()] + run_replacement + source[match.end():]

# 3) Mostrar el panel de progreso siempre que haya job, no solo durante busy.
source = source.replace("{job&&busy&&", "{job&&", 1)

# 4) Si el texto está minificado, asegurar que exista información útil.
required = (
    "HF12_EXPORT_PROGRESS",
    "Guardando configuración e iniciando exportación…",
    "Creando trabajo de exportación…",
    "transientErrors>=5",
    "{job&&",
)
missing = [item for item in required if item not in source]
if missing:
    raise SystemExit("Validación HF12 BackOffice fallida: " + ", ".join(missing))

backup = TARGET.with_suffix(TARGET.suffix + ".hf12.bak")
if not backup.exists():
    backup.write_text(original, encoding="utf-8")

TARGET.write_text(source, encoding="utf-8")

print("HF12 BackOffice aplicado.")
print("Modificado:", TARGET.relative_to(ROOT))
print("Respaldo:", backup.relative_to(ROOT))
