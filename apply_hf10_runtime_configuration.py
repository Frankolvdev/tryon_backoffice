#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import re

ROOT = Path.cwd()
MEGA3 = ROOT / "src/components/runtime-builder/runtime-mega3-panel.tsx"
SRC = ROOT / "src"

if not MEGA3.exists():
    raise SystemExit(
        "No se encontró src/components/runtime-builder/runtime-mega3-panel.tsx. "
        "Ejecuta este instalador desde la raíz de tryon_backoffice."
    )

modified: list[Path] = []

def save(path: Path, before: str, after: str) -> None:
    if before == after:
        return
    backup = path.with_suffix(path.suffix + ".hf10.bak")
    if not backup.exists():
        backup.write_text(before, encoding="utf-8")
    path.write_text(after, encoding="utf-8")
    modified.append(path)

text = MEGA3.read_text(encoding="utf-8")
original = text

old_save = 'const save=async()=>{if(!settings)return;setBusy(true);try{await Promise.all([browserApiRequest("/api/admin/runtime-builder/models-volume/settings",{method:"PUT",body:JSON.stringify(settings)}),browserApiRequest("/api/admin/runtime-builder/runtime-launch/settings",{method:"PUT",body:JSON.stringify(launch)})]);toast.success("Configuración persistida.")}catch(e){toast.error(e instanceof Error?e.message:"No se pudo guardar.")}finally{setBusy(false)}};'

new_save = 'const save=async()=>{if(!settings)return;setBusy(true);try{const [savedSettings,savedLaunch]=await Promise.all([browserApiRequest<RuntimeModelExportSettings>("/api/admin/runtime-builder/models-volume/settings",{method:"PUT",body:JSON.stringify(settings)}),browserApiRequest<RuntimeLaunchSettings>("/api/admin/runtime-builder/runtime-launch/settings",{method:"PUT",body:JSON.stringify(launch)})]);setSettings(savedSettings);setLaunch(savedLaunch);toast.success("Configuración persistida.")}catch(e){toast.error(e instanceof Error?e.message:"No se pudo guardar.")}finally{setBusy(false)}};'

if old_save in text:
    text = text.replace(old_save, new_save, 1)
elif "setLaunch(savedLaunch)" not in text:
    raise SystemExit(
        "No se encontró el bloque save esperado en runtime-mega3-panel.tsx. "
        "No se modificó ningún archivo."
    )

save(MEGA3, original, text)

for path in SRC.rglob("*.tsx"):
    before = path.read_text(encoding="utf-8")
    after = before

    for label in ("Nombre visible", "Nombre técnico", "Nombre técnico del runtime"):
        escaped = re.escape(label)
        for pattern in (
            re.compile(rf'<(?:Text|Input|FormField)\s+label="{escaped}"[^>]*/>\s*', re.DOTALL),
            re.compile(rf'<Field\s+label="{escaped}"[^>]*>.*?</Field>\s*', re.DOTALL),
            re.compile(rf'<label[^>]*>\s*{escaped}\s*</label>\s*<input[^>]*/?>\s*', re.DOTALL),
        ):
            after = pattern.sub("", after)

    save(path, before, after)

if "setLaunch(savedLaunch)" not in MEGA3.read_text(encoding="utf-8"):
    raise SystemExit("Validación HF10 BackOffice fallida.")

print("HF10 BackOffice aplicado correctamente.")
if modified:
    for path in modified:
        print("Modificado:", path.relative_to(ROOT))
else:
    print("Los cambios ya estaban aplicados.")
